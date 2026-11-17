import type { Program } from '../content/types'

export const calendarFixtures: Extract<Program, { startsAt: string }>[] = [
  { id: 'raga-evening', title: 'An evening in raga', artForm: 'Carnatic music', startsAt: '2026-12-06T17:30:00+05:30', endsAt: '2026-12-06T20:00:00+05:30', venue: 'Test venue', description: 'Timed concert fixture.', sample: true },
  { id: 'rhythm-roots', title: 'Rhythm & roots', artForm: 'Bharatanatyam', startsAt: '2026-12-13T18:00:00+05:30', endsAt: '2026-12-13T20:00:00+05:30', venue: 'Test venue', description: 'Dance fixture.', sample: true },
  { id: 'winter-mehfil', title: 'The winter mehfil', artForm: 'Hindustani music', startsAt: '2026-12-13T10:00:00+05:30', endsAt: '2026-12-13T12:00:00+05:30', venue: 'Test venue', description: 'Same-day morning fixture.', sample: true },
]
