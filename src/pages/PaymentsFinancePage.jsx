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
  detailBodyItem,
} from '../components/ui/DetailModalParts.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import GradientHero from '../components/ui/GradientHero.jsx'
import MiniBars from '../components/ui/MiniBars.jsx'
import ModuleHeader from '../components/ui/ModuleHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import {
  analytics,
  customers,
  deliveryPartners,
  getOrderManagementSnapshot,
  restaurants,
} from '../data/platformData.js'
import {
  PARTNER_PAY_PER_DELIVERY,
  SETTLEMENT_CYCLE,
  failedPaymentsSeed,
  pricingDefaults,
  transactionFilterBuckets,
  transactionStatusMeta,
} from '../data/moduleData.js'
import { appendAudit } from '../lib/auditLog.js'
import { downloadCsv } from '../lib/csv.js'
import { formatMoney } from '../lib/formatMoney.js'
import { readLocalStorageJson } from '../lib/localStorageJson.js'
import { paginate } from '../lib/pagination.js'
import { loadRestaurantAdminPersist } from '../lib/restaurantAdminPersist.js'
import { STORAGE_PREFIX, usePersistentState } from '../lib/usePersistentState.js'

const PAGE_SIZE = 7
const COMPLETED = new Set(['delivered', 'refund_requested'])

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'settlements', label: 'Settlements' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'refunds', label: 'Refunds' },
  { id: 'reports', label: 'Taxes & reports' },
]

const round2 = (n) => Math.round(n * 100) / 100

function useFinanceData({ retried, refundDecisions, settled, paidOut }) {
  return useMemo(() => {
    const pricing = { ...pricingDefaults, ...readLocalStorageJson(`${STORAGE_PREFIX}settings-pricing`, {}) }
    const commissionOverrides = loadRestaurantAdminPersist().commissionByRestaurantId
    const restaurantsById = Object.fromEntries(
      restaurants.map((r) => [r.id, { ...r, commissionPct: commissionOverrides[r.id] ?? r.commissionPct }]),
    )
    const customersById = Object.fromEntries(customers.map((c) => [c.id, c]))
    const orders = getOrderManagementSnapshot().orders
    const retriedSet = new Set(retried)

    const orderTx = orders.map((o, i) => {
      const decision = refundDecisions[o.id]
      let status = o.status === 'cancelled' ? 'voided' : 'success'
      if (o.refund && decision === 'approved') status = 'refunded'
      return {
        id: `TX-${90330 - i * 3}`,
        orderId: o.id,
        customer: o.customer,
        restaurant: o.restaurant,
        restaurantId: o.restaurantId,
        method: o.payment,
        at: o.placedAt,
        amount: o.total,
        status,
        refundAmount: o.refund && decision === 'approved' ? o.refund.amount : 0,
      }
    })

    const failedTx = failedPaymentsSeed.map((f) => ({
      ...f,
      customer: customersById[f.customerId]?.name ?? '—',
      restaurant: restaurantsById[f.restaurantId]?.name ?? '—',
      status: retriedSet.has(f.id) ? 'success' : 'failed',
      refundAmount: 0,
    }))

    const transactions = [...failedTx, ...orderTx].map((tx) => {
      const commissionPct = restaurantsById[tx.restaurantId]?.commissionPct ?? pricing.defaultCommissionPct
      const tax = round2(tx.amount * (pricing.taxPct / 100))
      const commission = round2(tx.amount * (commissionPct / 100))
      return {
        ...tx,
        commissionPct,
        tax,
        deliveryFee: pricing.baseDeliveryFee,
        charged: round2(tx.amount + tax + pricing.baseDeliveryFee),
        commission,
        restaurantNet: round2(tx.amount - commission),
        statusLabel: transactionStatusMeta[tx.status].label,
        statusTone: transactionStatusMeta[tx.status].tone,
      }
    })

    const settledSet = new Set(settled)
    const settlements = restaurants.map((r) => {
      const completed = orders.filter((o) => o.restaurantId === r.id && COMPLETED.has(o.status))
      const gross = completed.reduce((s, o) => s + o.total, 0)
      const commissionPct = restaurantsById[r.id].commissionPct
      const commission = round2(gross * (commissionPct / 100))
      const refunds = completed.reduce((s, o) => s + (o.refund && refundDecisions[o.id] === 'approved' ? o.refund.amount : 0), 0)
      const status = settledSet.has(r.id) ? 'settled' : 'pending'
      return {
        id: r.id,
        name: r.name,
        image: r.image,
        orders: completed.length,
        gross,
        commissionPct,
        commission,
        refunds,
        net: round2(gross - commission - refunds),
        status,
        statusLabel: status === 'settled' ? 'Settled' : 'Pending',
        statusTone: status === 'settled' ? 'sage' : 'gold',
      }
    })

    const paidSet = new Set(paidOut)
    const payouts = deliveryPartners
      .filter((p) => p.earningsWeek.some((v) => v > 0))
      .map((p) => {
        const earnings = p.earningsWeek.reduce((s, v) => s + v, 0)
        const status = paidSet.has(p.id) ? 'paid' : 'scheduled'
        return {
          id: p.id,
          name: p.name,
          photo: p.photo,
          zone: p.zone,
          deliveries: Math.round(earnings / PARTNER_PAY_PER_DELIVERY),
          earnings,
          tips: p.tipsWeek,
          payout: earnings + p.tipsWeek,
          status,
          statusLabel: status === 'paid' ? 'Paid' : 'Scheduled',
          statusTone: status === 'paid' ? 'sage' : 'copper',
        }
      })

    const refunds = orders
      .filter((o) => o.refund)
      .map((o) => {
        const decision = refundDecisions[o.id] ?? 'pending'
        const meta = { pending: ['Pending', 'gold'], approved: ['Refunded', 'sage'], rejected: ['Rejected', 'muted'] }[decision]
        return {
          id: o.id,
          customer: o.customer,
          restaurant: o.restaurant,
          amount: o.refund.amount,
          orderTotal: o.total,
          reason: o.refund.reason,
          requestedAt: o.refund.requestedAt,
          decision,
          statusLabel: meta[0],
          statusTone: meta[1],
        }
      })

    const paid = transactions.filter((t) => t.status === 'success' || t.status === 'refunded')
    const gross = paid.reduce((s, t) => s + t.amount, 0)
    const refundsIssued = transactions.reduce((s, t) => s + t.refundAmount, 0)
    const report = {
      gross,
      tax: round2(paid.reduce((s, t) => s + t.tax, 0)),
      deliveryFees: round2(paid.length * pricing.baseDeliveryFee),
      commission: round2(paid.reduce((s, t) => s + t.commission, 0)),
      refundsIssued,
      taxPct: pricing.taxPct,
    }
    report.netRevenue = round2(report.commission + report.deliveryFees - refundsIssued)

    const methodTotals = paid.reduce((acc, t) => ({ ...acc, [t.method]: (acc[t.method] ?? 0) + t.amount }), {})

    return { transactions, settlements, payouts, refunds, report, methodTotals }
  }, [retried, refundDecisions, settled, paidOut])
}

function BreakdownRows({ rows }) {
  return (
    <div className="detail-line-list">
      {rows.map((row) => (
        <div key={row.label} className={`detail-line-row ${row.total ? 'detail-line-row--total' : ''}`}>
          <span className="min-w-0 font-semibold break-words">{row.label}</span>
          <span className={`shrink-0 font-bold tabular-nums ${row.negative && row.value > 0 ? 'text-danger' : ''} ${row.total ? 'text-copper-dark' : ''}`}>
            {row.negative && row.value > 0 ? '−' : ''}
            {formatMoney(row.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function ModalActions({ children }) {
  return (
    <motion.div className="register-modal-footer" variants={detailBodyItem}>
      {children}
    </motion.div>
  )
}

export default function PaymentsFinancePage() {
  const notify = useToast()
  const [retried, setRetried] = usePersistentState('payments-retried', [])
  const [refundDecisions, setRefundDecisions] = usePersistentState('payments-refund-decisions', {})
  const [settled, setSettled] = usePersistentState('payments-settled', ['verde-room'])
  const [paidOut, setPaidOut] = usePersistentState('payments-payouts-paid', ['p4'])

  const { transactions, settlements, payouts, refunds, report, methodTotals } = useFinanceData({
    retried,
    refundDecisions,
    settled,
    paidOut,
  })

  const [section, setSection] = useState('overview')
  const [txBucket, setTxBucket] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const changeSection = (id) => {
    setSection(id)
    setPage(1)
  }

  const failed = transactions.filter((t) => t.status === 'failed')
  const pendingSettlements = settlements.filter((s) => s.status === 'pending')
  const txCounts = Object.fromEntries(
    transactionFilterBuckets.map((b) => [b.id, b.id === 'all' ? transactions.length : transactions.filter((t) => t.status === b.id).length]),
  )

  const metrics = [
    { id: 'revenue', label: 'Gross volume', value: formatMoney(report.gross), change: `${transactions.length} transactions`, accent: 'sage' },
    { id: 'commission', label: 'Platform commission', value: formatMoney(Math.round(report.commission)), change: 'This cycle', accent: 'copper' },
    {
      id: 'settlement',
      label: 'Pending settlements',
      value: formatMoney(Math.round(pendingSettlements.reduce((s, r) => s + r.net, 0))),
      change: `${pendingSettlements.length} kitchens`,
      accent: 'gold',
    },
    { id: 'failed', label: 'Failed payments', value: String(failed.length), change: formatMoney(failed.reduce((s, t) => s + t.amount, 0)), accent: 'danger' },
  ]

  const tabsWithCounts = sections.map((s) => {
    if (s.id === 'settlements') return { ...s, count: pendingSettlements.length || null }
    if (s.id === 'refunds') return { ...s, count: refunds.filter((r) => r.decision === 'pending').length || null }
    return s
  })

  const runConfirm = (config) => setConfirm(config)

  const retryPayment = (tx) =>
    runConfirm({
      title: 'Retry payment?',
      message: `Re-attempt ${formatMoney(tx.amount)} on ${tx.customer}'s ${tx.method}. Customer gets a notification on success.`,
      confirmLabel: 'Retry charge',
      onConfirm: () => {
        setRetried((prev) => [...new Set([...prev, tx.id])])
        appendAudit('Payments', 'Retried failed payment', `${tx.id} · ${formatMoney(tx.amount)}`)
        notify(`${tx.id} charged successfully`)
        setConfirm(null)
        setModal(null)
      },
    })

  const decideRefund = (refund, decision) =>
    runConfirm({
      title: decision === 'approved' ? 'Approve refund?' : 'Reject refund?',
      message:
        decision === 'approved'
          ? `Refund ${formatMoney(refund.amount)} to ${refund.customer} for #${refund.id}. It lands in 3–5 business days.`
          : `Reject the ${formatMoney(refund.amount)} refund request on #${refund.id}? The customer will be notified.`,
      confirmLabel: decision === 'approved' ? 'Approve refund' : 'Reject',
      tone: decision === 'approved' ? 'copper' : 'danger',
      onConfirm: () => {
        setRefundDecisions((prev) => ({ ...prev, [refund.id]: decision }))
        appendAudit('Payments', decision === 'approved' ? 'Approved refund' : 'Rejected refund', `#${refund.id} · ${formatMoney(refund.amount)}`)
        notify(decision === 'approved' ? `Refund issued for #${refund.id}` : `Refund rejected for #${refund.id}`, decision === 'approved' ? 'success' : 'info')
        setConfirm(null)
        setModal(null)
      },
    })

  const settle = (s) =>
    runConfirm({
      title: 'Mark as settled?',
      message: `Transfer ${formatMoney(s.net)} to ${s.name} for ${SETTLEMENT_CYCLE}.`,
      confirmLabel: 'Settle now',
      onConfirm: () => {
        setSettled((prev) => [...new Set([...prev, s.id])])
        appendAudit('Payments', 'Settled restaurant payout', `${s.name} · ${formatMoney(s.net)}`)
        notify(`${s.name} settled · ${formatMoney(s.net)}`)
        setConfirm(null)
        setModal(null)
      },
    })

  const releasePayout = (p) =>
    runConfirm({
      title: 'Release payout?',
      message: `Send ${formatMoney(p.payout)} to ${p.name} (earnings + tips).`,
      confirmLabel: 'Release payout',
      onConfirm: () => {
        setPaidOut((prev) => [...new Set([...prev, p.id])])
        appendAudit('Payments', 'Released partner payout', `${p.name} · ${formatMoney(p.payout)}`)
        notify(`Payout sent to ${p.name}`)
        setConfirm(null)
        setModal(null)
      },
    })

  const visibleTx = txBucket === 'all' ? transactions : transactions.filter((t) => t.status === txBucket)
  const listForSection = { transactions: visibleTx, settlements, payouts, refunds }[section] ?? []
  const paged = paginate(listForSection, page, PAGE_SIZE)

  const columnsBySection = {
    transactions: [
      {
        id: 'tx',
        label: 'Transaction',
        mobile: 'title',
        width: 'minmax(9rem, 1.2fr)',
        render: (row) => (
          <span className="min-w-0">
            <span className="font-display block truncate text-sm font-bold">{row.id}</span>
            <span className="text-muted block truncate text-xs">#{row.orderId} · {row.customer}</span>
          </span>
        ),
      },
      {
        id: 'method',
        label: 'Method',
        mobile: 'sub',
        width: 'minmax(7rem, 1fr)',
        render: (row) => <span className="text-muted block truncate text-xs font-semibold sm:text-sm">{row.method} · {row.at}</span>,
      },
      { id: 'amount', label: 'Amount', mobile: 'meta', width: 'minmax(4.5rem, 0.5fr)', align: 'end', render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.amount)}</span> },
      { id: 'status', label: 'Status', mobile: 'badge', width: 'minmax(6rem, 0.6fr)', align: 'end', render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} /> },
    ],
    settlements: [
      {
        id: 'kitchen',
        label: 'Restaurant',
        mobile: 'title',
        width: 'minmax(10rem, 1.4fr)',
        render: (row) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <img src={row.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" loading="lazy" />
            <span className="min-w-0">
              <span className="font-display block truncate text-sm font-bold">{row.name}</span>
              <span className="text-muted block truncate text-xs">{row.commissionPct}% commission</span>
            </span>
          </div>
        ),
      },
      { id: 'orders', label: 'Orders', mobile: 'sub', width: 'minmax(6rem, 0.8fr)', render: (row) => <span className="text-muted text-xs font-semibold sm:text-sm">{row.orders} completed · {formatMoney(row.gross)}</span> },
      { id: 'net', label: 'Net payable', mobile: 'meta', width: 'minmax(5rem, 0.6fr)', align: 'end', render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.net)}</span> },
      { id: 'status', label: 'Status', mobile: 'badge', width: 'minmax(5.5rem, 0.5fr)', align: 'end', render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} /> },
    ],
    payouts: [
      {
        id: 'partner',
        label: 'Partner',
        mobile: 'title',
        width: 'minmax(9rem, 1.3fr)',
        render: (row) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={row.name} photo={row.photo} tone="sage" />
            <span className="min-w-0">
              <span className="font-display block truncate text-sm font-bold">{row.name}</span>
              <span className="text-muted block truncate text-xs">{row.zone} zone</span>
            </span>
          </div>
        ),
      },
      { id: 'deliveries', label: 'Deliveries', mobile: 'sub', width: 'minmax(6rem, 0.9fr)', render: (row) => <span className="text-muted text-xs font-semibold sm:text-sm">{row.deliveries} trips · {formatMoney(row.tips)} tips</span> },
      { id: 'payout', label: 'Payout', mobile: 'meta', width: 'minmax(4.5rem, 0.6fr)', align: 'end', render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.payout)}</span> },
      { id: 'status', label: 'Status', mobile: 'badge', width: 'minmax(5.5rem, 0.5fr)', align: 'end', render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} /> },
    ],
    refunds: [
      {
        id: 'order',
        label: 'Order',
        mobile: 'title',
        width: 'minmax(9rem, 1.2fr)',
        render: (row) => (
          <span className="min-w-0">
            <span className="font-display block truncate text-sm font-bold">#{row.id}</span>
            <span className="text-muted block truncate text-xs">{row.customer}</span>
          </span>
        ),
      },
      { id: 'reason', label: 'Reason', mobile: 'sub', width: 'minmax(7rem, 1.1fr)', render: (row) => <span className="text-muted block truncate text-xs font-semibold sm:text-sm">{row.reason} · {row.restaurant}</span> },
      { id: 'amount', label: 'Amount', mobile: 'meta', width: 'minmax(4.5rem, 0.5fr)', align: 'end', render: (row) => <span className="text-danger font-bold tabular-nums">{formatMoney(row.amount)}</span> },
      { id: 'status', label: 'Status', mobile: 'badge', width: 'minmax(5.5rem, 0.5fr)', align: 'end', render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} /> },
    ],
  }

  const modalRecord = modal
    ? { tx: transactions, settlement: settlements, payout: payouts, refund: refunds }[modal.kind].find((r) => r.id === modal.id)
    : null

  const exportTransactions = () => {
    downloadCsv(
      'marlow-transactions.csv',
      [
        { label: 'Transaction', value: (r) => r.id },
        { label: 'Order', value: (r) => r.orderId },
        { label: 'Customer', value: (r) => r.customer },
        { label: 'Restaurant', value: (r) => r.restaurant },
        { label: 'Method', value: (r) => r.method },
        { label: 'Subtotal', value: (r) => r.amount },
        { label: 'Tax', value: (r) => r.tax },
        { label: 'Commission', value: (r) => r.commission },
        { label: 'Status', value: (r) => r.statusLabel },
      ],
      transactions,
    )
    appendAudit('Payments', 'Exported report', 'Transactions CSV')
    notify('Transactions exported', 'info')
  }

  const exportSettlements = () => {
    downloadCsv(
      'marlow-settlements.csv',
      [
        { label: 'Restaurant', value: (r) => r.name },
        { label: 'Orders', value: (r) => r.orders },
        { label: 'Gross', value: (r) => r.gross },
        { label: 'Commission %', value: (r) => r.commissionPct },
        { label: 'Commission', value: (r) => r.commission },
        { label: 'Refunds', value: (r) => r.refunds },
        { label: 'Net payable', value: (r) => r.net },
        { label: 'Status', value: (r) => r.statusLabel },
      ],
      settlements,
    )
    appendAudit('Payments', 'Exported report', 'Settlements CSV')
    notify('Settlements exported', 'info')
  }

  const exportPayouts = () => {
    downloadCsv(
      'marlow-partner-payouts.csv',
      [
        { label: 'Partner', value: (r) => r.name },
        { label: 'Zone', value: (r) => r.zone },
        { label: 'Deliveries', value: (r) => r.deliveries },
        { label: 'Earnings', value: (r) => r.earnings },
        { label: 'Tips', value: (r) => r.tips },
        { label: 'Payout', value: (r) => r.payout },
        { label: 'Status', value: (r) => r.statusLabel },
      ],
      payouts,
    )
    appendAudit('Payments', 'Exported report', 'Partner payouts CSV')
    notify('Payouts exported', 'info')
  }

  const methodEntries = Object.entries(methodTotals).sort((a, b) => b[1] - a[1])
  const methodMax = Math.max(...methodEntries.map(([, v]) => v), 1)
  const commissionMax = Math.max(...settlements.map((s) => s.commission), 1)

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Finance summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <ModuleHeader title="Payments & finance" subtitle={`Settlement cycle · ${SETTLEMENT_CYCLE}`} />
          <TabBar tabs={tabsWithCounts} active={section} onChange={changeSection} layoutId="finance-section-tab" variant="page" />
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
            {section === 'overview' ? (
              <>
                <div className="dashboard-split-50-50">
                  <div className="panel-card">
                    <h3 className="panel-title">Revenue this week</h3>
                    <MiniBars
                      data={analytics.salesDaily.map((d) => ({ label: d.label, value: d.revenueK * 1000 }))}
                      format={(v) => formatMoney(v)}
                      tone="sage"
                    />
                  </div>
                  <div className="panel-card">
                    <h3 className="panel-title">Payment methods</h3>
                    <ul className="space-y-3">
                      {methodEntries.map(([method, total]) => (
                        <li key={method}>
                          <p className="perf-label">
                            {method}
                            <span>
                              {formatMoney(total)} · {Math.round((total / Math.max(report.gross, 1)) * 100)}%
                            </span>
                          </p>
                          <ProgressBar value={(total / methodMax) * 100} tone={method === 'Card' ? 'copper' : method === 'Wallet' ? 'gold' : 'sage'} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="panel-card">
                  <h3 className="panel-title">Failed payments</h3>
                  {failed.length === 0 ? (
                    <p className="text-muted text-sm font-semibold">No failed payments — every charge went through.</p>
                  ) : (
                    <div className="detail-line-list">
                      {failed.map((tx) => (
                        <div key={tx.id} className="detail-line-row flex-wrap">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold">
                              {tx.id} · {tx.customer}
                            </p>
                            <p className="text-danger truncate text-xs font-semibold">
                              {tx.reason} · {tx.at}
                            </p>
                          </div>
                          <div className="detail-line-row-actions">
                            <span className="font-bold tabular-nums">{formatMoney(tx.amount)}</span>
                            <button type="button" onClick={() => retryPayment(tx)} className="action-btn action-btn--primary action-btn--sm">
                              Retry
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {section === 'transactions' ? (
              <div className="module-filters">
                {transactionFilterBuckets.map((f) => (
                  <FilterChip key={f.id} label={f.label} count={txCounts[f.id]} active={txBucket === f.id} onClick={() => {
                    setTxBucket(f.id)
                    setPage(1)
                  }} />
                ))}
              </div>
            ) : null}

            {columnsBySection[section] ? (
              <>
                <AdminDataTable
                  columns={columnsBySection[section]}
                  rows={paged.items}
                  page={paged.page}
                  rowKey={(row) => row.id}
                  selectedKey={modal?.id}
                  onRowClick={(row) =>
                    setModal({ kind: { transactions: 'tx', settlements: 'settlement', payouts: 'payout', refunds: 'refund' }[section], id: row.id })
                  }
                  emptyMessage="Nothing here yet."
                />
                <Pagination {...paged} onPage={setPage} />
              </>
            ) : null}

            {section === 'reports' ? (
              <div className="dashboard-split-50-50">
                <div className="panel-card">
                  <h3 className="panel-title">Tax & revenue summary</h3>
                  <BreakdownRows
                    rows={[
                      { label: 'Gross food sales', value: report.gross },
                      { label: `Sales tax collected (${report.taxPct}%)`, value: report.tax },
                      { label: 'Delivery fees', value: report.deliveryFees },
                      { label: 'Platform commission', value: report.commission },
                      { label: 'Refunds issued', value: report.refundsIssued, negative: true },
                      { label: 'Net platform revenue', value: report.netRevenue, total: true },
                    ]}
                  />
                  <p className="text-muted mt-3 text-xs font-semibold">
                    Sales tax is remitted to NY State quarterly. Commission excludes tax and delivery fees.
                  </p>
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="panel-card">
                    <h3 className="panel-title">Commission by restaurant</h3>
                    <ul className="space-y-3">
                      {[...settlements].sort((a, b) => b.commission - a.commission).map((s) => (
                        <li key={s.id}>
                          <p className="perf-label">
                            <span className="truncate text-ink">{s.name}</span>
                            <span>
                              {formatMoney(s.commission)} · {s.commissionPct}%
                            </span>
                          </p>
                          <ProgressBar value={(s.commission / commissionMax) * 100} tone="copper" />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="panel-card">
                    <h3 className="panel-title">Financial reports</h3>
                    <div className="export-grid">
                      <button type="button" onClick={exportTransactions} className="export-btn">
                        <span className="export-btn-icon" aria-hidden="true">↓</span>
                        Transactions CSV
                      </button>
                      <button type="button" onClick={exportSettlements} className="export-btn">
                        <span className="export-btn-icon" aria-hidden="true">↓</span>
                        Settlements CSV
                      </button>
                      <button type="button" onClick={exportPayouts} className="export-btn">
                        <span className="export-btn-icon" aria-hidden="true">↓</span>
                        Partner payouts CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <DetailModal
        open={Boolean(modalRecord)}
        onClose={() => setModal(null)}
        hero={
          modalRecord ? (
            modal.kind === 'tx' ? (
              <GradientHero
                eyebrow="Transaction"
                title={modalRecord.id}
                subtitle={`#${modalRecord.orderId} · ${modalRecord.at}`}
                tone={modalRecord.status === 'failed' ? 'danger' : modalRecord.status === 'success' ? 'sage' : 'ink'}
                aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(modalRecord.charged)}</p>}
                badge={<StatusBadge label={modalRecord.statusLabel} tone={modalRecord.statusTone} onPhoto />}
              />
            ) : modal.kind === 'settlement' ? (
              <GradientHero
                eyebrow="Restaurant settlement"
                title={modalRecord.name}
                subtitle={SETTLEMENT_CYCLE}
                tone="copper"
                aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(modalRecord.net)}</p>}
                badge={<StatusBadge label={modalRecord.statusLabel} tone={modalRecord.statusTone} onPhoto />}
              />
            ) : modal.kind === 'payout' ? (
              <GradientHero
                eyebrow="Partner payout"
                title={modalRecord.name}
                subtitle={`${modalRecord.zone} zone · ${SETTLEMENT_CYCLE}`}
                tone="sage"
                avatar={<Avatar name={modalRecord.name} photo={modalRecord.photo} tone="photo" size="lg" />}
                aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(modalRecord.payout)}</p>}
                badge={<StatusBadge label={modalRecord.statusLabel} tone={modalRecord.statusTone} onPhoto />}
              />
            ) : (
              <GradientHero
                eyebrow="Refund request"
                title={`#${modalRecord.id}`}
                subtitle={`${modalRecord.customer} · ${modalRecord.restaurant}`}
                tone="danger"
                aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(modalRecord.amount)}</p>}
                badge={<StatusBadge label={modalRecord.statusLabel} tone={modalRecord.statusTone} onPhoto />}
              />
            )
          ) : null
        }
      >
        {modalRecord && modal.kind === 'tx' ? (
          <DetailBody key={modalRecord.id}>
            <DetailStatGrid>
              <DetailStat label="Customer" value={modalRecord.customer} accent="copper" />
              <DetailStat label="Restaurant" value={modalRecord.restaurant} accent="sage" />
              <DetailStat label="Method" value={modalRecord.method} accent="gold" />
              <DetailStat label="Commission" value={`${modalRecord.commissionPct}%`} hint={formatMoney(modalRecord.commission)} accent="muted" />
            </DetailStatGrid>
            {modalRecord.status === 'failed' ? (
              <DetailHighlightPanel tone="danger">
                <p className="text-sm font-bold">{modalRecord.reason}</p>
                <p className="text-muted mt-1 text-xs font-semibold">The order is on hold until the charge succeeds.</p>
              </DetailHighlightPanel>
            ) : null}
            <DetailSection title="Charge breakdown">
              <BreakdownRows
                rows={[
                  { label: 'Food subtotal', value: modalRecord.amount },
                  { label: `Sales tax (${pricingDefaults.taxPct}%)`, value: modalRecord.tax },
                  { label: 'Delivery fee', value: modalRecord.deliveryFee },
                  ...(modalRecord.refundAmount ? [{ label: 'Refunded', value: modalRecord.refundAmount, negative: true }] : []),
                  { label: 'Customer charged', value: modalRecord.charged - modalRecord.refundAmount, total: true },
                ]}
              />
            </DetailSection>
            <DetailSection title="Restaurant split">
              <BreakdownRows
                rows={[
                  { label: 'Food subtotal', value: modalRecord.amount },
                  { label: `Marlow commission (${modalRecord.commissionPct}%)`, value: modalRecord.commission, negative: true },
                  { label: 'Restaurant receives', value: modalRecord.restaurantNet, total: true },
                ]}
              />
            </DetailSection>
            {modalRecord.status === 'failed' ? (
              <ModalActions>
                <button type="button" onClick={() => setModal(null)} className="register-btn register-btn--ghost">
                  Close
                </button>
                <button type="button" onClick={() => retryPayment(modalRecord)} className="register-btn register-btn--primary">
                  Retry payment
                </button>
              </ModalActions>
            ) : null}
          </DetailBody>
        ) : null}

        {modalRecord && modal.kind === 'settlement' ? (
          <DetailBody key={modalRecord.id}>
            <DetailStatGrid>
              <DetailStat label="Completed orders" value={String(modalRecord.orders)} accent="copper" />
              <DetailStat label="Commission rate" value={`${modalRecord.commissionPct}%`} accent="gold" />
            </DetailStatGrid>
            <DetailSection title="Payout calculation">
              <BreakdownRows
                rows={[
                  { label: 'Gross sales', value: modalRecord.gross },
                  { label: 'Platform commission', value: modalRecord.commission, negative: true },
                  { label: 'Approved refunds', value: modalRecord.refunds, negative: true },
                  { label: 'Net payable', value: modalRecord.net, total: true },
                ]}
              />
            </DetailSection>
            <ModalActions>
              <button type="button" onClick={() => setModal(null)} className="register-btn register-btn--ghost">
                Close
              </button>
              <button
                type="button"
                disabled={modalRecord.status === 'settled' || modalRecord.net <= 0}
                onClick={() => settle(modalRecord)}
                className="register-btn register-btn--primary"
              >
                {modalRecord.status === 'settled' ? 'Already settled' : 'Mark as settled'}
              </button>
            </ModalActions>
          </DetailBody>
        ) : null}

        {modalRecord && modal.kind === 'payout' ? (
          <DetailBody key={modalRecord.id}>
            <DetailStatGrid>
              <DetailStat label="Deliveries" value={String(modalRecord.deliveries)} hint={`${formatMoney(PARTNER_PAY_PER_DELIVERY)} base each`} accent="copper" />
              <DetailStat label="Tips" value={formatMoney(modalRecord.tips)} hint="Passed through in full" accent="sage" />
            </DetailStatGrid>
            <DetailSection title="Payout calculation">
              <BreakdownRows
                rows={[
                  { label: 'Delivery earnings', value: modalRecord.earnings },
                  { label: 'Customer tips', value: modalRecord.tips },
                  { label: 'Total payout', value: modalRecord.payout, total: true },
                ]}
              />
            </DetailSection>
            <ModalActions>
              <button type="button" onClick={() => setModal(null)} className="register-btn register-btn--ghost">
                Close
              </button>
              <button
                type="button"
                disabled={modalRecord.status === 'paid'}
                onClick={() => releasePayout(modalRecord)}
                className="register-btn register-btn--primary"
              >
                {modalRecord.status === 'paid' ? 'Payout sent' : 'Release payout'}
              </button>
            </ModalActions>
          </DetailBody>
        ) : null}

        {modalRecord && modal.kind === 'refund' ? (
          <DetailBody key={modalRecord.id}>
            <DetailStatGrid>
              <DetailStat label="Order total" value={formatMoney(modalRecord.orderTotal)} accent="copper" />
              <DetailStat label="Requested" value={modalRecord.requestedAt} accent="muted" />
            </DetailStatGrid>
            <DetailSection title="Customer reason">
              <DetailHighlightPanel tone="danger">
                <p className="text-sm font-bold">{modalRecord.reason}</p>
                <p className="text-muted mt-1 text-xs font-semibold">
                  Refund is {Math.round((modalRecord.amount / modalRecord.orderTotal) * 100)}% of the order value.
                </p>
              </DetailHighlightPanel>
            </DetailSection>
            {modalRecord.decision === 'pending' ? (
              <ModalActions>
                <button type="button" onClick={() => decideRefund(modalRecord, 'rejected')} className="register-btn register-btn--ghost">
                  Reject
                </button>
                <button type="button" onClick={() => decideRefund(modalRecord, 'approved')} className="register-btn register-btn--primary">
                  Approve {formatMoney(modalRecord.amount)}
                </button>
              </ModalActions>
            ) : (
              <motion.p className="text-muted text-sm font-semibold" variants={detailBodyItem}>
                Decision recorded · {modalRecord.statusLabel}
              </motion.p>
            )}
          </DetailBody>
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
