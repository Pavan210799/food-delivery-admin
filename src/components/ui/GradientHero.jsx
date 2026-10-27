import { motion } from 'framer-motion'

const tones = {
  copper: 'from-copper/95 via-copper-dark/90 to-ink/95',
  sage: 'from-sage/95 via-sage/85 to-ink/95',
  gold: 'from-gold/90 via-copper/80 to-ink/95',
  danger: 'from-danger/90 via-copper-dark/80 to-ink/95',
  ink: 'from-ink/95 via-ink/85 to-copper-dark/85',
}

/** Modal hero for records without a cover photo. Right padding keeps text clear of the floating close button. */
export default function GradientHero({ eyebrow, title, subtitle, tone = 'copper', avatar, aside, badge, image }) {
  return (
    <div
      className={`detail-modal-hero--flush relative overflow-hidden leading-normal ${
        image ? 'bg-ink pt-24 sm:pt-28' : `bg-gradient-to-br ${tones[tone] ?? tones.copper} pt-7 sm:pt-8`
      } px-5 pb-5 sm:px-6`}
    >
      {image ? (
        <>
          <motion.img
            src={image}
            alt=""
            className="detail-modal-hero-media pointer-events-none absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/10" aria-hidden="true" />
        </>
      ) : null}
      <div className="detail-modal-hero-shine" aria-hidden="true" />
      <div className="relative z-[1] flex flex-wrap items-end justify-between gap-3 pr-12">
        <div className="flex min-w-0 items-center gap-3">
          {avatar}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-paper/75 text-[0.65rem] font-extrabold tracking-[0.16em] uppercase">{eyebrow}</p>
            ) : null}
            <h2
              id="detail-modal-title"
              className="font-display mt-1 text-2xl font-bold tracking-tight break-words text-paper sm:text-3xl"
            >
              {title}
            </h2>
            {subtitle ? <p className="text-paper/90 mt-1 text-sm font-medium break-words">{subtitle}</p> : null}
          </div>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {badge ? <div className="modal-hero-status relative z-[1] mt-3 flex flex-wrap gap-2">{badge}</div> : null}
    </div>
  )
}
