/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { events, eventSource } from './events'
import { archiveEvents } from './sampleArchive'
import { albums } from './gallery'
import { artForms, artImage, assetUrl, site } from './site'
import { trustees } from './trustees'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

describe('site content', () => {
  it('imports all twelve proposed dates from the 2027 spreadsheet without invented times', () => {
    expect(events).toHaveLength(12)
    expect(events.map((event) => event.date)).toEqual([
      '2027-01-23', '2027-02-13', '2027-03-13', '2027-04-10',
      '2027-05-08', '2027-06-12', '2027-07-10', '2027-08-21',
      '2027-09-11', '2027-10-16', '2027-11-13', '2027-12-11',
    ])
    expect(new Set(events.map((event) => event.id)).size).toBe(12)
    for (const event of events) {
      expect(event.sample).toBe(false)
      expect(event.tentative).toBe(true)
      expect(event.startsAt).toBeUndefined()
      expect(event.endsAt).toBeUndefined()
      expect(event.venue).toBe('Venue to be announced')
      expect(Object.keys(event).sort()).toEqual(['artForm', 'date', 'description', 'id', 'sample', 'tentative', 'title', 'venue'])
    }
    expect(Number.isFinite(Date.parse(eventSource.importedAt))).toBe(true)
    expect(eventSource.mode).toBe('snapshot')
  })

  it('keeps gallery samples out of the public event calendar', () => {
    expect(archiveEvents).toHaveLength(5)
    const calendarIds = new Set(events.map((event) => event.id))
    for (const event of archiveEvents) {
      expect(calendarIds.has(event.id)).toBe(false)
      expect(event.sample).toBe(true)
      if (event.startsAt === undefined) throw new Error('Sample gallery archive uses timed events')
      expect(Date.parse(event.startsAt)).toBeLessThan(Date.parse(event.endsAt))
    }
  })

  it('lists the five supplied trustees without inventing offices or personal biographies', () => {
    expect(trustees.map((trustee) => trustee.name)).toEqual([
      'Pallavi K Srinivasa', 'Roopa Sreedharan Madampath', 'Krithika Surianarayanan',
      'Shanthi Naresh', 'Tarini Basavaraju',
    ])
    expect(new Set(trustees.map((trustee) => trustee.id)).size).toBe(5)
    for (const trustee of trustees) {
      expect(trustee.role).toBe('Trustee')
      expect(trustee.sample).toBe(false)
      expect(trustee.bio).toContain(`${trustee.name} is a trustee of Kalavedhike.`)
      expect(trustee.bio.length).toBeGreaterThan(150)
    }
  })

  it('retains all requested art forms and local assets', () => {
    expect(existsSync(join(process.cwd(), 'public', site.logo))).toBe(true)
    expect(artForms).toHaveLength(5)
    for (const form of artForms) {
      expect([...events, ...archiveEvents].some((event) => event.artForm === form.name)).toBe(true)
      expect(existsSync(join(process.cwd(), 'public', 'assets', 'illustrations', `${form.image}.svg`))).toBe(true)
      expect(artImage(form.name)).toContain(`assets/illustrations/${form.image}.svg`)
    }
    expect(assetUrl('/assets/branding/mark.svg')).toBe(`${import.meta.env.BASE_URL}assets/branding/mark.svg`)
  })

  it('links every sample album to the separate archive and supplies accurate metadata', () => {
    expect(new Set(albums.map((album) => album.id)).size).toBe(albums.length)
    const imageIds = albums.flatMap((album) => album.images.map((image) => image.id))
    expect(new Set(imageIds).size).toBe(imageIds.length)
    for (const album of albums) {
      expect(archiveEvents.some((event) => event.id === album.eventId)).toBe(true)
      expect(album.images.length).toBeGreaterThan(0)
      for (const image of album.images) {
        expect(image.alt.length).toBeGreaterThan(20)
        expect(image.caption).toContain('not a photograph')
      }
    }
  })
})
