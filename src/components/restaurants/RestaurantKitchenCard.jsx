import { motion } from 'framer-motion'
import StatusBadge from '../ui/StatusBadge.jsx'
import { formatMoney } from '../../lib/formatMoney.js'

const cardSpring = { type: 'spring', stiffness: 560, damping: 28, mass: 0.75 }
const imageEase = { duration: 0.14, ease: [0.22, 1, 0.36, 1] }

export default function RestaurantKitchenCard({ restaurant, selected, index = 0, onClick }) {
  return (
    <motion.div
      className="flex h-full min-w-0 p-0.5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        className={`group restaurant-kitchen-card flex h-full w-full flex-col overflow-hidden rounded-[1.25rem] border text-left ${
          selected
            ? 'border-copper/45 bg-gradient-to-br from-copper/[0.08] to-paper shadow-[0_12px_32px_rgba(196,92,38,0.18)]'
            : 'border-line bg-paper/95 hover:border-copper/28 hover:shadow-[0_16px_36px_-14px_rgba(22,19,17,0.16)]'
        }`}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: -5, scale: 1.012, transition: cardSpring },
          tap: { y: -2, scale: 0.985, transition: cardSpring },
        }}
      >
        <div className="restaurant-kitchen-card-media relative aspect-[5/4] bg-sand">
          <motion.img
            src={restaurant.image}
            alt={`${restaurant.name} cover`}
            loading="lazy"
            decoding="async"
            className="restaurant-kitchen-card-img h-full w-full object-cover"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.08 }, tap: { scale: 1.04 } }}
            transition={imageEase}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/5 transition-opacity duration-150 group-hover:from-ink/75"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-0 right-0 left-0 h-20 bg-gradient-to-b from-ink/55 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute top-2.5 right-2.5 left-2.5 z-[1] flex flex-wrap items-start justify-between gap-1.5">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-paper/40 bg-paper/95 px-2.5 py-1 text-xs font-extrabold text-ink tabular-nums shadow-[0_4px_14px_rgba(22,19,17,0.28)] backdrop-blur-sm transition-transform duration-150 group-hover:scale-[1.03]">
              <span className="text-sage" aria-hidden="true">
                ★
              </span>
              {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
            </span>
            <span className="ml-auto min-w-0 max-w-full transition-transform duration-150 group-hover:scale-[1.02]">
              <StatusBadge label={restaurant.statusLabel} tone={restaurant.statusTone} onPhoto />
            </span>
          </div>
          <div className="absolute right-2.5 bottom-2.5 left-2.5 min-w-0">
            <p className="font-display truncate text-lg font-bold tracking-tight text-paper drop-shadow-sm">{restaurant.name}</p>
            <p className="text-paper/90 truncate text-xs font-medium">
              {restaurant.cuisine} · {restaurant.neighborhood}
            </p>
          </div>
        </div>
        <div className="restaurant-card-body px-3.5 py-3">
          <p className="restaurant-card-blurb">{restaurant.blurb || '\u00A0'}</p>
          <div className="restaurant-card-meta-block">
            <div className="text-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] font-semibold">
              <span>{restaurant.menuItemCount} menu items</span>
              <span aria-hidden="true">·</span>
              <span>{restaurant.commissionPct}% commission</span>
              <span aria-hidden="true">·</span>
              <span>{restaurant.etaLabel}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted text-xs font-semibold">
                {restaurant.distance} · {formatMoney(restaurant.deliveryFee)} delivery
              </span>
              {restaurant.unavailableCount > 0 ? (
                <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[0.65rem] font-bold text-danger">
                  {restaurant.unavailableCount} out of stock
                </span>
              ) : (
                <span className="text-sage text-[0.65rem] font-bold">All items in stock</span>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}
