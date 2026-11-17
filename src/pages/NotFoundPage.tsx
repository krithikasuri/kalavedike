import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <section className="container page-intro not-found"><p className="eyebrow">404 / A quiet corner</p><h1>This page is<br />off <em>stage.</em></h1><p>The page you are looking for could not be found.</p><Link to="/" className="button button-primary">Back to home &rarr;</Link></section>
}
