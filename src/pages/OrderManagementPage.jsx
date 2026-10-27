import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import AdminDataTable from '../components/ui/AdminDataTable.jsx'
import DetailModal from '../components/ui/DetailModal.jsx'
import {
  DetailBody,
  DetailHighlightPanel,
  DetailSection,
  DetailStat,
  DetailStatGrid,
  detailBodyItem,
} from '../components/ui/DetailModalParts.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatMoney } from '../lib/formatMoney.js'
import { paginate } from '../lib/pagination.js'
import { getOrderManagementSnapshot, orderMatchesBucket, restaurants as platformRestaurants } from '../data/platformData.js'
import { readAllPartners, readPartnerAssignments } from '../lib/partnerAssignments.js'

const PAGE_SIZE = 7

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const orderHeroTone = {
  copper: 'from-copper/90 via-copper-dark/85 to-ink/90',
  sage: 'from-sage/90 via-sage/80 to-ink/90',
  gold: 'from-gold/85 via-copper/75 to-ink/90',
  danger: 'from-danger/85 via-copper-dark/70 to-ink/90',
  muted: 'from-ink/80 via-ink/70 to-ink/90',
}

function OrderModalHero({ order, kitchenImage }) {
  const gradient = orderHeroTone[order.statusTone] ?? orderHeroTone.copper
  return (
    <div className={`detail-modal-hero--flush relative overflow-hidden bg-gradient-to-br ${gradient} px-5 pt-7 pb-5 sm:px-6 sm:pt-8`}>
      {kitchenImage ? (
        <img
          src={kitchenImage}
          alt=""
          className="detail-modal-hero-media pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 mix-blend-overlay"
        />
      ) : null}
      <div className="detail-modal-hero-shine" aria-hidden="true" />
      <div className="relative z-[1]">
        <p className="text-paper/75 text-[0.65rem] font-extrabold tracking-[0.18em] uppercase">Marlow order</p>
        <h2 id="detail-modal-title" className="font-display mt-1 text-2xl font-bold tracking-tight break-all text-paper sm:text-3xl">
          #{order.id}
        </h2>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-paper/90 text-sm font-semibold">{order.placedAt}</p>
            <span className="modal-hero-status">
              <StatusBadge label={order.statusLabel} tone={order.statusTone} onPhoto />
            </span>
          </div>
          <p className="font-display shrink-0 text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(order.total)}</p>
        </div>
      </div>
    </div>
  )
}

function OrderTracking({ steps }) {
  return (
    <div className="detail-timeline">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const dotClass = step.current
          ? 'detail-timeline-dot detail-timeline-dot--current'
          : step.done
            ? 'detail-timeline-dot detail-timeline-dot--done'
            : 'detail-timeline-dot detail-timeline-dot--pending'
        return (
          <motion.div
            key={step.id}
            className="detail-timeline-step"
            variants={detailBodyItem}
            custom={i}
            initial="hidden"
            animate="show"
          >
            {!isLast ? <span className="detail-timeline-rail" aria-hidden="true" /> : null}
            <span className={dotClass} aria-hidden="true" />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`text-sm font-bold ${step.current ? 'text-copper-dark' : 'text-ink'}`}>{step.label}</p>
              <p className="text-muted mt-0.5 text-xs font-semibold tabular-nums">{step.time}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function OrderDetailBody({ order }) {
  return (
    <DetailBody>
      <DetailSection title="Order details">
        <DetailStatGrid>
          <DetailStat
            label="Customer"
            value={order.customer}
            hint={order.customerEmail}
            accent="copper"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
              </svg>
            }
          />
          <DetailStat
            label="Restaurant"
            value={order.restaurant}
            accent="sage"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10h16M6 10V6h12v4M8 20v-6h8v6" strokeLinejoin="round" />
              </svg>
            }
          />
          <DetailStat
            label="Payment"
            value={order.payment}
            accent="gold"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M3 10h18" />
              </svg>
            }
          />
          <DetailStat
            label="ETA"
            value={order.eta}
            accent="muted"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l2.5 2" strokeLinecap="round" />
              </svg>
            }
          />
        </DetailStatGrid>
      </DetailSection>

      <DetailSection title="Delivery">
        <DetailHighlightPanel>
          <p className="text-sm leading-relaxed font-semibold">{order.address}</p>
          {order.partner ? (
            <p className="text-sage mt-2 inline-flex rounded-full bg-sage/10 px-2.5 py-1 text-xs font-bold">
              Partner · {order.partner}
            </p>
          ) : null}
        </DetailHighlightPanel>
      </DetailSection>

      <DetailSection title="Line items">
        <div className="detail-line-list">
          {order.items.map((item) => (
            <div key={`${item.name}-${item.price}`} className="detail-line-row">
              <span className="min-w-0 truncate font-semibold">
                <span className="text-copper-dark mr-1.5 font-extrabold tabular-nums">{item.qty}×</span>
                {item.name}
              </span>
              <span className="shrink-0 font-bold tabular-nums">{formatMoney(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="detail-line-row detail-line-row--total">
            <span>Total</span>
            <span className="text-copper-dark tabular-nums">{formatMoney(order.total)}</span>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Live tracking">
        <OrderTracking steps={order.tracking} />
      </DetailSection>

      {order.refund ? (
        <DetailSection title="Refund request">
          <DetailHighlightPanel tone="danger">
            <p className="text-sm font-bold">
              {formatMoney(order.refund.amount)} · {order.refund.reason}
            </p>
            <p className="text-muted mt-1 text-xs font-semibold capitalize">Status · {order.refund.status}</p>
          </DetailHighlightPanel>
        </DetailSection>
      ) : null}

      {order.cancelReason ? (
        <motion.p className="text-muted text-sm font-medium" variants={detailBodyItem}>
          <span className="text-danger font-bold">Cancel reason · </span>
          {order.cancelReason}
        </motion.p>
      ) : null}
    </DetailBody>
  )
}

export default function OrderManagementPage() {
  const { filters, filterCounts, metrics, orders } = useMemo(() => {
    const snapshot = getOrderManagementSnapshot()
    const assignments = readPartnerAssignments()
    const partnerNames = Object.fromEntries(readAllPartners().map((p) => [p.id, p.name]))
    return {
      ...snapshot,
      orders: snapshot.orders.map((o) =>
        assignments[o.id] ? { ...o, partnerId: assignments[o.id], partner: partnerNames[assignments[o.id]] ?? o.partner } : o,
      ),
    }
  }, [])
  const [bucket, setBucket] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const visible = useMemo(
    () => orders.filter((o) => orderMatchesBucket(o, bucket)),
    [orders, bucket],
  )

  const paged = useMemo(() => paginate(visible, page, PAGE_SIZE), [visible, page])
  const selected = orders.find((o) => o.id === selectedId) ?? null
  const kitchenById = useMemo(() => Object.fromEntries(platformRestaurants.map((r) => [r.id, r])), [])

  useEffect(() => {
    setPage(1)
    setSelectedId(null)
    setModalOpen(false)
  }, [bucket])

  const columns = useMemo(
    () => [
      {
        id: 'order',
        label: 'Order',
        mobile: 'title',
        width: 'minmax(9.5rem, 1.35fr)',
        render: (row) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="bg-copper/12 text-copper-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-extrabold">
              {initials(row.customer)}
            </span>
            <span className="min-w-0">
              <span className="font-display block truncate text-sm font-bold">#{row.id}</span>
              <span className="text-muted block truncate text-xs">{row.customer}</span>
            </span>
          </div>
        ),
      },
      {
        id: 'restaurant',
        label: 'Restaurant',
        mobile: 'sub',
        width: 'minmax(8rem, 1.15fr)',
        render: (row) => <span className="block truncate font-medium">{row.restaurant}</span>,
      },
      {
        id: 'total',
        label: 'Total',
        mobile: 'meta',
        width: 'minmax(4.75rem, 0.55fr)',
        align: 'end',
        render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.total)}</span>,
      },
      {
        id: 'status',
        label: 'Status',
        mobile: 'badge',
        width: 'minmax(9.5rem, 0.8fr)',
        align: 'end',
        render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />,
      },
    ],
    [],
  )

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Order summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Orders</h2>
            <p className="text-muted text-xs font-medium">Marlow kitchens · tap a row for full details</p>
          </div>
          <div className="module-filters">
            {filters.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                count={filterCounts[f.id]}
                active={bucket === f.id}
                onClick={() => setBucket(f.id)}
              />
            ))}
          </div>
        </div>

        <AdminDataTable
          tableClass="admin-table--orders"
          columns={columns}
          rows={paged.items}
          page={paged.page}
          rowKey={(row) => row.id}
          selectedKey={selectedId}
          onRowClick={(row) => {
            setSelectedId(row.id)
            setModalOpen(true)
          }}
          emptyMessage="No orders in this view."
        />
        <Pagination
          page={paged.page}
          totalPages={paged.totalPages}
          rangeStart={paged.rangeStart}
          rangeEnd={paged.rangeEnd}
          total={paged.total}
          onPage={setPage}
        />
      </div>

      <DetailModal
        open={modalOpen && Boolean(selected)}
        onClose={() => setModalOpen(false)}
        hero={selected ? <OrderModalHero order={selected} kitchenImage={kitchenById[selected.restaurantId]?.image} /> : null}
      >
        {selected ? <OrderDetailBody key={selected.id} order={selected} /> : null}
      </DetailModal>
    </div>
  )
}
