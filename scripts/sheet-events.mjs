const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  let closedQuote = false
  const input = text.replace(/^\uFEFF/, '')
  for (let index = 0; index < input.length; index++) {
    const character = input[index]
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') { cell += '"'; index++ }
        else { quoted = false; closedQuote = true }
      } else cell += character
    } else if (character === '"') {
      if (cell || closedQuote) throw new Error('Invalid quote in spreadsheet CSV')
      quoted = true
    } else if (character === ',' || character === '\n' || character === '\r') {
      row.push(cell)
      cell = ''
      closedQuote = false
      if (character !== ',') {
        rows.push(row)
        row = []
        if (character === '\r' && input[index + 1] === '\n') index++
      }
    } else {
      if (closedQuote) throw new Error('Unexpected text after a quoted CSV field')
      cell += character
    }
  }
  if (quoted) throw new Error('Unclosed quote in spreadsheet CSV')
  if (cell || row.length || closedQuote) { row.push(cell); rows.push(row) }
  return rows
}

export function parseSheetDate(value) {
  const match = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})$/.exec(value)
  if (!match) throw new Error(`Unsupported spreadsheet date: ${value}`)
  const [, weekday, day, month, year] = match
  const monthIndex = months.indexOf(month)
  const parsed = new Date(Date.UTC(Number(year), monthIndex, Number(day)))
  if (monthIndex < 0 || parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== monthIndex || parsed.getUTCDate() !== Number(day) || weekdays[parsed.getUTCDay()] !== weekday) {
    throw new Error(`Invalid spreadsheet date or weekday: ${value}`)
  }
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day.padStart(2, '0')}`
}

function publicPerformance(value) {
  let match = /^Carnatic Vocal (\d+)$/i.exec(value)
  if (match) return { title: `Carnatic Vocal ${match[1]}`, artForm: 'Carnatic music', description: 'A proposed Carnatic vocal program. Artist, time, and venue are to be announced.' }
  match = /^Carnatic Instrumental (\d+)\s*[-\u2013\u2014]\s*(Veena|Violin)$/i.exec(value)
  if (match) {
    const instrument = match[2].toLowerCase()
    return { title: `Carnatic Instrumental ${match[1]} - ${instrument === 'veena' ? 'Veena' : 'Violin'}`, artForm: 'Carnatic music', description: `A proposed Carnatic ${instrument} program. Artist, time, and venue are to be announced.` }
  }
  match = /^Bharatanatyam (\d+)(?:\s*[-\u2013\u2014]\s*external venue ticketed experiment)?$/i.exec(value)
  if (match) return { title: `Bharatanatyam ${match[1]}`, artForm: 'Bharatanatyam', description: 'A proposed Bharatanatyam presentation. Artist or troupe, time, and venue are to be announced.' }
  if (/^Hindustani Vocal$/i.test(value)) return { title: 'Hindustani Vocal', artForm: 'Hindustani music', description: 'A proposed Hindustani vocal program. Artist, time, and venue are to be announced.' }
  if (/^Other Classical Dance\s*[-\u2013\u2014]\s*Kathak$/i.test(value)) return { title: 'Kathak', artForm: 'Kathak', description: 'A proposed Kathak presentation. Artist or troupe, time, and venue are to be announced.' }
  throw new Error(`Unrecognised performance type; review it before publishing: ${value}`)
}

export function importSheetEvents(text) {
  const rows = parseCsv(text)
  if (!rows.some((row) => row.some((value) => /all dates and artists are proposals/i.test(value)))) {
    throw new Error('The spreadsheet planning disclaimer changed; review its publication status before importing')
  }
  const headerIndex = rows.findIndex((row) => row[0]?.trim() === 'Date' && row[1]?.trim() === 'Month' && row[2]?.trim() === 'Performance')
  if (headerIndex < 0) throw new Error('Expected Date, Month, Performance spreadsheet columns')
  const header = rows[headerIndex]
  const dateIndex = header.indexOf('Date')
  const monthIndex = header.indexOf('Month')
  const performanceIndex = header.indexOf('Performance')
  const programs = []
  for (const [offset, row] of rows.slice(headerIndex + 1).entries()) {
    const dateText = row[dateIndex]?.trim() ?? ''
    const performance = row[performanceIndex]?.trim() ?? ''
    // Blank rows and amount-only totals are not event records.
    if (!dateText && !performance) continue
    if (!dateText || !performance) throw new Error(`Missing date or performance in spreadsheet row ${headerIndex + offset + 2}`)
    const date = parseSheetDate(dateText)
    const month = row[monthIndex]?.trim()
    const expectedMonth = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
    if (month !== expectedMonth) throw new Error(`Month column does not match ${dateText}`)
    const details = publicPerformance(performance)
    const id = `calendar-${date}-${details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`
    programs.push({ id, ...details, date, venue: 'Venue to be announced', sample: false, tentative: true })
  }
  if (!programs.length) throw new Error('No spreadsheet events found; existing calendar has not been replaced')
  const ids = programs.map((program) => program.id)
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate events in spreadsheet')
  return programs.sort((a, b) => a.date.localeCompare(b.date))
}

export function renderEventsJson(programs) {
  return `${JSON.stringify(programs.map(({ id, title, artForm, description, date, venue, tentative }) => ({ id, title, artForm, description, date, venue, tentative, time: '', endTime: '', artists: [], photo: '', photoAlt: '' })), null, 2)}\n`
}
