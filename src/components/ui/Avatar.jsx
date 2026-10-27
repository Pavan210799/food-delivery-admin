import { useState } from 'react'
import { initials } from '../../lib/format.js'

const tones = {
  copper: 'bg-copper/12 text-copper-dark',
  sage: 'bg-sage/12 text-sage',
  gold: 'bg-gold/15 text-gold',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-sand text-muted',
  photo: 'bg-paper/20 text-paper ring-1 ring-paper/40 backdrop-blur-sm',
}

const rings = {
  copper: 'ring-copper/30',
  sage: 'ring-sage/35',
  gold: 'ring-gold/35',
  danger: 'ring-danger/40',
  muted: 'ring-line',
  photo: 'ring-2 ring-paper/70 shadow-[0_8px_20px_rgba(22,19,17,0.25)]',
}

const sizes = {
  sm: 'h-9 w-9 rounded-lg text-[0.65rem]',
  lg: 'h-12 w-12 rounded-xl text-sm sm:h-14 sm:w-14 sm:rounded-2xl sm:text-base',
}

export default function Avatar({ name, photo, tone = 'copper', size = 'sm', online }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showPhoto = Boolean(photo) && failedSrc !== photo

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center font-extrabold ${sizes[size]} ${
        showPhoto ? `avatar-photo bg-sand ring-1 ${rings[tone] ?? rings.copper}` : tones[tone] ?? tones.copper
      }`}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${size === 'lg' ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg'} ${tone === 'danger' ? 'grayscale-[0.6]' : ''}`}
          onError={() => setFailedSrc(photo)}
        />
      ) : (
        initials(name)
      )}
      {online != null ? (
        <span
          className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-paper ${online ? 'bg-sage avatar-online' : 'bg-line'}`}
          aria-hidden="true"
        />
      ) : null}
    </span>
  )
}
