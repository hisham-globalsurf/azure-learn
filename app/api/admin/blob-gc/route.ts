import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { sweepOrphanBlobs } from "@/lib/blob/sweepOrphanBlobs";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Orphan-blob garbage collection.
 *
 *   GET  /api/admin/blob-gc   -> dry run (lists what would be deleted)
 *   POST /api/admin/blob-gc   -> delete
 *
 * Auth: an admin session cookie, OR `Authorization: Bearer <BLOB_GC_SECRET>`
 * so a scheduler (GitHub Actions, cron) can call it without a login.
 *
 * Query overrides: ?graceHours=168&maxDeletions=500
 */
async function authorize(request: NextRequest): Promise<boolean> {
  const secret = process.env.BLOB_GC_SECRET;
  const header = request.headers.get("authorization");
  if (secret && header === `Bearer ${secret}`) return true;
  return verifyAdmin(request);
}

async function run(request: NextRequest, dryRun: boolean) {
  if (!(await authorize(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const num = (key: string) => {
    const raw = params.get(key);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  try {
    const conn = await connectDB();
    const report = await sweepOrphanBlobs(conn, {
      dryRun,
      graceHours: num("graceHours"),
      maxDeletions: num("maxDeletions"),
    });
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("[blob-gc] failed", error);
    return NextResponse.json({ message: "Sweep failed" }, { status: 500 });
  }
}

export const GET = (request: NextRequest) => run(request, true);
export const POST = (request: NextRequest) => run(request, false);
