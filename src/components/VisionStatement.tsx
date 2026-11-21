import { site } from '../content/site'

export function VisionStatement() {
  return (
    <div className="vision-statement">
      <p>{site.vision}</p>
      <p>{site.visionCommunity}</p>
      <p>{site.visionHeritage}</p>
      <p className="vision-aspiration"><strong>Our aspiration is simple:</strong> {site.aspiration}</p>
    </div>
  )
}
