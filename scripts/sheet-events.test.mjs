// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { importSheetEvents, parseCsv, parseSheetDate, renderEventsJson } from './sheet-events.mjs'

const heading = 'Kala Vedike - Calendar of Events 2027,,,,,,,\n"Planning note: All dates and artists are proposals, not confirmed bookings.",,,,,,,\nDate,Month,Performance,Artist / Institution,One-line Description,YouTube Reference,Booking Status / Notes,Approximate amount\n'
const row = '"Sat, 23 Jan 2027",January,Carnatic Vocal 1,INTERNAL ARTIST,"INTERNAL BIO",https://example.com,INTERNAL NOTES,123456\n'

it('requires a locally configured source without changing the existing snapshot', () => {
  const destination = new URL('../src/content/events.json', import.meta.url)
  const before = readFileSync(destination, 'utf8')
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./sync-events.mjs', import.meta.url))], {
    env: { ...process.env, KALAVEDIKE_EVENTS_CSV_URL: '' },
    encoding: 'utf8',
  })

  expect(result.status).not.toBe(0)
  expect(result.stderr).toContain('Set KALAVEDIKE_EVENTS_CSV_URL')
  expect(readFileSync(destination, 'utf8')).toBe(before)
})

it('stages a successful spreadsheet import without overwriting manually maintained events', () => {
  const destination = new URL('../src/content/events.json', import.meta.url)
  const staging = new URL('../src/content/events.imported.json', import.meta.url)
  const before = readFileSync(destination, 'utf8')
  const previousImport = existsSync(staging) ? readFileSync(staging, 'utf8') : undefined
  const setup = `globalThis.fetch = async () => new Response(${JSON.stringify(heading + row)}, { headers: { 'content-type': 'text/csv' } });`
  try {
    const result = spawnSync(process.execPath, ['--import', `data:text/javascript,${encodeURIComponent(setup)}`, fileURLToPath(new URL('./sync-events.mjs', import.meta.url))], {
      env: { ...process.env, KALAVEDIKE_EVENTS_CSV_URL: 'https://example.com/events.csv' },
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('have not been overwritten')
    expect(readFileSync(destination, 'utf8')).toBe(before)
    expect(JSON.parse(readFileSync(staging, 'utf8'))).toHaveLength(1)
  } finally {
    if (previousImport !== undefined) writeFileSync(staging, previousImport)
    else rmSync(staging, { force: true })
  }
})

describe('spreadsheet CSV reader', () => {
  it('handles BOM, escaped quotes, quoted newlines, CRLF, and trailing empty cells', () => {
    expect(parseCsv('\uFEFFDate,Title,\r\n"Sat, 23 Jan 2027","A ""quoted""\nconcert",\r\n')).toEqual([
      ['Date', 'Title', ''], ['Sat, 23 Jan 2027', 'A "quoted"\nconcert', ''],
    ])
  })

  it('fails explicitly on malformed quoted fields', () => {
    expect(() => parseCsv('"unclosed')).toThrow('Unclosed quote')
    expect(() => parseCsv('bad"quote')).toThrow('Invalid quote')
    expect(() => parseCsv('"closed"extra')).toThrow('Unexpected text')
  })

  it('checks both the date and source weekday', () => {
    expect(parseSheetDate('Sat, 23 Jan 2027')).toBe('2027-01-23')
    expect(() => parseSheetDate('Sun, 23 Jan 2027')).toThrow('Invalid spreadsheet date')
    expect(() => parseSheetDate('Sat, 31 Feb 2027')).toThrow('Invalid spreadsheet date')
    expect(() => parseSheetDate('01/02/2027')).toThrow('Unsupported spreadsheet date')
  })
})

describe('public event whitelist', () => {
  it('imports date-only proposed programs while excluding artists, amounts, bios, links, notes and totals', () => {
    const programs = importSheetEvents(`${heading}${row},,,,,,,123456\n`)
    expect(programs).toEqual([{
      id: 'calendar-2027-01-23-carnatic-vocal-1',
      title: 'Carnatic Vocal 1',
      artForm: 'Carnatic music',
      description: 'A proposed Carnatic vocal program. Artist, time, and venue are to be announced.',
      date: '2027-01-23',
      venue: 'Venue to be announced',
      sample: false,
      tentative: true,
    }])
    const module = renderEventsJson(programs)
    expect(module).not.toMatch(/INTERNAL|123456|https:|startsAt|endsAt/)
    expect(JSON.parse(module)).toEqual([{
      ...programs[0], sample: undefined, time: '', endTime: '', artists: [], photo: '', photoAlt: '',
    }])
  })

  it('preserves stable IDs when source rows are reordered and sanitises internal performance suffixes', () => {
    const dance = '"Sat, 13 Feb 2027",February,Bharatanatyam 1 - external venue ticketed experiment,,,,,\n'
    const a = importSheetEvents(`${heading}${row}${dance}`)
    const b = importSheetEvents(`${heading}${dance}${row}`)
    expect(a).toEqual(b)
    expect(a[1].title).toBe('Bharatanatyam 1')
    expect(JSON.stringify(a)).not.toContain('ticketed experiment')
  })

  it('maps supported instrumental, Hindustani, and Kathak performances without choosing shortlisted artists', () => {
    const text = `${heading}"Sat, 13 Mar 2027",March,Carnatic Instrumental 1 \u2014 Veena,,,,,\n"Sat, 12 Jun 2027",June,Hindustani Vocal,,,,,\n"Sat, 21 Aug 2027",August,Other Classical Dance \u2014 Kathak,,,,,\n"Sat, 11 Sep 2027",September,Carnatic Instrumental 2 \u2014 Violin,,,,,\n`
    expect(importSheetEvents(text).map(({ title, artForm }) => [title, artForm])).toEqual([
      ['Carnatic Instrumental 1 - Veena', 'Carnatic music'],
      ['Hindustani Vocal', 'Hindustani music'],
      ['Kathak', 'Kathak'],
      ['Carnatic Instrumental 2 - Violin', 'Carnatic music'],
    ])
  })

  it('rejects changed source structure, missing dates, mismatched months, duplicates, unknown performances, and empty schedules', () => {
    expect(() => importSheetEvents('<html>Sign in</html>')).toThrow()
    expect(() => importSheetEvents(`${heading} ,January,Carnatic Vocal 1,,,,,\n`)).toThrow('Missing date or performance')
    expect(() => importSheetEvents(`${heading}${row.replace('January', 'February')}`)).toThrow('Month column')
    expect(() => importSheetEvents(`${heading}${row}${row}`)).toThrow('Duplicate events')
    expect(() => importSheetEvents(`${heading}${row.replace('Carnatic Vocal 1', 'Internal planning meeting')}`)).toThrow('Unrecognised performance')
    expect(() => importSheetEvents(heading)).toThrow('No spreadsheet events')
  })
})
