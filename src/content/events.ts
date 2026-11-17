import data from './events.json'
import { parseEvents } from './parseContent'

export const events = parseEvents(data)
