import type { Program } from '../content/types'
import { SampleBadge } from './SampleBadge'

export function ProgramStatus({ event }: { event: Program }) {
  if (event.sample) return <SampleBadge />
  if (event.tentative) return <SampleBadge>Proposed date</SampleBadge>
  return null
}
