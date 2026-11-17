import { artForms } from './site'
import type { Program, Sponsor } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown, path: string, fields: string[]) {
  if (!isRecord(value)) throw new Error(`${path}: expected an object.`)
  for (const key of Object.keys(value)) {
    if (!fields.includes(key)) throw new Error(`${path}.${key}: unknown field. Check its spelling.`)
  }
  return value
}

function text(value: Record<string, unknown>, key: string, path: string, required = false): string {
  const field = value[key]
  if (field === undefined && !required) return ''
  if (typeof field !== 'string' || (required && !field.trim())) throw new Error(`${path}.${key}: expected ${required ? 'a non-empty' : 'a'} string.`)
  return field.trim()
}

function flag(value: Record<string, unknown>, key: string, path: string) {
  if (value[key] === undefined) return false
  if (typeof value[key] !== 'boolean') throw new Error(`${path}.${key}: use true or false, without quotes.`)
  return value[key]
}

function validDate(value: string, path: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error(`${path}: use a valid date in YYYY-MM-DD format.`)
  }
  return value
}

function validTime(value: string, path: string) {
  if (value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error(`${path}: use 24-hour HH:mm, or an empty string when unknown.`)
  return value
}

function isHttpsUrl(value: string): value is `https://${string}` {
  if (!value.startsWith('https://') || !URL.canParse(value)) return false
  const url = new URL(value)
  return url.protocol === 'https:' && !url.username && !url.password
}

function website(value: string, path: string) {
  if (!isHttpsUrl(value)) throw new Error(`${path}: use a complete https:// website URL without credentials.`)
  return value
}

function image(value: string, path: string) {
  if (value && !/^assets\/(?:[a-z0-9_-]+\/)*[a-z0-9][a-z0-9._-]*\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(value)) {
    throw new Error(`${path}: use a local image path such as assets/events/concert.jpg, without public/ or a leading slash.`)
  }
  return value
}

function entries(input: unknown, file: string, fields: string[]) {
  if (!Array.isArray(input)) throw new Error(`${file}: expected an array of records.`)
  const ids = new Set<string>()
  return input.map((item: unknown, index: number) => {
    const path = `${file}[${index}]`
    const value = record(item, path, fields)
    const id = text(value, 'id', path, true)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`${path}.id: use lowercase words or numbers separated by hyphens.`)
    if (ids.has(id)) throw new Error(`${path}.id: duplicate ID "${id}".`)
    ids.add(id)
    return { value, path, id }
  })
}

export function parseEvents(input: unknown): Program[] {
  return entries(input, 'events.json', ['id', 'title', 'artForm', 'date', 'time', 'endTime', 'endDate', 'venue', 'description', 'tentative', 'artists', 'photo', 'photoAlt']).map(({ value, path, id }) => {
    const artForm = artForms.find((form) => form.name === value.artForm)?.name
    if (!artForm) throw new Error(`${path}.artForm: choose ${artForms.map((form) => form.name).join(', ')}.`)
    const date = validDate(text(value, 'date', path, true), `${path}.date`)
    const time = validTime(text(value, 'time', path), `${path}.time`)
    const endTime = validTime(text(value, 'endTime', path), `${path}.endTime`)
    const endDate = text(value, 'endDate', path)
    if (endDate) validDate(endDate, `${path}.endDate`)
    if ((endTime && !time) || (endDate && (!time || !endTime))) throw new Error(`${path}: endTime needs time; endDate also needs endTime.`)
    const artists = value.artists === undefined ? [] : value.artists
    if (!Array.isArray(artists)) throw new Error(`${path}.artists: expected an array.`)
    const details = {
      id,
      title: text(value, 'title', path, true),
      artForm,
      venue: text(value, 'venue', path) || 'Venue to be announced',
      description: text(value, 'description', path),
      tentative: flag(value, 'tentative', path),
      sample: false,
      artists: artists.map((artist: unknown, index: number) => {
        const artistPath = `${path}.artists[${index}]`
        const person = record(artist, artistPath, ['name', 'url'])
        const name = text(person, 'name', artistPath, true)
        const url = text(person, 'url', artistPath)
        return { name, ...(url ? { url: website(url, `${artistPath}.url`) } : {}) }
      }),
      photo: image(text(value, 'photo', path), `${path}.photo`),
      photoAlt: text(value, 'photoAlt', path),
    }
    if (!time) return { ...details, date }
    const startsAt = `${date}T${time}:00+05:30`
    if (!endTime) return { ...details, startsAt }
    const endsAt = `${endDate || date}T${endTime}:00+05:30`
    if (Date.parse(endsAt) <= Date.parse(startsAt)) throw new Error(`${path}.endTime: the end must be after the start. Use endDate for an overnight program.`)
    return { ...details, startsAt, endsAt }
  })
}

export function parseSponsors(input: unknown): Sponsor[] {
  return entries(input, 'sponsors.json', ['id', 'name', 'bio', 'website', 'logo', 'placeholder']).map(({ value, path, id }) => {
    const common = { id, name: text(value, 'name', path, true), description: text(value, 'bio', path, true) }
    const logo = image(text(value, 'logo', path), `${path}.logo`)
    const url = text(value, 'website', path)
    if (flag(value, 'placeholder', path)) {
      if (logo || url) throw new Error(`${path}: set placeholder to false before adding a real logo or website.`)
      return { ...common, placeholder: true }
    }
    if (!logo) throw new Error(`${path}.logo: a confirmed sponsor needs a local logo image.`)
    return { ...common, placeholder: false, website: website(url, `${path}.website`), logo }
  })
}
