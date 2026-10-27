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
import GradientHero from '../components/ui/GradientHero.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { customers as baseCustomers, getOrderManagementSnapshot } from '../data/platformData.js'
import { customerFilterBuckets, customerProfiles, customerStatusMeta } from '../data/moduleData.js'
import { appendAudit } from '../lib/auditLog.js'
import { formatDate } from '../lib/format.js'
import { formatMoney } from '../lib/formatMoney.js'
import { paginate } from '../lib/pagination.js'
import { usePersistentState } from '../lib/usePersistentState.js'

const PAGE_SIZE = 7

const detailTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'orders', label: 'Orders' },
  { id: 'feedback', label: 'Refunds & reviews' },
  { id: 'complaints', label: 'Complaints' },
]

const tierTone = { Platinum: 'sage', Gold: 'gold', Silver: 'muted', Bronze: 'copper' }

function customerMatches(customer, bucket) {
  if (bucket === 'all') return true
  if (bucket === 'active' || bucket === 'blocked') return customer.status === bucket
  if (bucket === 'complaints') return customer.openComplaints > 0
  if (bucket === 'refunds') return customer.refunds.length > 0
  return true
}

function Stars({ rating }) {
  return (
    <span className="text-gold text-sm tracking-tight" aria-label={`${rating} out of 5`}>
      {'★'.repeat(rating)}
      <span className="text-line">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function CustomerDetailBody({ customer, tab, onTab, onStatusToggle, onResolveComplaint }) {
  return (
    <DetailBody>
      <motion.div variants={detailBodyItem}>
        <TabBar tabs={detailTabs} active={tab} onChange={onTab} layoutId="customer-detail-tab" />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'profile' ? (
          <DetailTabPanel key="profile">
            <DetailStatGrid>
              <DetailStat label="Email" value={customer.email} accent="copper" />
              <DetailStat label="Phone" value={customer.phone} accent="muted" />
              <DetailStat label="Lifetime spend" value={formatMoney(customer.lifetimeSpend)} hint={`${customer.ordersCount} orders`} accent="sage" />
              <DetailStat label="Member since" value={formatDate(customer.joinedAt)} hint={`${customer.tier} tier`} accent="gold" />
            </DetailStatGrid>
            <DetailSection title="Saved addresses">
              <div className="detail-line-list">
                {customer.addresses.map((a) => (
                  <div key={a.id} className="detail-line-row">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{a.label}</p>
                      <p className="text-muted text-xs font-semibold break-words">{a.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
            <DetailSection title="Account status">
              <DetailHighlightPanel tone={customer.status === 'blocked' ? 'danger' : 'copper'}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold">
                    {customer.status === 'blocked'
                      ? `Blocked · ${customer.blockReason ?? 'Policy review'}. The customer cannot place orders.`
                      : 'Account in good standing. Blocking prevents new orders and logins.'}
                  </p>
                  <button
                    type="button"
                    onClick={onStatusToggle}
                    className={`action-btn ${customer.status === 'blocked' ? 'action-btn--sage' : 'action-btn--danger'}`}
                  >
                    {customer.status === 'blocked' ? 'Unblock account' : 'Block account'}
                  </button>
                </div>
              </DetailHighlightPanel>
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'orders' ? (
          <DetailTabPanel key="orders">
            <DetailSection title={`Recent orders · ${customer.orders.length}`}>
              {customer.orders.length === 0 ? (
                <p className="text-muted text-sm font-semibold">No orders in the current window.</p>
              ) : (
                <div className="detail-line-list">
                  {customer.orders.map((o) => (
                    <div key={o.id} className="detail-line-row flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">#{o.id} · {o.restaurant}</p>
                        <p className="text-muted truncate text-xs font-semibold">{o.placedAt} · {o.payment}</p>
                      </div>
                      <div className="detail-line-row-actions">
                        <StatusBadge label={o.statusLabel} tone={o.statusTone} />
                        <span className="font-bold tabular-nums">{formatMoney(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'feedback' ? (
          <DetailTabPanel key="feedback">
            <DetailSection title="Refund history">
              {customer.refunds.length === 0 ? (
                <p className="text-muted text-sm font-semibold">No refunds requested.</p>
              ) : (
                <div className="detail-line-list">
                  {customer.refunds.map((o) => (
                    <div key={o.id} className="detail-line-row flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">#{o.id} · {o.refund.reason}</p>
                        <p className="text-muted truncate text-xs font-semibold">{o.restaurant} · {o.refund.requestedAt}</p>
                      </div>
                      <div className="detail-line-row-actions">
                        <StatusBadge label={o.refund.status} tone={o.refund.status === 'pending' ? 'gold' : 'sage'} />
                        <span className="text-danger font-bold tabular-nums">−{formatMoney(o.refund.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>
            <DetailSection title="Reviews">
              {customer.reviews.length === 0 ? (
                <p className="text-muted text-sm font-semibold">No reviews written yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.reviews.map((r) => (
                    <DetailHighlightPanel key={r.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-bold">{r.restaurant}</p>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed font-medium">“{r.text}”</p>
                      <p className="text-muted mt-1 text-xs font-semibold">{formatDate(r.date)}</p>
                    </DetailHighlightPanel>
                  ))}
                </div>
              )}
            </DetailSection>
          </DetailTabPanel>
        ) : null}

        {tab === 'complaints' ? (
          <DetailTabPanel key="complaints">
            <DetailSection title="Complaints">
              {customer.complaints.length === 0 ? (
                <p className="text-muted text-sm font-semibold">No complaints filed — happy customer.</p>
              ) : (
                <div className="detail-line-list">
                  {customer.complaints.map((c) => (
                    <div key={c.id} className="detail-line-row flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold break-words">{c.subject}</p>
                        <p className="text-muted text-xs font-semibold">
                          {c.orderId ? `#${c.orderId} · ` : ''}
                          {formatDate(c.date)}
                        </p>
                      </div>
                      <div className="detail-line-row-actions">
                        <StatusBadge label={c.status === 'open' ? 'Open' : 'Resolved'} tone={c.status === 'open' ? 'gold' : 'sage'} />
                        {c.status === 'open' ? (
                          <button type="button" onClick={() => onResolveComplaint(c)} className="action-btn action-btn--sage action-btn--sm">
                            Resolve
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>
          </DetailTabPanel>
        ) : null}
      </AnimatePresence>
    </DetailBody>
  )
}

export default function CustomerManagementPage() {
  const notify = useToast()
  const orders = useMemo(() => getOrderManagementSnapshot().orders, [])

  const [statusOverrides, setStatusOverrides] = usePersistentState('customers-status', {})
  const [resolvedComplaints, setResolvedComplaints] = usePersistentState('customers-resolved-complaints', [])

  const [bucket, setBucket] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState('profile')
  const [confirm, setConfirm] = useState(null)

  const customers = useMemo(() => {
    const resolved = new Set(resolvedComplaints)
    return baseCustomers.map((c) => {
      const profile = customerProfiles[c.id] ?? { addresses: [], reviews: [], complaints: [], lifetimeSpend: 0 }
      const own = orders.filter((o) => o.customerId === c.id)
      const complaints = profile.complaints.map((cp) => ({
        ...cp,
        status: resolved.has(`${c.id}:${cp.id}`) ? 'resolved' : cp.status,
      }))
      return {
        ...c,
        ...profile,
        status: statusOverrides[c.id] ?? profile.status ?? c.status,
        orders: own,
        refunds: own.filter((o) => o.refund),
        complaints,
        openComplaints: complaints.filter((cp) => cp.status === 'open').length,
      }
    })
  }, [orders, statusOverrides, resolvedComplaints])

  const filterCounts = useMemo(
    () => Object.fromEntries(customerFilterBuckets.map((b) => [b.id, customers.filter((c) => customerMatches(c, b.id)).length])),
    [customers],
  )

  const metrics = useMemo(() => {
    const totalSpend = customers.reduce((s, c) => s + c.lifetimeSpend, 0)
    const open = customers.reduce((s, c) => s + c.openComplaints, 0)
    return [
      { id: 'users', label: 'Customers', value: String(customers.length), change: `${filterCounts.active} active`, accent: 'copper' },
      { id: 'spend', label: 'Avg lifetime spend', value: formatMoney(Math.round(totalSpend / Math.max(customers.length, 1))), change: `${formatMoney(totalSpend)} total`, accent: 'sage' },
      { id: 'complaints', label: 'Open complaints', value: String(open), change: `${filterCounts.complaints} customers`, accent: 'gold' },
      { id: 'failed', label: 'Blocked accounts', value: String(filterCounts.blocked), change: 'Policy holds', accent: 'danger' },
    ]
  }, [customers, filterCounts])

  const visible = useMemo(
    () => customers.filter((c) => customerMatches(c, bucket)),
    [customers, bucket],
  )

  const paged = useMemo(() => paginate(visible, page, PAGE_SIZE), [visible, page])
  const selected = customers.find((c) => c.id === selectedId) ?? null

  const columns = [
    {
      id: 'customer',
      label: 'Customer',
      mobile: 'title',
      width: 'minmax(11rem, 1.5fr)',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={row.name} photo={row.photo} tone={row.status === 'blocked' ? 'danger' : tierTone[row.tier] ?? 'copper'} />
          <span className="min-w-0">
            <span className="font-display block truncate text-sm font-bold">{row.name}</span>
            <span className="text-muted block truncate text-xs">{row.email}</span>
          </span>
        </div>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      mobile: 'sub',
      width: 'minmax(7rem, 0.9fr)',
      render: (row) => (
        <span className="text-muted block truncate text-xs font-semibold sm:text-sm">
          {row.ordersCount} orders · {row.tier}
        </span>
      ),
    },
    {
      id: 'spend',
      label: 'Spend',
      mobile: 'meta',
      width: 'minmax(4.5rem, 0.6fr)',
      align: 'end',
      render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.lifetimeSpend)}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      mobile: 'badge',
      width: 'minmax(6.5rem, 0.6fr)',
      align: 'end',
      render: (row) => {
        const meta = row.openComplaints > 0 && row.status === 'active' ? { label: `${row.openComplaints} complaint`, tone: 'gold' } : customerStatusMeta[row.status]
        return <StatusBadge label={meta.label} tone={meta.tone} />
      },
    },
  ]

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Customer summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight">Customers</h2>
            <p className="text-muted text-xs font-medium text-pretty sm:text-sm">
              Marlow customers · tap a row for profile, orders & complaints
            </p>
          </div>
          <div className="module-filters">
            {customerFilterBuckets.map((f) => (
              <FilterChip key={f.id} label={f.label} count={filterCounts[f.id]} active={bucket === f.id} onClick={() => {
                  setBucket(f.id)
                  setPage(1)
                }} />
            ))}
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          rows={paged.items}
          page={paged.page}
          rowKey={(row) => row.id}
          selectedKey={modalOpen ? selectedId : null}
          onRowClick={(row) => {
            setSelectedId(row.id)
            setTab('profile')
            setModalOpen(true)
          }}
          emptyMessage="No customers match this view."
        />
        <Pagination {...paged} onPage={setPage} />
      </div>

      <DetailModal
        open={modalOpen && Boolean(selected)}
        onClose={() => setModalOpen(false)}
        hero={
          selected ? (
            <GradientHero
              eyebrow="Marlow customer"
              title={selected.name}
              subtitle={selected.email}
              tone={selected.status === 'blocked' ? 'danger' : 'ink'}
              avatar={<Avatar name={selected.name} photo={selected.photo} tone="photo" size="lg" />}
              aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(selected.lifetimeSpend)}</p>}
              badge={
                <>
                  <StatusBadge label={customerStatusMeta[selected.status].label} tone={customerStatusMeta[selected.status].tone} onPhoto />
                  <StatusBadge label={`${selected.tier} tier`} tone="gold" onPhoto />
                </>
              }
            />
          ) : null
        }
      >
        {selected ? (
          <CustomerDetailBody
            key={selected.id}
            customer={selected}
            tab={tab}
            onTab={setTab}
            onStatusToggle={() => {
              const unblocking = selected.status === 'blocked'
              setConfirm({
                title: unblocking ? 'Unblock account?' : 'Block account?',
                message: unblocking
                  ? `${selected.name} will be able to log in and place orders again.`
                  : `${selected.name} will be signed out and unable to place new orders.`,
                confirmLabel: unblocking ? 'Unblock' : 'Block account',
                tone: unblocking ? 'copper' : 'danger',
                onConfirm: () => {
                  setStatusOverrides((prev) => ({ ...prev, [selected.id]: unblocking ? 'active' : 'blocked' }))
                  appendAudit('Customers', unblocking ? 'Unblocked account' : 'Blocked account', selected.name)
                  notify(`${selected.name} ${unblocking ? 'unblocked' : 'blocked'}`, unblocking ? 'success' : 'danger')
                  setConfirm(null)
                },
              })
            }}
            onResolveComplaint={(complaint) => {
              setConfirm({
                title: 'Resolve complaint?',
                message: `Mark “${complaint.subject}” as resolved for ${selected.name}?`,
                confirmLabel: 'Resolve',
                onConfirm: () => {
                  setResolvedComplaints((prev) => [...new Set([...prev, `${selected.id}:${complaint.id}`])])
                  appendAudit('Customers', 'Resolved complaint', `${selected.name} · ${complaint.subject}`)
                  notify('Complaint resolved')
                  setConfirm(null)
                },
              })
            }}
          />
        ) : null}
      </DetailModal>

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
