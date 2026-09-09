import type { Connection } from "mongoose";
import {
  deleteFromBlob,
  getBlobNameFromUrl,
  listAllBlobs,
} from "@/lib/azureBlob";
import { collectBlobUrls } from "./collectBlobUrls";

/**
 * Garbage-collect orphaned blobs: files in storage whose URL is not referenced
 * by any document in the database and that are older than a grace period.
 *
 * This is the ONLY thing that ever deletes a stored image. The database is the
 * source of truth; anything it doesn't point at (and that's had time to be
 * saved) is garbage.
 *
 * Designed to be safe to run on a schedule against a live app:
 *  - streamed listing + cursor scans, no full buffering of documents
 *  - bounded delete concurrency
 *  - per-run caps on deletions and wall-clock time (resumes next run)
 *  - a Mongo lock so overlapping runs don't pile up
 *  - blobs listed BEFORE the DB scan, so a save mid-sweep can't be missed
 */

const LOCK_COLLECTION = "blobgc";
const LOCK_TTL_MS = 10 * 60_000;

const DEFAULT_SKIP_COLLECTIONS = new Set([
  LOCK_COLLECTION,
  "admins",
  "sessions",
  "users",
]);

export type SweepOptions = {
  /** Delete unreferenced blobs older than this many hours. Default 48. */
  graceHours?: number;
  /** Stop after this many deletions; resume next run. Default 1000. */
  maxDeletions?: number;
  /** Stop scheduling deletes after this many ms. Default 60000. */
  timeBudgetMs?: number;
  /** Parallel delete requests. Default 8. */
  concurrency?: number;
  /** List orphan candidates but don't delete. Default false. */
  dryRun?: boolean;
  /** Collection names to skip, on top of the defaults. */
  skipCollections?: string[];
};

export type SweepReport = {
  dryRun: boolean;
  done: boolean;
  reason: string;
  blobsScanned: number;
  referencedUrls: number;
  orphansFound: number;
  deleted: string[];
  errors: { name: string; error: string }[];
};

function envInt(name: string): number | undefined {
  const raw = process.env[name];
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

async function acquireLock(conn: Connection): Promise<boolean> {
  const now = Date.now();
  const lock = conn.db?.collection<{ _id: string; expiresAt: Date }>(
    LOCK_COLLECTION,
  );
  if (!lock) return false;
  try {
    await lock.updateOne(
      { _id: "lock", expiresAt: { $lt: new Date(now) } },
      { $set: { expiresAt: new Date(now + LOCK_TTL_MS), startedAt: new Date(now) } },
      { upsert: true },
    );
    return true;
  } catch (err) {
    // Duplicate-key => a live lock already exists.
    if (err && typeof err === "object" && (err as { code?: number }).code === 11000) {
      return false;
    }
    throw err;
  }
}

async function releaseLock(conn: Connection): Promise<void> {
  await conn.db
    ?.collection<{ _id: string; expiresAt: Date }>(LOCK_COLLECTION)
    .updateOne({ _id: "lock" }, { $set: { expiresAt: new Date(0) } });
}

/** Minimal concurrency-limited runner — no dependency. */
async function runLimited<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export async function sweepOrphanBlobs(
  conn: Connection,
  options: SweepOptions = {},
): Promise<SweepReport> {
  const graceMs =
    (options.graceHours ?? envInt("BLOB_GC_GRACE_HOURS") ?? 48) * 3_600_000;
  const maxDeletions = options.maxDeletions ?? envInt("BLOB_GC_MAX_DELETIONS") ?? 1000;
  const timeBudgetMs = options.timeBudgetMs ?? 60_000;
  const concurrency = options.concurrency ?? 8;
  const dryRun = options.dryRun ?? false;
  const skip = new Set([
    ...DEFAULT_SKIP_COLLECTIONS,
    ...(options.skipCollections ?? []),
    ...(process.env.BLOB_GC_SKIP_COLLECTIONS?.split(",").map((s) => s.trim()) ?? []),
  ]);

  const report: SweepReport = {
    dryRun,
    done: false,
    reason: "",
    blobsScanned: 0,
    referencedUrls: 0,
    orphansFound: 0,
    deleted: [],
    errors: [],
  };

  const gotLock = await acquireLock(conn);
  if (!gotLock) {
    report.reason = "another sweep is already running";
    return report;
  }

  try {
    const deadline = Date.now() + timeBudgetMs;
    const cutoff = new Date(Date.now() - graceMs);

    // Compare by blob NAME, not URL, to sidestep percent-encoding differences
    // between a listed blob name and a stored (encoded) URL.

    // 1. List blobs first. Candidates = old enough to have been saved by now.
    const candidates = new Set<string>(); // blob names
    for await (const blob of listAllBlobs()) {
      report.blobsScanned++;
      if (blob.lastModified >= cutoff) continue;
      candidates.add(blob.name);
    }

    // 2. Build the set of referenced blob names from every content collection.
    const referencedUrls = new Set<string>();
    const collections = (await conn.db?.collections()) ?? [];
    for (const coll of collections) {
      if (skip.has(coll.collectionName)) continue;
      const cursor = coll.find({}, { batchSize: 200 });
      for await (const doc of cursor) {
        collectBlobUrls(doc, referencedUrls);
      }
    }
    const referencedNames = new Set<string>();
    for (const url of referencedUrls) {
      try {
        referencedNames.add(getBlobNameFromUrl(url));
      } catch {
        /* not a parseable blob URL — ignore */
      }
    }
    report.referencedUrls = referencedUrls.size;

    // 3. Orphans = old candidates the DB doesn't reference.
    const orphans: string[] = [];
    for (const name of candidates) {
      if (!referencedNames.has(name)) orphans.push(name);
    }
    report.orphansFound = orphans.length;

    const toDelete = orphans.slice(0, maxDeletions);
    let timedOut = false;

    await runLimited(toDelete, concurrency, async (name) => {
      if (Date.now() > deadline) {
        timedOut = true;
        return;
      }
      if (dryRun) {
        report.deleted.push(name);
        return;
      }
      try {
        await deleteFromBlob(name);
        report.deleted.push(name);
      } catch (err) {
        report.errors.push({
          name,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    report.done =
      !timedOut && orphans.length <= maxDeletions && report.errors.length === 0;
    report.reason = report.done
      ? "complete"
      : timedOut
        ? "stopped on time budget; run again to continue"
        : orphans.length > maxDeletions
          ? "stopped on deletion cap; run again to continue"
          : "completed with errors";

    return report;
  } finally {
    await releaseLock(conn).catch(() => {});
  }
}
