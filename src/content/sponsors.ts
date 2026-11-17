import data from './sponsors.json'
import { parseSponsors } from './parseContent'

export const sponsors = parseSponsors(data)
