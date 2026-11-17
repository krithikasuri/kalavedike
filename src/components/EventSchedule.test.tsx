import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventSchedule } from './EventSchedule'
import { events } from '../content/events'
import { calendarFixtures } from '../test/programFixtures'
import type { Program } from '../content/types'

const now = new Date('2026-11-17T04:30:00Z')

describe('event season overview', () => {
  it('shows all twelve real program dates together without empty calendar days', () => {
    const { container } = render(<EventSchedule programs={events} now={now} onSelect={vi.fn()} />)
    const list = screen.getByRole('list', { name: 'Programs for 2027' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(12)
    expect([...list.querySelectorAll('time')].map((time) => time.dateTime)).toEqual(events.map((event) => event.date))
    expect(screen.getByRole('region', { name: '2027 season' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getAllByText('Next up')).toHaveLength(1)
    expect(screen.getAllByText('Time to be announced')).toHaveLength(12)
    expect(container).not.toHaveTextContent('12:00')
  })

  it('filters music and dance with accurate counts and selectable programs', () => {
    const onSelect = vi.fn()
    render(<EventSchedule programs={events} now={now} selectedId={events[5].id} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Music 7' }))
    const list = screen.getByRole('list', { name: 'Programs for 2027' })
    expect(within(list).getAllByRole('button')).toHaveLength(7)
    const selected = within(list).getByRole('button', { pressed: true })
    expect(selected).toHaveTextContent('Hindustani Vocal')
    expect(selected).toHaveAttribute('aria-controls', 'event-details')
    fireEvent.click(selected)
    expect(onSelect).toHaveBeenLastCalledWith(events[5])
    fireEvent.click(screen.getByRole('button', { name: 'Dance 5' }))
    expect(within(list).getAllByRole('button')).toHaveLength(5)
    expect(screen.getByRole('status')).toHaveTextContent('5 programs')
    fireEvent.click(screen.getByRole('button', { name: 'All programs 12' }))
    expect(within(list).getAllByRole('button')).toHaveLength(12)
  })

  it('keeps every same-day timed program once, sorted by start time in IST', () => {
    render(<EventSchedule programs={calendarFixtures} now={now} onSelect={vi.fn()} />)
    const buttons = within(screen.getByRole('list')).getAllByRole('button')
    expect(buttons.map((button) => button.querySelector('.program-title')?.textContent)).toEqual([
      'An evening in raga', 'The winter mehfil', 'Rhythm & roots',
    ])
    expect(buttons[1]).toHaveTextContent('10:00 am IST')
    expect(buttons[2]).toHaveTextContent('6:00 pm IST')
  })

  it('shows a cross-year program once in each occupied season with its full range', () => {
    const event: Program = { ...calendarFixtures[0], startsAt: '2026-12-31T23:00:00+05:30', endsAt: '2027-01-02T01:00:00+05:30' }
    render(<EventSchedule programs={[event]} now={now} initialEvent={event} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '2026 season' })).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('list')).toHaveTextContent('31 December 2026, 11:00 pm - 2 January 2027, 1:00 am IST')
    fireEvent.change(screen.getByRole('combobox', { name: 'Program year' }), { target: { value: '2027' } })
    expect(screen.getByRole('heading', { name: '2027 season' })).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('list').querySelector('.program-date')).toHaveTextContent('Dec312026')
  })

  it('opens a linked season rather than an unrelated upcoming year', () => {
    render(<EventSchedule programs={[...calendarFixtures, ...events]} now={now} initialEvent={events[0]} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '2027 season' })).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('button')).toHaveLength(12)
  })

  it('offers a clear reset for an empty category and an honest empty dataset', () => {
    const view = render(<EventSchedule programs={[events[0]]} now={now} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dance 0' }))
    expect(screen.getByText('No dance programs are listed for 2027.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Show all programs/ }))
    expect(within(screen.getByRole('list')).getAllByRole('button')).toHaveLength(1)
    view.unmount()
    render(<EventSchedule programs={[]} now={now} onSelect={vi.fn()} />)
    expect(screen.getByText('No programs have been listed yet. Please check back for future announcements.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Filter programs' })).not.toBeInTheDocument()
  })

  it('keeps a date-only proposal upcoming through its IST date without claiming it happened', () => {
    const view = render(<EventSchedule programs={[events[0]]} now={new Date('2027-01-23T18:29:59Z')} onSelect={vi.fn()} />)
    expect(screen.getByText('Next up')).toBeInTheDocument()
    view.rerender(<EventSchedule programs={[events[0]]} now={new Date('2027-01-23T18:30:00Z')} onSelect={vi.fn()} />)
    expect(screen.getByText('Date passed')).toBeInTheDocument()
    expect(screen.queryByText('Next up')).not.toBeInTheDocument()
    expect(screen.getByText('Proposed date')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2027 season' })).toBeInTheDocument()
  })

  it('does not strand the view in an unavailable year after a schedule refresh', () => {
    const view = render(<EventSchedule programs={events} now={now} onSelect={vi.fn()} />)
    const source = events[0]
    if (source.date === undefined) throw new Error('Expected a date-only spreadsheet program')
    const nextSeason: Program = { ...source, date: '2028-01-22' }
    view.rerender(<EventSchedule programs={[nextSeason]} now={now} onSelect={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '2028 season' })).toBeInTheDocument()
    expect(within(screen.getByRole('list')).getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
