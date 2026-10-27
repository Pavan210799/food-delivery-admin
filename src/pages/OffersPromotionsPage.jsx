import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DetailModal from '../components/ui/DetailModal.jsx'
import {
  DetailBody,
  DetailHighlightPanel,
  DetailSection,
  DetailStat,
  DetailStatGrid,
  detailBodyItem,
} from '../components/ui/DetailModalParts.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import FormField, { FormReminder } from '../components/ui/FormField.jsx'
import GradientHero from '../components/ui/GradientHero.jsx'
import MiniBars from '../components/ui/MiniBars.jsx'
import ModuleHeader from '../components/ui/ModuleHeader.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import {
  defaultCoverByType,
  offerAudiences,
  offerFilterBuckets,
  offerStatusMeta,
  offerTypeMeta,
  offersSeed,
  promoCovers,
  referralDefaults,
  weekLabels,
} from '../data/moduleData.js'
import { appendAudit } from '../lib/auditLog.js'
import { formatDate, isoDateOffset, makeId, todayIso } from '../lib/format.js'
import { formatMoney } from '../lib/formatMoney.js'
import { usePersistentState } from '../lib/usePersistentState.js'

const AVG_ORDER_VALUE = 42

const sections = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'referral', label: 'Referral program' },
  { id: 'analytics', label: 'Campaign analytics' },
]

const emptyDraft = () => ({
  code: '',
  title: '',
  type: 'percent',
  value: '',
  minOrder: '',
  usageLimit: '',
  perUserLimit: '1',
  startDate: todayIso(),
  expiryDate: isoDateOffset(30),
  audience: offerAudiences[0],
  cover: '',
})

const coverUrlById = Object.fromEntries(promoCovers.map((c) => [c.id, c.url]))
const seedCoverById = Object.fromEntries(offersSeed.map((o) => [o.id, o.cover]))

function offerCover(offer) {
  return coverUrlById[offer.cover ?? seedCoverById[offer.id] ?? defaultCoverByType[offer.type]] ?? promoCovers[0].url
}

function offerStatus(offer, today = todayIso()) {
  if (offer.paused) return 'paused'
  if (offer.expiryDate < today || (offer.usageLimit && offer.used >= offer.usageLimit)) return 'expired'
  if (offer.startDate > today) return 'scheduled'
  return 'active'
}

function offerValueLabel(offer) {
  if (offer.type === 'percent') return `${offer.value}% off`
  if (offer.type === 'flat') return `${formatMoney(offer.value)} off`
  return 'Free delivery'
}

function daysLeft(iso) {
  const diff = Math.round((new Date(`${iso}T00:00:00`) - new Date(`${todayIso()}T00:00:00`)) / 86400000)
  if (diff < 0) return `Ended ${formatDate(iso)}`
  if (diff === 0) return 'Ends today'
  return `${diff} day${diff === 1 ? '' : 's'} left`
}

function validateDraft(draft, offers) {
  const code = draft.code.trim().toUpperCase()
  if (!code) return 'Give the coupon a code customers can type — e.g. FALL15.'
  if (!/^[A-Z0-9]{4,14}$/.test(code)) return 'Codes work best as 4–14 letters or numbers, no spaces.'
  if (offers.some((o) => o.code === code)) return `${code} is already in use — try a small variation.`
  if (!draft.title.trim()) return 'Add a short campaign title so the team knows what it is for.'
  const value = Number(draft.value)
  if (draft.type !== 'free_delivery' && (!draft.value || value <= 0)) return 'Set the discount amount to continue.'
  if (draft.type === 'percent' && value > 90) return 'That discount is very generous — keep percent offers at 90% or below.'
  if (draft.minOrder === '' || Number(draft.minOrder) < 0) return 'Set a minimum order value (use 0 for no minimum).'
  if (draft.type === 'flat' && value >= Number(draft.minOrder || 0) && Number(draft.minOrder) > 0) {
    return 'The flat discount should be lower than the minimum order value.'
  }
  if (draft.usageLimit !== '' && Number(draft.usageLimit) < 1) return 'Usage limit should be at least 1, or leave it blank for unlimited.'
  if (!draft.perUserLimit || Number(draft.perUserLimit) < 1) return 'Each customer should be able to use it at least once.'
  if (!draft.startDate || !draft.expiryDate) return 'Pick both a start and an expiry date.'
  if (draft.expiryDate < draft.startDate) return 'The expiry date needs to come after the start date.'
  return ''
}

function CouponCard({ offer, index, onOpen }) {
  const status = offerStatus(offer)
  const meta = offerStatusMeta[status]
  const usagePct = offer.usageLimit ? (offer.used / offer.usageLimit) * 100 : Math.min((offer.used / 1000) * 100, 100)
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(offer.id)}
      className={`offer-card offer-card--${status}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <div className="offer-card-media">
        <img src={offerCover(offer)} alt="" loading="lazy" decoding="async" />
        <div className="offer-card-media-shade" aria-hidden="true" />
        <span className="offer-card-media-badge">
          <StatusBadge label={meta.label} tone={meta.tone} onPhoto />
        </span>
        <p className="offer-card-value">{offerValueLabel(offer)}</p>
      </div>
      <div className="offer-card-body">
      <div className="offer-card-top">
        <span className="offer-code">{offer.code}</span>
        <span className="text-muted truncate text-[0.6875rem] font-bold">{offerTypeMeta[offer.type].label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-bold text-ink">{offer.title}</p>
      <div className="offer-card-notch" aria-hidden="true" />
      <div className="mt-auto space-y-2 pt-3">
        <p className="perf-label">
          <span>
            {offer.used.toLocaleString('en-US')} used
            {offer.usageLimit ? ` / ${offer.usageLimit.toLocaleString('en-US')}` : ' · unlimited'}
          </span>
          <span>Min {formatMoney(offer.minOrder)}</span>
        </p>
        <ProgressBar value={usagePct} tone={status === 'expired' ? 'danger' : status === 'paused' ? 'gold' : 'copper'} />
        <p className="text-muted text-xs font-semibold">
          {status === 'scheduled' ? `Starts ${formatDate(offer.startDate)}` : daysLeft(offer.expiryDate)} · {offer.audience}
        </p>
      </div>
      </div>
    </motion.button>
  )
}

function CreateOfferModal({ open, offers, onClose, onCreate }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [reminder, setReminder] = useState('')

  const set = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: key === 'code' ? e.target.value.toUpperCase().replace(/\s/g, '') : e.target.value }))
    setReminder('')
  }

  const close = () => {
    setDraft(emptyDraft())
    setReminder('')
    onClose()
  }

  const submit = (e) => {
    e.preventDefault()
    const message = validateDraft(draft, offers)
    if (message) {
      setReminder(message)
      return
    }
    onCreate({
      id: makeId('of'),
      code: draft.code.trim().toUpperCase(),
      title: draft.title.trim(),
      type: draft.type,
      value: draft.type === 'free_delivery' ? 0 : Number(draft.value),
      minOrder: Number(draft.minOrder),
      usageLimit: draft.usageLimit === '' ? null : Number(draft.usageLimit),
      perUserLimit: Number(draft.perUserLimit),
      used: 0,
      startDate: draft.startDate,
      expiryDate: draft.expiryDate,
      audience: draft.audience,
      cover: selectedCover,
      paused: false,
      discountGiven: 0,
      redemptionsWeek: [0, 0, 0, 0, 0, 0, 0],
    })
    setDraft(emptyDraft())
    setReminder('')
  }

  const selectedCover = draft.cover || defaultCoverByType[draft.type]

  return (
    <DetailModal
      open={open}
      onClose={close}
      hero={
        <GradientHero
          eyebrow="New campaign"
          title={draft.code.trim() || 'Create offer'}
          subtitle={draft.title.trim() || 'Coupon codes, discounts, and limits'}
          image={coverUrlById[selectedCover]}
        />
      }
    >
      <form onSubmit={submit} noValidate>
        <DetailBody>
          <motion.div className="register-form-grid" variants={detailBodyItem}>
            <FormField label="Coupon code" hint="Letters and numbers only">
              <input className="register-input font-mono tracking-wider" value={draft.code} onChange={set('code')} placeholder="FALL15" maxLength={14} />
            </FormField>
            <FormField label="Campaign title">
              <input className="register-input" value={draft.title} onChange={set('title')} placeholder="Fall comfort food" />
            </FormField>
            <FormField label="Discount type">
              <select className="register-input" value={draft.type} onChange={set('type')}>
                {Object.entries(offerTypeMeta).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={draft.type === 'percent' ? 'Discount (%)' : 'Discount ($)'}>
              <input
                className="register-input"
                type="number"
                min="0"
                inputMode="decimal"
                value={draft.type === 'free_delivery' ? '' : draft.value}
                onChange={set('value')}
                disabled={draft.type === 'free_delivery'}
                placeholder={draft.type === 'free_delivery' ? 'Covers delivery fee' : draft.type === 'percent' ? '15' : '10'}
              />
            </FormField>
            <FormField label="Minimum order ($)">
              <input className="register-input" type="number" min="0" inputMode="decimal" value={draft.minOrder} onChange={set('minOrder')} placeholder="25" />
            </FormField>
            <FormField label="Total usage limit" hint="Blank = unlimited">
              <input className="register-input" type="number" min="1" inputMode="numeric" value={draft.usageLimit} onChange={set('usageLimit')} placeholder="1000" />
            </FormField>
            <FormField label="Uses per customer">
              <input className="register-input" type="number" min="1" inputMode="numeric" value={draft.perUserLimit} onChange={set('perUserLimit')} />
            </FormField>
            <FormField label="Audience">
              <select className="register-input" value={draft.audience} onChange={set('audience')}>
                {offerAudiences.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Start date">
              <input className="register-input" type="date" value={draft.startDate} onChange={set('startDate')} />
            </FormField>
            <FormField label="Expiry date">
              <input className="register-input" type="date" value={draft.expiryDate} min={draft.startDate} onChange={set('expiryDate')} />
            </FormField>
          </motion.div>
          <motion.div className="register-field" variants={detailBodyItem}>
            <span className="register-field-label">Card image</span>
            <div className="cover-picker" role="radiogroup" aria-label="Card image">
              {promoCovers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedCover === c.id}
                  onClick={() => setDraft((d) => ({ ...d, cover: c.id }))}
                  className={`cover-option ${selectedCover === c.id ? 'cover-option--on' : ''}`}
                >
                  <img src={c.url} alt="" loading="lazy" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
          <AnimatePresence>
            {reminder ? (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <FormReminder message={reminder} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.div className="register-modal-footer" variants={detailBodyItem}>
            <button type="button" onClick={close} className="register-btn register-btn--ghost">
              Cancel
            </button>
            <button type="submit" className="register-btn register-btn--primary">
              Create offer
            </button>
          </motion.div>
        </DetailBody>
      </form>
    </DetailModal>
  )
}

export default function OffersPromotionsPage() {
  const notify = useToast()
  const [offers, setOffers] = usePersistentState('offers-list', offersSeed)
  const [referral, setReferral] = usePersistentState('offers-referral', referralDefaults)
  const [referralDraft, setReferralDraft] = useState(referral)
  const [referralReminder, setReferralReminder] = useState('')

  const [section, setSection] = useState('campaigns')
  const [bucket, setBucket] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const withStatus = useMemo(() => offers.map((o) => ({ ...o, status: offerStatus(o) })), [offers])
  const counts = Object.fromEntries(
    offerFilterBuckets.map((b) => [b.id, b.id === 'all' ? withStatus.length : withStatus.filter((o) => o.status === b.id).length]),
  )
  const visible = bucket === 'all' ? withStatus : withStatus.filter((o) => o.status === bucket)
  const selected = withStatus.find((o) => o.id === selectedId) ?? null

  const weekTotals = weekLabels.map((label, i) => ({ label, value: offers.reduce((s, o) => s + (o.redemptionsWeek[i] ?? 0), 0) }))
  const weekRedemptions = weekTotals.reduce((s, d) => s + d.value, 0)
  const totalDiscount = offers.reduce((s, o) => s + o.discountGiven, 0)

  const metrics = [
    { id: 'campaign', label: 'Active campaigns', value: String(counts.active), change: `${counts.scheduled} scheduled`, accent: 'copper' },
    { id: 'redemptions', label: 'Redemptions (7d)', value: weekRedemptions.toLocaleString('en-US'), change: 'All coupon codes', accent: 'sage' },
    { id: 'discount', label: 'Discounts given', value: formatMoney(totalDiscount), change: 'Lifetime', accent: 'gold' },
    {
      id: 'referral',
      label: 'Referral signups',
      value: referral.signups.toLocaleString('en-US'),
      change: referral.enabled ? `${Math.round((referral.firstOrders / Math.max(referral.signups, 1)) * 100)}% ordered` : 'Program paused',
      accent: 'danger',
    },
  ]

  const updateOffer = (id, patch) => setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      notify(`${code} copied to clipboard`, 'info')
    } catch {
      notify(`Copy failed — the code is ${code}`, 'info')
    }
  }

  const saveReferral = () => {
    const d = referralDraft
    if (Number(d.referrerReward) <= 0 || Number(d.refereeReward) <= 0) {
      setReferralReminder('Both rewards need a value above $0 so friends have a reason to join.')
      return
    }
    if (Number(d.minFirstOrder) < 0 || d.minFirstOrder === '') {
      setReferralReminder('Set a minimum first order (use 0 for none).')
      return
    }
    const next = {
      ...referral,
      enabled: d.enabled,
      referrerReward: Number(d.referrerReward),
      refereeReward: Number(d.refereeReward),
      minFirstOrder: Number(d.minFirstOrder),
    }
    setReferral(next)
    setReferralDraft(next)
    setReferralReminder('')
    appendAudit('Offers', 'Updated referral program', `${formatMoney(next.referrerReward)} / ${formatMoney(next.refereeReward)}`)
    notify('Referral program saved')
  }

  const referralDirty =
    referralDraft.enabled !== referral.enabled ||
    Number(referralDraft.referrerReward) !== referral.referrerReward ||
    Number(referralDraft.refereeReward) !== referral.refereeReward ||
    Number(referralDraft.minFirstOrder) !== referral.minFirstOrder

  const funnel = [
    { label: 'Invites sent', value: referral.invitesSent, tone: 'copper' },
    { label: 'Signed up', value: referral.signups, tone: 'gold' },
    { label: 'Placed first order', value: referral.firstOrders, tone: 'sage' },
  ]

  const analyticsRows = [...withStatus].sort((a, b) => b.used - a.used)
  const maxUsed = Math.max(...analyticsRows.map((o) => o.used), 1)

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Promotions summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <ModuleHeader
            title="Offers & promotions"
            subtitle="Coupon codes, discount campaigns, and referrals"
            actionLabel="Create offer"
            onAction={() => setCreateOpen(true)}
          />
          <TabBar tabs={sections} active={section} onChange={setSection} layoutId="offers-section-tab" variant="page" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-col gap-4"
          >
            {section === 'campaigns' ? (
              <>
                <div className="module-filters">
                  {offerFilterBuckets.map((f) => (
                    <FilterChip key={f.id} label={f.label} count={counts[f.id]} active={bucket === f.id} onClick={() => setBucket(f.id)} />
                  ))}
                </div>
                {visible.length === 0 ? (
                  <EmptyState message="No offers in this view yet." />
                ) : (
                  <div className="offer-grid">
                    {visible.map((offer, i) => (
                      <CouponCard key={offer.id} offer={offer} index={i} onOpen={setSelectedId} />
                    ))}
                  </div>
                )}
              </>
            ) : null}

            {section === 'referral' ? (
              <div className="dashboard-split-50-50">
                <div className="panel-card space-y-4">
                  <h3 className="panel-title">Program settings</h3>
                  <Toggle
                    checked={referralDraft.enabled}
                    onChange={(v) => setReferralDraft((d) => ({ ...d, enabled: v }))}
                    label="Referral program"
                    description="Customers share a personal link from the app"
                  />
                  <div className="register-form-grid">
                    <FormField label="Referrer reward ($)" hint="Credit for the inviter">
                      <input
                        className="register-input"
                        type="number"
                        min="0"
                        value={referralDraft.referrerReward}
                        onChange={(e) => {
                          setReferralDraft((d) => ({ ...d, referrerReward: e.target.value }))
                          setReferralReminder('')
                        }}
                      />
                    </FormField>
                    <FormField label="New customer reward ($)" hint="Off their first order">
                      <input
                        className="register-input"
                        type="number"
                        min="0"
                        value={referralDraft.refereeReward}
                        onChange={(e) => {
                          setReferralDraft((d) => ({ ...d, refereeReward: e.target.value }))
                          setReferralReminder('')
                        }}
                      />
                    </FormField>
                    <FormField label="Minimum first order ($)" className="register-field--full">
                      <input
                        className="register-input"
                        type="number"
                        min="0"
                        value={referralDraft.minFirstOrder}
                        onChange={(e) => {
                          setReferralDraft((d) => ({ ...d, minFirstOrder: e.target.value }))
                          setReferralReminder('')
                        }}
                      />
                    </FormField>
                  </div>
                  <FormReminder message={referralReminder} />
                  <div className="register-modal-footer">
                    <button
                      type="button"
                      disabled={!referralDirty}
                      onClick={() => {
                        setReferralDraft(referral)
                        setReferralReminder('')
                      }}
                      className="register-btn register-btn--ghost"
                    >
                      Discard
                    </button>
                    <button type="button" disabled={!referralDirty} onClick={saveReferral} className="register-btn register-btn--primary">
                      Save program
                    </button>
                  </div>
                </div>
                <div className="panel-card space-y-4">
                  <h3 className="panel-title">Referral funnel</h3>
                  <ul className="space-y-3.5">
                    {funnel.map((step, i) => (
                      <li key={step.label}>
                        <p className="perf-label">
                          <span className="text-ink">{step.label}</span>
                          <span>
                            {step.value.toLocaleString('en-US')}
                            {i > 0 ? ` · ${Math.round((step.value / funnel[i - 1].value) * 100)}%` : ''}
                          </span>
                        </p>
                        <ProgressBar value={(step.value / funnel[0].value) * 100} tone={step.tone} />
                      </li>
                    ))}
                  </ul>
                  <DetailHighlightPanel>
                    <p className="text-sm font-semibold">
                      Cost per acquired customer ≈{' '}
                      <span className="font-bold text-copper-dark">{formatMoney(referral.referrerReward + referral.refereeReward)}</span>
                      {' · '}
                      {formatMoney((referral.referrerReward + referral.refereeReward) * referral.firstOrders)} spent so far
                    </p>
                  </DetailHighlightPanel>
                </div>
              </div>
            ) : null}

            {section === 'analytics' ? (
              <div className="dashboard-split-50-50">
                <div className="panel-card">
                  <h3 className="panel-title">Redemptions this week</h3>
                  <MiniBars data={weekTotals} format={(v) => `${v} uses`} tone="copper" />
                </div>
                <div className="panel-card">
                  <h3 className="panel-title">Campaign performance</h3>
                  <ul className="space-y-3.5">
                    {analyticsRows.map((o) => (
                      <li key={o.id}>
                        <p className="perf-label">
                          <span className="truncate font-mono text-ink">{o.code}</span>
                          <span>
                            {o.used.toLocaleString('en-US')} uses · {formatMoney(o.used * AVG_ORDER_VALUE)} sales
                          </span>
                        </p>
                        <ProgressBar value={(o.used / maxUsed) * 100} tone={o.status === 'active' ? 'sage' : o.status === 'expired' ? 'danger' : 'gold'} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <DetailModal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        hero={
          selected ? (
            <GradientHero
              eyebrow={offerTypeMeta[selected.type].label}
              title={selected.code}
              subtitle={selected.title}
              tone={selected.status === 'expired' ? 'danger' : selected.status === 'paused' ? 'ink' : 'gold'}
              image={offerCover(selected)}
              aside={<p className="font-display text-2xl font-bold text-paper sm:text-3xl">{offerValueLabel(selected)}</p>}
              badge={
                <>
                  <StatusBadge label={offerStatusMeta[selected.status].label} tone={offerStatusMeta[selected.status].tone} onPhoto />
                  <StatusBadge label={selected.audience} tone="copper" onPhoto />
                </>
              }
            />
          ) : null
        }
      >
        {selected ? (
          <DetailBody key={selected.id}>
            <DetailStatGrid>
              <DetailStat label="Minimum order" value={formatMoney(selected.minOrder)} accent="copper" />
              <DetailStat
                label="Usage"
                value={`${selected.used.toLocaleString('en-US')}${selected.usageLimit ? ` / ${selected.usageLimit.toLocaleString('en-US')}` : ''}`}
                hint={selected.usageLimit ? `${Math.max(selected.usageLimit - selected.used, 0)} remaining` : 'Unlimited'}
                accent="sage"
              />
              <DetailStat label="Per customer" value={`${selected.perUserLimit}×`} accent="gold" />
              <DetailStat label="Discount given" value={formatMoney(selected.discountGiven)} hint={`≈ ${formatMoney(selected.used * AVG_ORDER_VALUE)} sales`} accent="muted" />
            </DetailStatGrid>
            <DetailSection title="Schedule">
              <DetailHighlightPanel tone={selected.status === 'expired' ? 'danger' : 'copper'}>
                <p className="text-sm font-bold">
                  {formatDate(selected.startDate)} → {formatDate(selected.expiryDate)}
                </p>
                <p className="text-muted mt-1 text-xs font-semibold">
                  {selected.status === 'scheduled' ? `Goes live ${formatDate(selected.startDate)}` : daysLeft(selected.expiryDate)}
                </p>
              </DetailHighlightPanel>
            </DetailSection>
            <DetailSection title="Redemptions · last 7 days">
              <MiniBars
                data={weekLabels.map((label, i) => ({ label, value: selected.redemptionsWeek[i] ?? 0 }))}
                format={(v) => `${v} uses`}
                tone="gold"
                height="h-28"
              />
            </DetailSection>
            <motion.div className="offer-actions" variants={detailBodyItem}>
              <button type="button" onClick={() => copyCode(selected.code)} className="action-btn">
                Copy code
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextExpiry = isoDateOffset(
                    Math.max(0, Math.round((new Date(`${selected.expiryDate}T00:00:00`) - new Date(`${todayIso()}T00:00:00`)) / 86400000)) + 7,
                  )
                  updateOffer(selected.id, { expiryDate: nextExpiry })
                  appendAudit('Offers', 'Extended offer expiry', `${selected.code} → ${nextExpiry}`)
                  notify(`${selected.code} now runs until ${formatDate(nextExpiry)}`)
                }}
                className="action-btn"
              >
                Extend 7 days
              </button>
              <button
                type="button"
                onClick={() => {
                  const pausing = !selected.paused
                  setConfirm({
                    title: pausing ? 'Pause offer?' : 'Resume offer?',
                    message: pausing
                      ? `${selected.code} will stop applying at checkout until you resume it.`
                      : `${selected.code} will start applying at checkout again.`,
                    confirmLabel: pausing ? 'Pause' : 'Resume',
                    onConfirm: () => {
                      updateOffer(selected.id, { paused: pausing })
                      appendAudit('Offers', pausing ? 'Paused offer' : 'Resumed offer', selected.code)
                      notify(`${selected.code} ${pausing ? 'paused' : 'resumed'}`, pausing ? 'info' : 'success')
                      setConfirm(null)
                    },
                  })
                }}
                className={`action-btn ${selected.paused ? 'action-btn--sage' : 'action-btn--primary'}`}
              >
                {selected.paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirm({
                    title: 'Delete offer?',
                    message: `${selected.code} will be removed permanently. Past redemptions stay in reports.`,
                    confirmLabel: 'Delete',
                    tone: 'danger',
                    onConfirm: () => {
                      setOffers((prev) => prev.filter((o) => o.id !== selected.id))
                      appendAudit('Offers', 'Deleted offer', selected.code)
                      notify(`${selected.code} deleted`, 'danger')
                      setConfirm(null)
                      setSelectedId(null)
                    },
                  })
                }
                className="action-btn action-btn--danger"
              >
                Delete
              </button>
            </motion.div>
          </DetailBody>
        ) : null}
      </DetailModal>

      <CreateOfferModal
        open={createOpen}
        offers={offers}
        onClose={() => setCreateOpen(false)}
        onCreate={(offer) => {
          setOffers((prev) => [offer, ...prev])
          appendAudit('Offers', 'Created offer', `${offer.code} · ${offerValueLabel(offer)}`)
          notify(`${offer.code} created`)
          setCreateOpen(false)
          setBucket('all')
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        onConfirm={() => confirm?.onConfirm?.()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
