import { Link } from 'react-router-dom'
import { trustees } from '../content/trustees'
import { about } from '../content/about'
import { artImage, site } from '../content/site'
import { Artwork } from '../components/Artwork'
import { SampleBadge } from '../components/SampleBadge'
import { VisionStatement } from '../components/VisionStatement'

export function AboutPage() {
  return (
    <>
      <section className="page-intro about-intro container">
        <p className="eyebrow">{site.tagline}</p>
        <h1>About <em>{site.name}</em></h1>
        <p>{about.subtitle}</p>
      </section>

      <section className="about-story container" aria-label="Why Kalavedike began">
        <div className="about-art">
          <Artwork src={artImage('Odissi')} alt="Face-free Odissi-inspired artwork with flowing lines and temple motifs" eager />
          <span className="image-footnote">Original illustration inspired by our classical traditions</span>
        </div>
        <div className="about-copy">
          <h2>Bringing the arts <br />closer to <em>home.</em></h2>
          {about.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section className="about-narrative container" aria-labelledby="story-title">
        <p className="eyebrow">A shared passion. A collective initiative.</p>
        <h2 id="story-title">Our <em>Story</em></h2>
        {about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      <section className="about-values section-pad" aria-labelledby="about-vision-title">
        <div className="container about-narrative">
          <p className="eyebrow">A vision for the community</p>
          <h2 id="about-vision-title">Our <em>Vision</em></h2>
          <VisionStatement />
        </div>
      </section>

      <section className="about-narrative container section-pad" aria-labelledby="offerings-title">
        <p className="eyebrow">Celebrating our artistic traditions</p>
        <h2 id="offerings-title">What We <em>Do</em></h2>
        <p>{about.offeringsIntroduction}</p>
        <ul className="offering-list">{about.offerings.map((offering) => <li key={offering}>{offering}</li>)}</ul>
        <p>{about.offeringsConclusion}</p>
      </section>

      <section className="container section-pad" aria-labelledby="trustees-heading">
        <div className="section-heading">
          <div><p className="eyebrow">The people behind the purpose</p><h2 id="trustees-heading">Meet our <em>trustees.</em></h2></div>
          <p className="heading-note">United by a passion for the arts <br />and a commitment to our neighbourhood.</p>
        </div>
        <p className="trustee-introduction">The founding members form the trust that guides {site.name}, bringing together their love for Indian classical performing arts and their commitment to the community.</p>
        <p className="trustee-profile-note">These introductions reflect the trust's shared purpose. Individual biographies and photographs will be added when available.</p>
        {trustees.length > 0 ? (
          <div className="trustee-grid">{trustees.map((trustee) => (
            <article className="trustee-card" key={trustee.id}>
              <div className="trustee-photo-placeholder" role="img" aria-label={`Photo placeholder for ${trustee.name}`}><span className="trustee-initials" aria-hidden="true">{trustee.name.split(' ').map((part) => part[0]).join('')}</span><span className="trustee-photo-label" aria-hidden="true">Photo to follow</span></div>
              <p className="eyebrow">{trustee.role}</p><h3>{trustee.name}</h3><p>{trustee.bio}</p>
              {trustee.sample && <SampleBadge>Sample profile</SampleBadge>}
            </article>
          ))}</div>
        ) : <p className="content-note">Trustee names and individual biographies will be shared here when available.</p>}
      </section>

      <section className="community-callout about-join container" aria-labelledby="join-title">
        <p className="eyebrow">Everyone is welcome</p>
        <h2 id="join-title">Join Us on <br />This <em>Journey</em></h2>
        {about.join.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <Link to="/events" className="button button-primary">Explore our programs <span aria-hidden="true">&#8599;</span></Link>
        <p className="community-signature">{site.name} | {site.signature}</p>
      </section>
    </>
  )
}
