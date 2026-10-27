import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import AdminDataTable from '../components/ui/AdminDataTable.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DetailModal from '../components/ui/DetailModal.jsx'
import {
  DetailBody,
  DetailHighlightPanel,
  DetailSection,
  DetailStat,
  DetailStatGrid,
  DetailTabPanel,
  detailBodyItem,
} from '../components/ui/DetailModalParts.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import FormField, { FormReminder } from '../components/ui/FormField.jsx'
import GradientHero from '../components/ui/GradientHero.jsx'
import MiniBars from '../components/ui/MiniBars.jsx'
import ModuleHeader from '../components/ui/ModuleHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { deliveryPartners, getOrderManagementSnapshot } from '../data/platformData.js'
import {
  documentStatusMeta,
  partnerFilterBuckets,
  partnerStatusMeta,
  partnerVehicles,
  partnerZones,
  weekLabels,
} from '../data/moduleData.js'
import { appendAudit } from '../lib/auditLog.js'
import { formatDate, makeId, todayIso } from '../lib/format.js'
import { formatMoney } from '../lib/formatMoney.js'
import { paginate } from '../lib/pagination.js'
import { PARTNER_ASSIGNMENTS_KEY, PARTNERS_ADDED_KEY } from '../lib/partnerAssignments.js'
import { usePersistentState } from '../lib/usePersistentState.js'

const PAGE_SIZE = 7
const ASSIGNABLE_STATUSES = new Set(['pending', 'confirmed', 'preparing'])

const emptyForm = { name: '', phone: '', email: '', zone: partnerZones[0], vehicle: partnerVehicles[0], vehicleNo: '' }

const detailTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'earnings', label: 'Earnings' },
]

function partnerMatches(partner, bucket) {
  if (bucket === 'all') return true
  if (bucket === 'online') return partner.status === 'active' && partner.online
  if (bucket === 'offline') return partner.status === 'active' && !partner.online
  return partner.status === bucket
}

function availability(partner) {
  if (partner.status !== 'active') return partnerStatusMeta[partner.status] ?? { label: partner.status, tone: 'muted' }
  return partner.online ? { label: 'Online', tone: 'sage' } : { label: 'Offline', tone: 'muted' }
}

function registrationReminder(form) {
  const missing = []
  if (form.name.trim().length < 2) missing.push('full name')
  if (form.phone.replace(/\D/g, '').length < 10) missing.push('a 10-digit phone')
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) missing.push('a valid email')
  if (form.vehicle !== 'Bicycle' && !form.vehicleNo.trim()) missing.push('vehicle plate')
  if (missing.length === 0) return null
  return `Almost ready — just add ${missing.join(', ')}.`
}

const shortStepLabels = {
  'Order placed': 'Placed',
  'Restaurant confirmed': 'Confirmed',
  'Out for delivery': 'On the way',
}

function CompactTracking({ steps }) {
  return (
    <ol className="compact-track" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step) => (
        <li
          key={step.id}
          className={`compact-track-step ${step.done ? 'compact-track-step--done' : ''} ${step.current ? 'compact-track-step--current' : ''}`}
        >
          <span className="compact-track-dot" aria-hidden="true" />
          <span className="compact-track-label">{shortStepLabels[step.label] ?? step.label}</span>
        </li>
      ))}
    </ol>
  )
}

function PartnerDetailBody({
  partner,
  tab,
  onTab,
  history,
  assignable,
  assignId,
  onAssignId,
  assignReminder,
  onAssign,
  onToggleOnline,
  onSuspendToggle,
  onDocDecision,
  onApprove,
}) {
  const live = history.filter((o) => o.status === 'delivering')
  const past = history.filter((o) => o.status !== 'delivering')
  const weekTotal = partner.earningsWeek.reduce((sum, v) => sum + v, 0)
  const activeDays = partner.earningsWeek.filter((v) => v > 0).length
  const allVerified = partner.documents.every((d) => d.status === 'verified')
  const hasRejected = partner.documents.some((d) => d.status === 'rejected')

  return (
    <DetailBody>
      <motion.div variants={detailBodyItem}>
        <TabBar tabs={detailTabs} active={tab} onChange={onTab} layoutId="partner-detail-tab" />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'overview' ? (
          <DetailTabPanel key="overview">
            <DetailStatGrid>
              <DetailStat label="Phone" value={partner.phone} accent="copper" />
              <DetailStat label="Email" value={partner.email} accent="muted" />
              <DetailStat label="Vehicle" value={partner.vehicle} hint={partner.vehicleNo} accent="gold" />
              <DetailStat label="Joined" value={formatDate(partner.joinedAt)} hint={`${partner.zone} zone`} accent="sage" />
            </DetailStatGrid>

            <DetailSection title="Performance">
              <DetailHighlightPanel>
                {partner.totalDeliveries === 0 ? (
                  <p className="text-sm font-semibold">No deliveries yet — performance appears after the first completed trip.</p>
                ) : (
                  <div className="perf-grid">
                    <div>
                      <p className="perf-label">On-time rate <span>{partner.onTimePct}%</span></p>
                      <ProgressBar value={partner.onTimePct} tone="sage" />
                    </div>
                    <div>
                      <p className="perf-label">Acceptance <span>{partner.acceptancePct}%</span></p>
                      <ProgressBar value={partner.acceptancePct} tone="copper" />
                    </div>
                    <div>
                      <p className="perf-label">Customer rating <span>★ {partner.rating}</span></p>
                      <ProgressBar value={(partner.rating / 5) * 100} tone="gold" />
                    </div>
                    <div>
                      <p className="perf-label">Lifetime deliveries <span>{partner.totalDeliveries.toLocaleString('en-US')}</span></p>
                      <ProgressBar value={Math.min(100, partner.totalDeliveries / 15)} tone="sage" />
                    </div>
                  </div>
                )}
              </DetailHighlightPanel>
            </DetailSection>

            <DetailSection title="Availability">
              <div className="space-y-3">
                <Toggle
                  checked={partner.status === 'active' && partner.online}
                  onChange={onToggleOnline}
                  disabled={partner.status !== 'active'}
                  label="Online for dispatch"
                  description={
                    partner.status === 'active'
                      ? 'Online partners receive new order assignments in their zone.'
                      : 'Only active, verified partners can go online.'
                  }
                />
                {partner.status !== 'pending_verification' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-muted min-w-0 flex-1 text-xs font-semibold">
                      {partner.status === 'suspended'
                        ? `Suspended · ${partner.suspendReason ?? 'Policy review'}`
                        : 'Suspending removes this partner from dispatch immediately.'}
                    </p>
                    <button
                      type="button"
                      onClick={onSuspendToggle}
                      className={`action-btn ${partner.status === 'suspended' ? 'action-btn--sage' : 'action-btn--danger'}`}
                    >
                      {partner.status === 'suspended' ? 'Reactivate partner' : 'Suspend partner'}
                    </button>
                  </div>
                ) : null}
              </div>
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'documents' ? (
          <DetailTabPanel key="documents">
            {partner.status === 'pending_verification' ? (
              <DetailHighlightPanel tone={hasRejected ? 'danger' : 'copper'}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm font-bold">
                    {allVerified
                      ? 'All documents verified — ready to activate.'
                      : hasRejected
                        ? 'A document was rejected. Ask the partner to re-upload before activating.'
                        : 'Review each document to activate this partner.'}
                  </p>
                  <button type="button" disabled={!allVerified} onClick={onApprove} className="action-btn action-btn--primary">
                    Approve & activate
                  </button>
                </div>
              </DetailHighlightPanel>
            ) : null}
            <DetailSection title="Submitted documents">
              <div className="detail-line-list">
                {partner.documents.map((doc) => {
                  const meta = documentStatusMeta[doc.status] ?? documentStatusMeta.pending
                  return (
                    <div key={doc.id} className="detail-line-row flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{doc.label}</p>
                        <p className="text-muted text-xs font-semibold">Uploaded via partner app</p>
                      </div>
                      <div className="detail-line-row-actions">
                        <StatusBadge label={meta.label} tone={meta.tone} />
                        {doc.status !== 'verified' ? (
                          <button type="button" onClick={() => onDocDecision(doc, 'verified')} className="action-btn action-btn--sage action-btn--sm">
                            Approve
                          </button>
                        ) : null}
                        {doc.status === 'pending' ? (
                          <button type="button" onClick={() => onDocDecision(doc, 'rejected')} className="action-btn action-btn--danger action-btn--sm">
                            Reject
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'deliveries' ? (
          <DetailTabPanel key="deliveries">
            {live.map((order) => (
              <DetailSection key={order.id} title="Live delivery">
                <DetailHighlightPanel>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold">#{order.id}</p>
                      <p className="text-muted text-xs font-semibold break-words">
                        {order.restaurant} → {order.address}
                      </p>
                    </div>
                    <StatusBadge label={`ETA ${order.eta}`} tone="sage" />
                  </div>
                  <CompactTracking steps={order.tracking} />
                </DetailHighlightPanel>
              </DetailSection>
            ))}

            <DetailSection title="Assign order">
              <div className="assign-row">
                <select value={assignId} onChange={(e) => onAssignId(e.target.value)} className="register-input min-w-0 flex-1">
                  <option value="">{assignable.length ? 'Choose an unassigned order…' : 'No unassigned orders right now'}</option>
                  {assignable.map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} · {o.restaurant} · {formatMoney(o.total)}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={onAssign} className="action-btn action-btn--primary">
                  Assign
                </button>
              </div>
              <FormReminder message={assignReminder} />
            </DetailSection>

            <DetailSection title="Delivery history">
              {past.length === 0 ? (
                <p className="text-muted text-sm font-semibold">No completed deliveries on record.</p>
              ) : (
                <div className="detail-line-list">
                  {past.map((order) => (
                    <div key={order.id} className="detail-line-row flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">#{order.id} · {order.restaurant}</p>
                        <p className="text-muted truncate text-xs font-semibold">{order.placedAt} · {order.customer}</p>
                      </div>
                      <div className="detail-line-row-actions">
                        <StatusBadge label={order.statusLabel} tone={order.statusTone} />
                        <span className="font-bold tabular-nums">{formatMoney(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'earnings' ? (
          <DetailTabPanel key="earnings">
            <DetailStatGrid>
              <DetailStat label="This week" value={formatMoney(weekTotal)} hint={`${activeDays} active days`} accent="copper" />
              <DetailStat label="Tips" value={formatMoney(partner.tipsWeek)} hint="100% passed to partner" accent="sage" />
              <DetailStat label="Avg / active day" value={formatMoney(activeDays ? Math.round(weekTotal / activeDays) : 0)} accent="gold" />
              <DetailStat label="Next payout" value={formatMoney(weekTotal + partner.tipsWeek)} hint="Releases Tuesday" accent="muted" />
            </DetailStatGrid>
            <DetailSection title="Daily earnings">
              <DetailHighlightPanel>
                <MiniBars
                  data={partner.earningsWeek.map((value, i) => ({ label: weekLabels[i], value }))}
                  format={(v) => formatMoney(v)}
                />
              </DetailHighlightPanel>
            </DetailSection>
          </DetailTabPanel>
        ) : null}
      </AnimatePresence>
    </DetailBody>
  )
}

function RegisterPartnerModal({ open, form, onChange, reminder, onClose, onSubmit }) {
  return (
    <DetailModal
      open={open}
      onClose={onClose}
      hero={
        <GradientHero
          eyebrow="Fleet onboarding"
          title="Register delivery partner"
          subtitle={form.name.trim() || 'Documents are verified before the partner can go online'}
          tone="sage"
          badge={<StatusBadge label="Verification required" tone="gold" onPhoto />}
        />
      }
    >
      <DetailBody>
        <DetailSection title="Partner details">
          <div className="register-form-grid">
            <FormField label="Full name">
              <input className="register-input" value={form.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. Jordan Lee" />
            </FormField>
            <FormField label="Phone">
              <input type="tel" className="register-input" value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+1 212 555 0100" />
            </FormField>
            <FormField label="Email" className="register-field--full">
              <input type="email" className="register-input" value={form.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="jordan@example.com" />
            </FormField>
          </div>
        </DetailSection>
        <DetailSection title="Zone & vehicle">
          <div className="register-form-grid">
            <FormField label="Delivery zone">
              <select className="register-input" value={form.zone} onChange={(e) => onChange({ zone: e.target.value })}>
                {partnerZones.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Vehicle">
              <select className="register-input" value={form.vehicle} onChange={(e) => onChange({ vehicle: e.target.value })}>
                {partnerVehicles.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </FormField>
            {form.vehicle !== 'Bicycle' ? (
              <FormField label="Plate / registration" className="register-field--full">
                <input className="register-input" value={form.vehicleNo} onChange={(e) => onChange({ vehicleNo: e.target.value })} placeholder="NY-EB-0000" />
              </FormField>
            ) : null}
          </div>
        </DetailSection>
        <motion.div variants={detailBodyItem}>
          <FormReminder message={reminder} />
        </motion.div>
        <motion.div className="register-modal-footer" variants={detailBodyItem}>
          <button type="button" onClick={onClose} className="register-btn register-btn--ghost">
            Cancel
          </button>
          <button type="button" onClick={onSubmit} className="register-btn register-btn--primary">
            Submit for verification
          </button>
        </motion.div>
      </DetailBody>
    </DetailModal>
  )
}

export default function DeliveryPartnersPage() {
  const notify = useToast()
  const baseOrders = useMemo(() => getOrderManagementSnapshot().orders, [])

  const [addedPartners, setAddedPartners] = usePersistentState(PARTNERS_ADDED_KEY, [])
  const [overrides, setOverrides] = usePersistentState('partners-overrides', {})
  const [assignments, setAssignments] = usePersistentState(PARTNER_ASSIGNMENTS_KEY, {})

  const [bucket, setBucket] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState('overview')
  const [assignId, setAssignId] = useState('')
  const [assignReminder, setAssignReminder] = useState('')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formReminder, setFormReminder] = useState('')
  const [confirm, setConfirm] = useState(null)

  const partners = useMemo(
    () =>
      [...addedPartners, ...deliveryPartners].map((p) => {
        const o = overrides[p.id] ?? {}
        return {
          ...p,
          status: o.status ?? p.status,
          online: o.online ?? p.online,
          suspendReason: o.suspendReason ?? p.suspendReason,
          documents: p.documents.map((d) => ({ ...d, status: o.docs?.[d.id] ?? d.status })),
        }
      }),
    [addedPartners, overrides],
  )

  const partnersById = useMemo(() => Object.fromEntries(partners.map((p) => [p.id, p])), [partners])

  const orders = useMemo(
    () =>
      baseOrders.map((o) => {
        const partnerId = assignments[o.id] ?? o.partnerId
        return { ...o, partnerId, partner: partnerId ? partnersById[partnerId]?.name ?? '—' : null }
      }),
    [baseOrders, assignments, partnersById],
  )

  const filterCounts = useMemo(
    () => Object.fromEntries(partnerFilterBuckets.map((b) => [b.id, partners.filter((p) => partnerMatches(p, b.id)).length])),
    [partners],
  )

  const metrics = useMemo(() => {
    const rated = partners.filter((p) => p.rating > 0 && p.status === 'active')
    const avg = rated.reduce((s, p) => s + p.rating, 0) / Math.max(rated.length, 1)
    const active = partners.filter((p) => p.status === 'active').length
    return [
      { id: 'partners', label: 'Total partners', value: String(partners.length), change: `${active} active`, accent: 'copper' },
      { id: 'online', label: 'Online now', value: String(filterCounts.online), change: `${Math.round((filterCounts.online / Math.max(active, 1)) * 100)}% of active`, accent: 'sage' },
      { id: 'verification', label: 'Verification', value: String(filterCounts.pending_verification), change: 'Docs to review', accent: 'gold' },
      { id: 'rating', label: 'Avg rating', value: avg.toFixed(2), change: `${rated.length} rated partners`, accent: 'danger' },
    ]
  }, [partners, filterCounts])

  const visible = useMemo(() => partners.filter((p) => partnerMatches(p, bucket)), [partners, bucket])
  const paged = useMemo(() => paginate(visible, page, PAGE_SIZE), [visible, page])
  const selected = selectedId ? partnersById[selectedId] ?? null : null
  const history = useMemo(() => (selected ? orders.filter((o) => o.partnerId === selected.id) : []), [orders, selected])
  const assignable = useMemo(() => orders.filter((o) => !o.partnerId && ASSIGNABLE_STATUSES.has(o.status)), [orders])

  const changeBucket = (id) => {
    setBucket(id)
    setPage(1)
  }

  const patchOverride = (id, patch) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch, docs: { ...prev[id]?.docs, ...patch.docs } } }))

  const openPartner = (row) => {
    setSelectedId(row.id)
    setAssignId('')
    setAssignReminder('')
    setTab('overview')
    setModalOpen(true)
  }

  const columns = [
    {
      id: 'partner',
      label: 'Partner',
      mobile: 'title',
      width: 'minmax(10rem, 1.4fr)',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={row.name} photo={row.photo} tone={row.status === 'suspended' ? 'danger' : 'copper'} online={row.status === 'active' ? row.online : undefined} />
          <span className="min-w-0">
            <span className="font-display block truncate text-sm font-bold">{row.name}</span>
            <span className="text-muted block truncate text-xs">
              {row.zone} · {row.vehicle}
            </span>
          </span>
        </div>
      ),
    },
    {
      id: 'today',
      label: 'Today',
      mobile: 'sub',
      width: 'minmax(7rem, 1fr)',
      render: (row) => (
        <span className="text-muted block truncate text-xs font-semibold sm:text-sm">
          {row.deliveriesToday} deliveries · {row.onTimePct ? `${row.onTimePct}% on time` : 'New'}
        </span>
      ),
    },
    {
      id: 'rating',
      label: 'Rating',
      mobile: 'meta',
      width: 'minmax(4rem, 0.5fr)',
      align: 'end',
      render: (row) => <span className="font-bold tabular-nums">{row.rating > 0 ? `★ ${row.rating}` : '—'}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      mobile: 'badge',
      width: 'minmax(7.5rem, 0.7fr)',
      align: 'end',
      render: (row) => {
        const meta = availability(row)
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
  ]

  const submitRegistration = () => {
    const reminder = registrationReminder(form)
    if (reminder) {
      setFormReminder(reminder)
      return
    }
    setConfirm({
      title: 'Submit partner for verification?',
      message: `${form.name.trim()} will be added as Verification pending. They can go online once documents are approved.`,
      confirmLabel: 'Submit',
      onConfirm: () => {
        const record = {
          id: makeId('p'),
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          zone: form.zone,
          vehicle: form.vehicle,
          vehicleNo: form.vehicle === 'Bicycle' ? '—' : form.vehicleNo.trim(),
          status: 'pending_verification',
          online: false,
          rating: 0,
          deliveriesToday: 0,
          totalDeliveries: 0,
          onTimePct: 0,
          acceptancePct: 0,
          joinedAt: todayIso(),
          earningsWeek: [0, 0, 0, 0, 0, 0, 0],
          tipsWeek: 0,
          documents: deliveryPartners[0].documents.map((d) => ({ ...d, status: 'pending' })),
        }
        setAddedPartners((prev) => [record, ...prev])
        appendAudit('Partners', 'Registered partner', record.name)
        notify(`${record.name} submitted for verification`)
        changeBucket('pending_verification')
        setRegisterOpen(false)
        setForm(emptyForm)
        setFormReminder('')
        setConfirm(null)
      },
    })
  }

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Partner summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <ModuleHeader
            title="Delivery partners"
            subtitle="Verification, dispatch status, assignments and earnings"
            actionLabel="Register partner"
            onAction={() => setRegisterOpen(true)}
          />
          <div className="module-filters">
            {partnerFilterBuckets.map((f) => (
              <FilterChip key={f.id} label={f.label} count={filterCounts[f.id]} active={bucket === f.id} onClick={() => changeBucket(f.id)} />
            ))}
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          rows={paged.items}
          page={paged.page}
          rowKey={(row) => row.id}
          selectedKey={modalOpen ? selectedId : null}
          onRowClick={openPartner}
          emptyMessage="No partners in this view."
        />
        <Pagination {...paged} onPage={setPage} />
      </div>

      <DetailModal
        open={modalOpen && Boolean(selected)}
        onClose={() => setModalOpen(false)}
        hero={
          selected ? (
            <GradientHero
              eyebrow="Marlow courier"
              title={selected.name}
              subtitle={`${selected.zone} zone · ${selected.vehicle}`}
              tone={selected.status === 'suspended' ? 'danger' : selected.status === 'pending_verification' ? 'gold' : 'copper'}
              avatar={<Avatar name={selected.name} photo={selected.photo} tone="photo" size="lg" />}
              aside={
                selected.rating > 0 ? (
                  <p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">★ {selected.rating}</p>
                ) : null
              }
              badge={<StatusBadge label={availability(selected).label} tone={availability(selected).tone} onPhoto />}
            />
          ) : null
        }
      >
        {selected ? (
          <PartnerDetailBody
            key={selected.id}
            partner={selected}
            tab={tab}
            onTab={setTab}
            history={history}
            assignable={assignable}
            assignId={assignId}
            onAssignId={(id) => {
              setAssignId(id)
              setAssignReminder('')
            }}
            assignReminder={assignReminder}
            onAssign={() => {
              if (selected.status !== 'active') {
                setAssignReminder('This partner needs to be active before taking orders.')
                return
              }
              if (!selected.online) {
                setAssignReminder('Switch them online first — offline partners can’t receive orders.')
                return
              }
              const order = assignable.find((o) => o.id === assignId)
              if (!order) {
                setAssignReminder('Pick an order from the list, then tap Assign.')
                return
              }
              setConfirm({
                title: 'Assign order?',
                message: `Assign #${order.id} from ${order.restaurant} to ${selected.name}?`,
                confirmLabel: 'Assign order',
                onConfirm: () => {
                  setAssignments((prev) => ({ ...prev, [order.id]: selected.id }))
                  appendAudit('Partners', `Assigned order #${order.id}`, selected.name)
                  notify(`#${order.id} assigned to ${selected.name}`)
                  setAssignId('')
                  setConfirm(null)
                },
              })
            }}
            onToggleOnline={(next) => {
              patchOverride(selected.id, { online: next })
              appendAudit('Partners', next ? 'Set online' : 'Set offline', selected.name)
              notify(`${selected.name} is now ${next ? 'online' : 'offline'}`, 'info')
            }}
            onSuspendToggle={() => {
              const reactivating = selected.status === 'suspended'
              setConfirm({
                title: reactivating ? 'Reactivate partner?' : 'Suspend partner?',
                message: reactivating
                  ? `${selected.name} will be able to go online and receive orders again.`
                  : `${selected.name} will be taken offline and removed from dispatch until reactivated.`,
                confirmLabel: reactivating ? 'Reactivate' : 'Suspend',
                tone: reactivating ? 'copper' : 'danger',
                onConfirm: () => {
                  patchOverride(selected.id, reactivating ? { status: 'active' } : { status: 'suspended', online: false, suspendReason: 'Suspended by admin' })
                  appendAudit('Partners', reactivating ? 'Reactivated partner' : 'Suspended partner', selected.name)
                  notify(`${selected.name} ${reactivating ? 'reactivated' : 'suspended'}`, reactivating ? 'success' : 'danger')
                  setConfirm(null)
                },
              })
            }}
            onDocDecision={(doc, status) => {
              setConfirm({
                title: status === 'verified' ? 'Approve document?' : 'Reject document?',
                message: `${doc.label} for ${selected.name} will be marked ${status === 'verified' ? 'verified' : 'rejected'}.`,
                confirmLabel: status === 'verified' ? 'Approve' : 'Reject',
                tone: status === 'verified' ? 'copper' : 'danger',
                onConfirm: () => {
                  patchOverride(selected.id, { docs: { [doc.id]: status } })
                  appendAudit('Partners', `${status === 'verified' ? 'Approved' : 'Rejected'} ${doc.label}`, selected.name)
                  notify(`${doc.label} ${status === 'verified' ? 'approved' : 'rejected'}`, status === 'verified' ? 'success' : 'danger')
                  setConfirm(null)
                },
              })
            }}
            onApprove={() => {
              setConfirm({
                title: 'Activate partner?',
                message: `${selected.name} will become an active partner and can start accepting deliveries.`,
                confirmLabel: 'Activate',
                onConfirm: () => {
                  patchOverride(selected.id, { status: 'active' })
                  appendAudit('Partners', 'Activated partner', selected.name)
                  notify(`${selected.name} is now active`)
                  setConfirm(null)
                },
              })
            }}
          />
        ) : null}
      </DetailModal>

      <RegisterPartnerModal
        open={registerOpen}
        form={form}
        reminder={formReminder}
        onChange={(patch) => {
          setForm((prev) => ({ ...prev, ...patch }))
          setFormReminder('')
        }}
        onClose={() => {
          setRegisterOpen(false)
          setFormReminder('')
        }}
        onSubmit={submitRegistration}
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
