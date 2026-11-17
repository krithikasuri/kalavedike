import { describe, expect, it } from 'vitest'
import { parseEvents, parseSponsors } from './parseContent'

const event = {
  id: 'community-concert',
  title: 'Community concert',
  artForm: 'Carnatic music',
  date: '2027-01-23',
  time: '18:30',
  endTime: '20:00',
  venue: 'Community hall',
  artists: [{ name: 'Test performer', url: 'https://example.com/artist' }],
  photo: 'assets/illustrations/carnatic.svg',
  photoAlt: 'Instruments arranged on a concert stage',
  description: 'A classical music evening.',
  tentative: false,
}
const sponsor = { id: 'test-sponsor', name: 'Test sponsor', bio: 'A community supporter.', website: 'https://example.com', logo: 'assets/branding/mark.svg' }

describe('editable event JSON', () => {
  it('converts simple IST date/time fields and retains venue, artists and photo', () => {
    expect(parseEvents([event])[0]).toMatchObject({
      startsAt: '2027-01-23T18:30:00+05:30',
      endsAt: '2027-01-23T20:00:00+05:30',
      venue: event.venue, artists: event.artists, photo: event.photo, photoAlt: event.photoAlt,
      tentative: false, sample: false,
    })
  })

  it('supports date-only, start-only and overnight programs without invented times', () => {
    const dateOnly = parseEvents([{ ...event, time: '', endTime: '', venue: '', artists: [] }])[0]
    expect(dateOnly).toMatchObject({ date: event.date, venue: 'Venue to be announced', artists: [] })
    expect(dateOnly.startsAt).toBeUndefined()
    const startOnly = parseEvents([{ ...event, endTime: '' }])[0]
    expect(startOnly.startsAt).toContain('18:30')
    expect(startOnly.endsAt).toBeUndefined()
    expect(parseEvents([{ ...event, endDate: '2027-01-24', endTime: '01:00' }])[0].endsAt).toBe('2027-01-24T01:00:00+05:30')
    expect(parseEvents([{ ...event, date: '2028-02-29' }])).toHaveLength(1)
  })

  it('allows artist names without links and explicitly optional fields', () => {
    expect(parseEvents([{ id: event.id, title: event.title, artForm: event.artForm, date: event.date, artists: [{ name: 'Test performer' }] }])[0]).toMatchObject({
      artists: [{ name: 'Test performer' }], tentative: false, photo: '',
    })
    expect(parseEvents([])).toEqual([])
  })

  it.each([
    [{ date: '2027-02-29' }, '.date'],
    [{ date: '01/23/2027' }, '.date'],
    [{ time: '6:30 pm' }, '.time'],
    [{ time: '24:00' }, '.time'],
    [{ time: '', endTime: '20:00' }, 'endTime needs time'],
    [{ endTime: '17:00' }, 'end must be after'],
    [{ endTime: '18:30' }, 'end must be after'],
    [{ endDate: '2027-01-22' }, 'end must be after'],
    [{ endDate: '2027-01-24', endTime: '' }, 'endDate also needs'],
    [{ title: '' }, '.title'],
    [{ artForm: 'Unknown' }, '.artForm'],
    [{ tentative: 'false' }, '.tentative'],
    [{ artists: null }, '.artists'],
    [{ artists: [{ name: '' }] }, '.name'],
    [{ artists: [{ name: 'Artist', url: 'javascript:alert(1)' }] }, '.url'],
    [{ artists: [{ name: 'Artist', url: 'https://user:password@example.com' }] }, '.url'],
    [{ photo: '../secret.jpg' }, '.photo'],
    [{ photo: 'https://example.com/photo.jpg' }, '.photo'],
    [{ photo: 'assets/../secret.jpg' }, '.photo'],
    [{ timee: '18:30' }, '.timee'],
  ])('rejects invalid field updates %j with an actionable location', (update, message) => {
    expect(() => parseEvents([{ ...event, ...update }])).toThrow(message)
  })

  it('rejects duplicate IDs, unsafe IDs and non-array input', () => {
    expect(() => parseEvents([event, event])).toThrow('duplicate ID')
    expect(() => parseEvents([{ ...event, id: 'Wrong ID' }])).toThrow('.id')
    expect(() => parseEvents({ events: [event] })).toThrow('expected an array')
  })
})

describe('editable sponsor JSON', () => {
  it('maps bio to the displayed introduction and enables the approved logo and link', () => {
    expect(parseSponsors([sponsor])).toEqual([{ id: sponsor.id, name: sponsor.name, description: sponsor.bio, website: sponsor.website, logo: sponsor.logo, placeholder: false }])
    expect(parseSponsors([{ id: 'placeholder', name: 'Sponsor name', bio: 'Bio to follow.', placeholder: true }])[0].placeholder).toBe(true)
    expect(parseSponsors([])).toEqual([])
  })

  it.each([
    [{ website: 'http://example.com' }, '.website'],
    [{ website: '' }, '.website'],
    [{ logo: '' }, '.logo'],
    [{ logo: '/assets/logo.jpg' }, '.logo'],
    [{ bio: '' }, '.bio'],
    [{ placeholder: true }, 'placeholder to false'],
    [{ description: 'Wrong key' }, 'unknown field'],
  ])('rejects incomplete or unsafe sponsor updates %j', (update, message) => {
    expect(() => parseSponsors([{ ...sponsor, ...update }])).toThrow(message)
  })
})
