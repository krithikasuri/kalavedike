import { site } from '../content/site'

export function ContactPage() {
  const email = site.email.trim()

  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Bringing the arts closer to home</p>
        <h1>Contact <em>us</em></h1>
        <p>We would love to hear from you about our programs, the arts, or being part of our neighbourhood community.</p>
      </section>
      <div className="container contact-section">
        <section className="contact-card" aria-labelledby="contact-email-title">
          <h2 id="contact-email-title">Write to us</h2>
          <p>For questions about Kalavedike and our programs.</p>
          {email
            ? <a className="text-link contact-email" href={`mailto:${email}`}>{email}</a>
            : <p className="contact-pending">Our email address has not been published yet. In the meantime, you can reach us on Instagram.</p>}
        </section>
        <section className="contact-card" aria-labelledby="contact-social-title">
          <h2 id="contact-social-title">Stay connected</h2>
          <p>Follow our community and get in touch on Instagram.</p>
          <a className="text-link" href={site.instagram} target="_blank" rel="noopener noreferrer">{site.instagramHandle} <span aria-hidden="true">&#8599;</span><span className="sr-only"> (opens in a new tab)</span></a>
        </section>
      </div>
    </>
  )
}
