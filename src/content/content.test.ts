/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { events } from './events'
import { sponsors } from './sponsors'
import { archiveEvents } from './sampleArchive'
import { albums } from './gallery'
import { artForms, artImage, assetUrl, site } from './site'
import { trustees } from './trustees'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('site content', () => {
  it('uses the correct brand in initial page metadata', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    const document = new DOMParser().parseFromString(html, 'text/html')
    expect(document.title).toBe('Kalavedike | Bringing the Arts Closer to Home')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Kalavedike brings Indian classical music and dance closer to home for Sarjapur Road and surrounding neighbourhoods in Bengaluru.')
  })

  it('loads the editable calendar and requires every configured photo and sponsor logo to exist', () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length)
    for (const event of events) {
      expect(event.sample).toBe(false)
      if (event.photo) expect(existsSync(join(process.cwd(), 'public', event.photo)), `Missing event photo: public/${event.photo}`).toBe(true)
    }
    for (const sponsor of sponsors) {
      if (!sponsor.placeholder) expect(existsSync(join(process.cwd(), 'public', sponsor.logo)), `Missing sponsor logo: public/${sponsor.logo}`).toBe(true)
    }
  })

  it('retains the separate development gallery archive as explicitly sample-only', () => {
    expect(archiveEvents).toHaveLength(5)
    for (const event of archiveEvents) {
      expect(event.sample).toBe(true)
      if (event.startsAt === undefined || event.endsAt === undefined) throw new Error('Sample gallery archive uses timed events')
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
      expect(trustee.bio).toContain(`${trustee.name} is a trustee of Kalavedike.`)
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
