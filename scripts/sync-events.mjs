import { rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { importSheetEvents, renderEventsJson } from './sheet-events.mjs'

const source = process.env.KALAVEDIKE_EVENTS_CSV_URL
if (!source) throw new Error('Set KALAVEDIKE_EVENTS_CSV_URL in .env.local or your environment before syncing events. No calendar changes were made.')
const response = await fetch(source, { signal: AbortSignal.timeout(30_000) })
if (!response.ok) throw new Error(`Spreadsheet download failed: HTTP ${response.status}. Check the sheet's viewing permissions.`)
if (!response.headers.get('content-type')?.includes('text/csv')) throw new Error('The spreadsheet did not return CSV. Check viewing permissions; no calendar changes were made.')
const programs = importSheetEvents(await response.text())
const destination = resolve(import.meta.dirname, '..', 'src', 'content', 'events.imported.json')
const temporary = `${destination}.${process.pid}.tmp`
try {
  await writeFile(temporary, renderEventsJson(programs), 'utf8')
  await rename(temporary, destination)
} finally {
  await rm(temporary, { force: true })
}
console.log(`Imported ${programs.length} proposed programs into src/content/events.imported.json for review. Copy approved records into events.json manually; your published times, artists, photos and venues have not been overwritten. Internal planning fields were excluded.`)
