import type { Sponsor } from '../content/types'
import { assetUrl } from '../content/site'
import { Artwork } from './Artwork'

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const content = (
    <>
      <div className="sponsor-logo">
        {sponsor.placeholder
          ? <div className="sponsor-logo-placeholder" role="img" aria-label="Blank sponsor logo placeholder" />
          : <Artwork src={assetUrl(sponsor.logo)} alt={`${sponsor.name} logo`} unavailableLabel="Logo unavailable" />}
      </div>
      <div className="sponsor-card-body">
        {sponsor.placeholder && <p className="eyebrow">Sponsor placeholder</p>}
        <h3 id={`${sponsor.id}-title`}>{sponsor.name}</h3>
        <p>{sponsor.description}</p>
        <span className="sponsor-website">{sponsor.placeholder ? 'Website to be added' : <>Visit website <span aria-hidden="true">&#8599;</span><span className="sr-only"> (opens in a new tab)</span></>}</span>
      </div>
    </>
  )

  return (
    <article className={`sponsor-card${sponsor.placeholder ? ' sponsor-placeholder' : ''}`} aria-labelledby={`${sponsor.id}-title`}>
      {sponsor.placeholder
        ? <div className="sponsor-card-content">{content}</div>
        : <a className="sponsor-card-content" href={sponsor.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}>{content}</a>}
    </article>
  )
}
