import { useState } from 'react'

interface ArtworkProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

export function Artwork({ src, alt, className = '', eager = false }: ArtworkProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  if (failedSrc === src) {
    return <div className={`artwork-unavailable ${className}`} role="img" aria-label={`${alt}. Image unavailable.`}>Artwork unavailable</div>
  }
  return <img src={src} alt={alt} className={className} width="800" height="600" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSrc(src)} />
}
