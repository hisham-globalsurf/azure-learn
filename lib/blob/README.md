# Blob image lifecycle

A reusable pattern for uploading and removing images so a stored URL and the
actual blob can never drift apart — even if the admin refreshes, closes the
tab, or abandons an edit.

## The rule

> The database is the only source of truth for which blobs are live.
> The browser never deletes anything.
> A scheduled sweep deletes blobs the DB doesn't reference.

No status tags, no per-route wiring, no Mongoose hooks, no storage lifecycle
policy. Three moving parts:

| Piece | File |
| --- | --- |
| Upload (auth-guarded) | `app/api/admin/upload/route.ts` |
| The sweep | `lib/blob/sweepOrphanBlobs.ts` (+ helpers in `lib/azureBlob.ts`, `lib/blob/collectBlobUrls.ts`) |
| Trigger endpoint | `app/api/admin/blob-gc/route.ts` |
| Schedule | `.github/workflows/blob-gc.yml` |

## Flow

1. **Upload** (`POST /api/admin/upload`, on file drop) → blob written, URL
   returned, held in form state only.
2. **Remove** (✕) → clears the form field client-side. Nothing else.
3. **Save** → the page's existing `PATCH` route writes the document. **No
   changes to page routes.**
4. **Sweep** (`POST /api/admin/blob-gc`, on a schedule) → lists all blobs,
   scans every content collection for referenced URLs, deletes blobs that are
   **unreferenced AND older than the grace period** (default 48h).

### Why the "refresh before submit" bug is gone

The only thing that ever deletes a blob is the sweep, and the sweep only
deletes what the DB doesn't reference. ✕ touches nothing in storage, so a
refresh just reloads a still-valid URL.

## Running the sweep

`GET /api/admin/blob-gc` = dry run · `POST` = delete.
Auth: an admin cookie, or `Authorization: Bearer $BLOB_GC_SECRET`.

**Recommended trigger:** the `blob-gc.yml` GitHub Actions workflow (weekly).
Set repo secrets `BLOB_GC_URL` and `BLOB_GC_SECRET`, and set `BLOB_GC_SECRET`
as an app setting on the Web App. Run it manually first with *Dry run* checked.

### Load safety

- Streamed blob listing + Mongo cursors — documents are never all buffered.
- Delete concurrency capped (8).
- Per-run caps: `maxDeletions` (1000) and a 60s time budget. It stops cleanly
  with `done: false`; the next run continues.
- A Mongo lock (`blobgc` collection) makes overlapping runs no-ops.
- Blobs are listed **before** the DB scan, so a save during the sweep is still
  counted as a reference.
- Skips `admins` / `sessions` / `users` / the lock collection.

### Tuning

| Env var | Default | Notes |
| --- | --- | --- |
| `BLOB_GC_SECRET` | — | Required for scheduler auth |
| `BLOB_GC_GRACE_HOURS` | 48 | Raise to 168 (7d) if editing sessions are long |
| `BLOB_GC_MAX_DELETIONS` | 1000 | Per-run cap |
| `BLOB_GC_SKIP_COLLECTIONS` | — | Extra comma-separated collection names to skip |

### The one tradeoff

A removed image's blob survives until the next sweep (hours/days), not
instantly. For a content admin that's just idle storage. If you ever need
instant cleanup, add a Mongoose `post('findOneAndUpdate')` plugin in
`lib/mongodb.ts` that diffs `collectBlobUrls(before)` vs `collectBlobUrls(after)`
— one file, one line, still no page-route changes.

### Scale note

The sweep loads documents from every content collection to find referenced
URLs. Fine for CMS-style data (a handful of singleton docs). If a project grows
a large image-bearing collection (thousands of docs), the scan gets heavier —
still fine weekly, just not every minute.

## Reusing in another project

Copy `lib/azureBlob.ts`, `lib/blob/`, `app/api/admin/blob-gc/route.ts`, and
`.github/workflows/blob-gc.yml`. Add `verifyAdmin` to the upload route. Nothing
else. `VideoUploader` / `FileUploader` need no special handling — same URLs,
same sweep.
