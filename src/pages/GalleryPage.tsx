import { site } from '../content/site'

export function GalleryPage() {
  return (
    <section className="page-intro container">
      <p className="eyebrow">Our shared artistic heritage</p>
      <h1>Celebrating art. <br />Building <em>community.</em></h1>
      <p>Visit our Instagram page for photos and updates from Kalavedike.
        <span className="gallery-instagram">
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="button button-primary">View on Instagram <span aria-hidden="true">&#8599;</span><span className="sr-only"> (opens in a new tab)</span></a>
          <span>{site.instagramHandle}</span>
        </span>
      </p>
    </section>
  )
}
