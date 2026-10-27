import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import FormField, { FormReminder } from '../components/ui/FormField.jsx'
import GradientHero from '../components/ui/GradientHero.jsx'
import MiniBars from '../components/ui/MiniBars.jsx'
import ModuleHeader from '../components/ui/ModuleHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { analytics, customers, getOrderManagementSnapshot } from '../data/platformData.js'
import {
  disputeStatusMeta,
  disputesSeed,
  notificationAudiences,
  notificationChannels,
  notificationsSeed,
  ticketFilterBuckets,
  ticketPriorityMeta,
  ticketStatusMeta,
  ticketsSeed,
} from '../data/moduleData.js'
import { appendAudit } from '../lib/auditLog.js'
import { downloadCsv } from '../lib/csv.js'
import { formatDateTime, makeId } from '../lib/format.js'
import { formatMoney } from '../lib/formatMoney.js'
import { paginate } from '../lib/pagination.js'
import { usePersistentState } from '../lib/usePersistentState.js'

const PAGE_SIZE = 7
const MESSAGE_MAX = 160

const sections = [
  { id: 'tickets', label: 'Support tickets' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'reports', label: 'Sales reports' },
]

const cannedReplies = [
  { label: 'Wallet credit', text: 'Sorry about that — we have issued a credit to your wallet.' },
  { label: 'Looking into it', text: 'Thanks for flagging this. Our team is looking into it now.' },
  { label: 'Ask for photo', text: 'Could you share a photo of the order so we can help faster?' },
]

const audienceReach = {
  'All customers': 18240,
  'All delivery partners': 214,
  'All restaurants': 6,
  'Gold & Platinum customers': 3120,
}

const reportPeriods = {
  '7d': {
    label: 'Last 7 days',
    series: analytics.salesDaily.map((d) => ({ label: d.label, orders: d.orders, revenue: d.revenueK * 1000 })),
    cancelPct: 2.1,
  },
  '30d': {
    label: 'Last 30 days',
    series: [
      { label: 'Wk 1', orders: 2810, revenue: 418000 },
      { label: 'Wk 2', orders: 3020, revenue: 447000 },
      { label: 'Wk 3', orders: 3196, revenue: 472000 },
      { label: 'Wk 4', orders: 3401, revenue: 504000 },
    ],
    cancelPct: 2.4,
  },
  '90d': {
    label: 'Last 90 days',
    series: [
      { label: 'Aug', orders: 41200, revenue: 1720000 },
      { label: 'Sep', orders: 44100, revenue: 1860000 },
      { label: 'Oct', orders: 47900, revenue: 2010000 },
    ],
    cancelPct: 2.6,
  },
}

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

function TicketThread({ messages, customerName }) {
  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  return (
    <div className="ticket-thread">
      {messages.map((m) => (
        <motion.div
          key={m.id}
          className={`ticket-bubble ticket-bubble--${m.from}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="ticket-bubble-meta">
            {m.from === 'agent' ? 'Marlow support' : customerName} · {m.at}
          </p>
          <p className="break-words">{m.text}</p>
        </motion.div>
      ))}
      <span ref={endRef} />
    </div>
  )
}

export default function SupportReportsPage() {
  const notify = useToast()
  const [tickets, setTickets] = usePersistentState('support-tickets', ticketsSeed)
  const [disputes, setDisputes] = usePersistentState('support-disputes', disputesSeed)
  const [notifications, setNotifications] = usePersistentState('support-notifications', notificationsSeed)

  const [section, setSection] = useState('tickets')
  const [ticketBucket, setTicketBucket] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [reply, setReply] = useState('')
  const [replyReminder, setReplyReminder] = useState('')
  const [confirm, setConfirm] = useState(null)

  const [draft, setDraft] = useState({ title: '', message: '', audience: notificationAudiences[0], channels: ['Push'] })
  const [draftReminder, setDraftReminder] = useState('')
  const [period, setPeriod] = useState('7d')

  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [])
  const orders = useMemo(() => getOrderManagementSnapshot().orders, [])

  const changeSection = (id) => {
    setSection(id)
    setPage(1)
  }

  const ticketRows = tickets.map((t) => ({
    ...t,
    customer: customersById[t.customerId]?.name ?? 'Guest',
    customerPhoto: customersById[t.customerId]?.photo,
  }))
  const disputeRows = disputes.map((d) => ({ ...d, customer: customersById[d.customerId]?.name ?? 'Guest' }))
  const ticketCounts = Object.fromEntries(
    ticketFilterBuckets.map((b) => [b.id, b.id === 'all' ? tickets.length : tickets.filter((t) => t.status === b.id).length]),
  )
  const openDisputes = disputes.filter((d) => d.status === 'open')
  const visibleTickets = ticketBucket === 'all' ? ticketRows : ticketRows.filter((t) => t.status === ticketBucket)

  const metrics = [
    { id: 'tickets', label: 'Open tickets', value: String(ticketCounts.open + ticketCounts.in_progress), change: `${ticketCounts.resolved} resolved`, accent: 'copper' },
    { id: 'disputes', label: 'Open disputes', value: String(openDisputes.length), change: formatMoney(openDisputes.reduce((s, d) => s + d.amount, 0)) + ' at stake', accent: 'danger' },
    { id: 'pending', label: 'Avg first response', value: '14 min', change: 'Target 15 min', accent: 'gold' },
    { id: 'csat', label: 'CSAT', value: '4.7 / 5', change: '312 ratings this week', accent: 'sage' },
  ]

  const tabsWithCounts = sections.map((s) => {
    if (s.id === 'tickets') return { ...s, count: ticketCounts.open || null }
    if (s.id === 'disputes') return { ...s, count: openDisputes.length || null }
    return s
  })

  const updateTicket = (id, patch) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const selectedTicket = modal?.kind === 'ticket' ? ticketRows.find((t) => t.id === modal.id) : null
  const selectedDispute = modal?.kind === 'dispute' ? disputeRows.find((d) => d.id === modal.id) : null

  const closeModal = () => {
    setModal(null)
    setReply('')
    setReplyReminder('')
  }

  const sendReply = (e) => {
    e.preventDefault()
    if (!reply.trim()) {
      setReplyReminder('Type a short reply first — or tap a quick response below.')
      return
    }
    const t = selectedTicket
    updateTicket(t.id, {
      status: t.status === 'resolved' ? 'resolved' : 'in_progress',
      messages: [...t.messages, { id: makeId('m'), from: 'agent', text: reply.trim(), at: nowTime() }],
    })
    appendAudit('Support', 'Replied to ticket', t.id)
    notify(`Reply sent to ${t.customer}`)
    setReply('')
    setReplyReminder('')
  }

  const resolveDispute = (d, outcome) => {
    const refund = outcome === 'refunded' ? d.amount : outcome === 'partial' ? Math.round(d.amount * 50) / 100 : 0
    setConfirm({
      title: outcome === 'rejected' ? 'Reject dispute?' : outcome === 'partial' ? 'Issue partial refund?' : 'Issue full refund?',
      message:
        outcome === 'rejected'
          ? `Close ${d.id} without a refund. ${d.customer} will be notified with the evidence summary.`
          : `Refund ${formatMoney(refund)} to ${d.customer} and close ${d.id}.`,
      confirmLabel: outcome === 'rejected' ? 'Reject' : `Refund ${formatMoney(refund)}`,
      tone: outcome === 'rejected' ? 'danger' : 'copper',
      onConfirm: () => {
        setDisputes((prev) => prev.map((x) => (x.id === d.id ? { ...x, status: outcome, refunded: refund } : x)))
        appendAudit('Support', `Dispute ${disputeStatusMeta[outcome].label.toLowerCase()}`, `${d.id} · ${formatMoney(refund)}`)
        notify(outcome === 'rejected' ? `${d.id} rejected` : `${formatMoney(refund)} refunded to ${d.customer}`, outcome === 'rejected' ? 'info' : 'success')
        setConfirm(null)
        closeModal()
      },
    })
  }

  const sendNotification = (e) => {
    e.preventDefault()
    if (!draft.title.trim()) return setDraftReminder('Add a headline — it is the first thing people see.')
    if (!draft.message.trim()) return setDraftReminder('Write a short message to go with the headline.')
    if (draft.channels.length === 0) return setDraftReminder('Pick at least one channel to deliver on.')
    setConfirm({
      title: 'Send notification?',
      message: `“${draft.title.trim()}” goes to ${audienceReach[draft.audience].toLocaleString('en-US')} recipients via ${draft.channels.join(', ')}.`,
      confirmLabel: 'Send now',
      onConfirm: () => {
        const entry = {
          id: makeId('nt'),
          title: draft.title.trim(),
          message: draft.message.trim(),
          audience: draft.audience,
          channels: draft.channels,
          sentAt: new Date().toISOString(),
          reach: audienceReach[draft.audience],
        }
        setNotifications((prev) => [entry, ...prev].slice(0, 30))
        appendAudit('Support', 'Sent notification', `${entry.title} → ${entry.audience}`)
        notify(`Notification sent to ${entry.reach.toLocaleString('en-US')} recipients`)
        setDraft({ title: '', message: '', audience: draft.audience, channels: draft.channels })
        setDraftReminder('')
        setConfirm(null)
      },
    })
  }

  const report = reportPeriods[period]
  const reportTotals = useMemo(() => {
    const orderCount = report.series.reduce((s, d) => s + d.orders, 0)
    const revenue = report.series.reduce((s, d) => s + d.revenue, 0)
    return { orderCount, revenue, aov: revenue / Math.max(orderCount, 1) }
  }, [report])

  const topRestaurants = useMemo(() => {
    const totals = orders.reduce((acc, o) => {
      acc[o.restaurant] = (acc[o.restaurant] ?? 0) + o.total
      return acc
    }, {})
    const sum = Object.values(totals).reduce((s, v) => s + v, 0) || 1
    return Object.entries(totals)
      .map(([name, value]) => ({ name, share: value / sum }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 5)
  }, [orders])

  const exportReport = () => {
    downloadCsv(
      `marlow-sales-${period}.csv`,
      [
        { label: 'Period', value: (r) => r.label },
        { label: 'Orders', value: (r) => r.orders },
        { label: 'Revenue (USD)', value: (r) => r.revenue },
        { label: 'Avg order (USD)', value: (r) => (r.revenue / r.orders).toFixed(2) },
      ],
      report.series,
    )
    appendAudit('Reports', 'Exported sales report', report.label)
    notify('Sales report exported', 'info')
  }

  const ticketColumns = [
    {
      id: 'ticket',
      label: 'Ticket',
      mobile: 'title',
      width: 'minmax(11rem, 1.6fr)',
      render: (row) => (
        <span className="min-w-0">
          <span className="font-display block truncate text-sm font-bold">{row.subject}</span>
          <span className="text-muted block truncate text-xs">{row.id} · {row.createdAt}</span>
        </span>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      mobile: 'sub',
      width: 'minmax(7rem, 1fr)',
      render: (row) => <span className="text-muted block truncate text-xs font-semibold sm:text-sm">{row.customer} · {row.channel}</span>,
    },
    {
      id: 'priority',
      label: 'Priority',
      mobile: 'meta',
      width: 'minmax(5rem, 0.5fr)',
      align: 'end',
      render: (row) => <StatusBadge label={ticketPriorityMeta[row.priority].label} tone={ticketPriorityMeta[row.priority].tone} />,
    },
    {
      id: 'status',
      label: 'Status',
      mobile: 'badge',
      width: 'minmax(6rem, 0.6fr)',
      align: 'end',
      render: (row) => <StatusBadge label={ticketStatusMeta[row.status].label} tone={ticketStatusMeta[row.status].tone} />,
    },
  ]

  const disputeColumns = [
    {
      id: 'dispute',
      label: 'Dispute',
      mobile: 'title',
      width: 'minmax(11rem, 1.6fr)',
      render: (row) => (
        <span className="min-w-0">
          <span className="font-display block truncate text-sm font-bold">{row.claim}</span>
          <span className="text-muted block truncate text-xs">{row.id} · #{row.orderId}</span>
        </span>
      ),
    },
    {
      id: 'against',
      label: 'Against',
      mobile: 'sub',
      width: 'minmax(7rem, 1fr)',
      render: (row) => <span className="text-muted block truncate text-xs font-semibold sm:text-sm">{row.customer} vs {row.against}</span>,
    },
    { id: 'amount', label: 'Amount', mobile: 'meta', width: 'minmax(4.5rem, 0.5fr)', align: 'end', render: (row) => <span className="font-bold tabular-nums">{formatMoney(row.amount)}</span> },
    {
      id: 'status',
      label: 'Status',
      mobile: 'badge',
      width: 'minmax(6.5rem, 0.6fr)',
      align: 'end',
      render: (row) => <StatusBadge label={disputeStatusMeta[row.status].label} tone={disputeStatusMeta[row.status].tone} />,
    },
  ]

  const tableRows = section === 'tickets' ? visibleTickets : section === 'disputes' ? disputeRows : []
  const paged = paginate(tableRows, page, PAGE_SIZE)

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Support summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <ModuleHeader title="Support & reports" subtitle="Tickets, disputes, broadcasts, and sales performance" />
          <TabBar tabs={tabsWithCounts} active={section} onChange={changeSection} layoutId="support-section-tab" variant="page" />
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
            {section === 'tickets' ? (
              <div className="module-filters">
                {ticketFilterBuckets.map((f) => (
                  <FilterChip key={f.id} label={f.label} count={ticketCounts[f.id]} active={ticketBucket === f.id} onClick={() => {
                    setTicketBucket(f.id)
                    setPage(1)
                  }} />
                ))}
              </div>
            ) : null}

            {section === 'tickets' || section === 'disputes' ? (
              <>
                <AdminDataTable
                  columns={section === 'tickets' ? ticketColumns : disputeColumns}
                  rows={paged.items}
                  page={paged.page}
                  rowKey={(row) => row.id}
                  selectedKey={modal?.id}
                  onRowClick={(row) => setModal({ kind: section === 'tickets' ? 'ticket' : 'dispute', id: row.id })}
                  emptyMessage="All caught up — nothing in this queue."
                />
                <Pagination {...paged} onPage={setPage} />
              </>
            ) : null}

            {section === 'notifications' ? (
              <div className="dashboard-split-50-50">
                <form className="panel-card space-y-4" onSubmit={sendNotification} noValidate>
                  <h3 className="panel-title">Compose broadcast</h3>
                  <FormField label="Headline">
                    <input
                      className="register-input"
                      value={draft.title}
                      maxLength={60}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, title: e.target.value }))
                        setDraftReminder('')
                      }}
                      placeholder="Free delivery this weekend"
                    />
                  </FormField>
                  <FormField label="Message" hint={`${draft.message.length}/${MESSAGE_MAX} characters`}>
                    <textarea
                      className="register-input min-h-[5.5rem] resize-y"
                      value={draft.message}
                      maxLength={MESSAGE_MAX}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, message: e.target.value }))
                        setDraftReminder('')
                      }}
                      placeholder="Order from any kitchen Fri–Sun and skip the delivery fee."
                    />
                  </FormField>
                  <FormField label="Audience" hint={`≈ ${audienceReach[draft.audience].toLocaleString('en-US')} recipients`}>
                    <select className="register-input" value={draft.audience} onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value }))}>
                      {notificationAudiences.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </FormField>
                  <div className="register-field">
                    <span className="register-field-label">Channels</span>
                    <div className="flex flex-wrap gap-2">
                      {notificationChannels.map((ch) => {
                        const on = draft.channels.includes(ch)
                        return (
                          <button
                            key={ch}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setDraft((d) => ({ ...d, channels: on ? d.channels.filter((c) => c !== ch) : [...d.channels, ch] }))
                              setDraftReminder('')
                            }}
                            className={`choice-chip ${on ? 'choice-chip--on' : ''}`}
                          >
                            {ch}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <FormReminder message={draftReminder} />
                  <div className="register-modal-footer">
                    <button type="submit" className="register-btn register-btn--primary">
                      Send notification
                    </button>
                  </div>
                </form>
                <div className="panel-card">
                  <h3 className="panel-title">Recently sent</h3>
                  <ul className="space-y-2.5">
                    <AnimatePresence initial={false}>
                      {notifications.map((n) => (
                        <motion.li
                          key={n.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="notification-item"
                        >
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <p className="min-w-0 font-bold break-words">{n.title}</p>
                            <span className="text-muted shrink-0 text-xs font-semibold tabular-nums">{n.reach.toLocaleString('en-US')}</span>
                          </div>
                          <p className="text-muted mt-0.5 text-sm font-medium break-words">{n.message}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <StatusBadge label={n.audience} tone="copper" />
                            {n.channels.map((c) => (
                              <StatusBadge key={c} label={c} tone="muted" />
                            ))}
                            <span className="text-muted text-xs font-semibold">{formatDateTime(n.sentAt)}</span>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </div>
            ) : null}

            {section === 'reports' ? (
              <>
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <div className="module-filters">
                    {Object.entries(reportPeriods).map(([id, p]) => (
                      <FilterChip key={id} label={p.label} active={period === id} onClick={() => setPeriod(id)} />
                    ))}
                  </div>
                  <button type="button" onClick={exportReport} className="action-btn">
                    ↓ Export CSV
                  </button>
                </div>
                <div className="report-stat-grid">
                  <DetailStat label="Orders" value={reportTotals.orderCount.toLocaleString('en-US')} accent="copper" />
                  <DetailStat label="Revenue" value={formatMoney(reportTotals.revenue)} accent="sage" />
                  <DetailStat label="Avg order value" value={formatMoney(Math.round(reportTotals.aov * 100) / 100)} accent="gold" />
                  <DetailStat label="Cancellation rate" value={`${report.cancelPct}%`} accent="muted" />
                </div>
                <div className="dashboard-split-50-50">
                  <div className="panel-card">
                    <h3 className="panel-title">Revenue · {report.label.toLowerCase()}</h3>
                    <MiniBars data={report.series.map((d) => ({ label: d.label, value: d.revenue }))} format={(v) => formatMoney(v)} tone="sage" />
                  </div>
                  <div className="panel-card">
                    <h3 className="panel-title">Top restaurants</h3>
                    <ul className="space-y-3">
                      {topRestaurants.map((r, i) => (
                        <li key={r.name}>
                          <p className="perf-label">
                            <span className="truncate text-ink">
                              {i + 1}. {r.name}
                            </span>
                            <span>{formatMoney(Math.round(r.share * reportTotals.revenue))}</span>
                          </p>
                          <ProgressBar value={(r.share / topRestaurants[0].share) * 100} tone={i === 0 ? 'copper' : 'gold'} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="panel-card">
                  <h3 className="panel-title">Orders by delivery zone</h3>
                  <div className="zone-report-grid">
                    {analytics.deliveryZones.map((z) => (
                      <div key={z.id} className="min-w-0">
                        <p className="perf-label">
                          <span className="text-ink">{z.label}</span>
                          <span>{z.sharePct}% on time</span>
                        </p>
                        <ProgressBar value={z.sharePct} tone="sage" />
                        <p className="text-muted mt-1 text-xs font-semibold tabular-nums">{z.orders} orders today</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <DetailModal
        open={Boolean(selectedTicket || selectedDispute)}
        onClose={closeModal}
        hero={
          selectedTicket ? (
            <GradientHero
              eyebrow={`${selectedTicket.id} · ${selectedTicket.channel}`}
              title={selectedTicket.subject}
              subtitle={`${selectedTicket.customer} · ${selectedTicket.createdAt}`}
              tone={selectedTicket.priority === 'urgent' ? 'danger' : selectedTicket.status === 'resolved' ? 'sage' : 'copper'}
              avatar={<Avatar name={selectedTicket.customer} photo={selectedTicket.customerPhoto} tone="photo" size="lg" />}
              badge={
                <>
                  <StatusBadge label={ticketStatusMeta[selectedTicket.status].label} tone={ticketStatusMeta[selectedTicket.status].tone} onPhoto />
                  <StatusBadge label={`${ticketPriorityMeta[selectedTicket.priority].label} priority`} tone={ticketPriorityMeta[selectedTicket.priority].tone} onPhoto />
                </>
              }
            />
          ) : selectedDispute ? (
            <GradientHero
              eyebrow={`Dispute ${selectedDispute.id}`}
              title={`#${selectedDispute.orderId}`}
              subtitle={`${selectedDispute.customer} vs ${selectedDispute.against}`}
              tone={selectedDispute.status === 'open' ? 'danger' : 'sage'}
              aside={<p className="font-display text-2xl font-bold text-paper tabular-nums sm:text-3xl">{formatMoney(selectedDispute.amount)}</p>}
              badge={<StatusBadge label={disputeStatusMeta[selectedDispute.status].label} tone={disputeStatusMeta[selectedDispute.status].tone} onPhoto />}
            />
          ) : null
        }
      >
        {selectedTicket ? (
          <DetailBody key={selectedTicket.id}>
            <DetailSection title="Conversation">
              <TicketThread messages={selectedTicket.messages} customerName={selectedTicket.customer} />
            </DetailSection>
            <motion.form onSubmit={sendReply} className="space-y-2.5" variants={detailBodyItem} noValidate>
              <textarea
                className="register-input min-h-[4.5rem] resize-y"
                placeholder={`Reply to ${selectedTicket.customer}…`}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value)
                  setReplyReminder('')
                }}
                aria-label="Reply"
              />
              <div className="flex flex-wrap gap-1.5">
                {cannedReplies.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className="choice-chip choice-chip--quiet"
                    title={c.text}
                    onClick={() => {
                      setReply(c.text)
                      setReplyReminder('')
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <FormReminder message={replyReminder} />
              <div className="offer-actions">
                <button
                  type="button"
                  disabled={selectedTicket.priority === 'urgent'}
                  onClick={() => {
                    updateTicket(selectedTicket.id, { priority: 'urgent', status: 'in_progress' })
                    appendAudit('Support', 'Escalated ticket', selectedTicket.id)
                    notify(`${selectedTicket.id} escalated to urgent`, 'info')
                  }}
                  className="action-btn action-btn--danger"
                >
                  {selectedTicket.priority === 'urgent' ? 'Escalated' : 'Escalate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const resolving = selectedTicket.status !== 'resolved'
                    updateTicket(selectedTicket.id, { status: resolving ? 'resolved' : 'open' })
                    appendAudit('Support', resolving ? 'Resolved ticket' : 'Reopened ticket', selectedTicket.id)
                    notify(`${selectedTicket.id} ${resolving ? 'resolved' : 'reopened'}`)
                  }}
                  className={`action-btn ${selectedTicket.status === 'resolved' ? '' : 'action-btn--sage'}`}
                >
                  {selectedTicket.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                </button>
                <button type="submit" className="action-btn action-btn--primary">
                  Send reply
                </button>
              </div>
            </motion.form>
          </DetailBody>
        ) : null}

        {selectedDispute ? (
          <DetailBody key={selectedDispute.id}>
            <DetailStatGrid>
              <DetailStat label="Customer" value={selectedDispute.customer} accent="copper" />
              <DetailStat label="Filed against" value={selectedDispute.against} accent="gold" />
            </DetailStatGrid>
            <DetailSection title="Customer claim">
              <DetailHighlightPanel tone="danger">
                <p className="text-sm font-bold">{selectedDispute.claim}</p>
                <p className="text-muted mt-1 text-xs font-semibold">Opened {selectedDispute.openedAt}</p>
              </DetailHighlightPanel>
            </DetailSection>
            <DetailSection title="Evidence">
              <DetailHighlightPanel>
                <p className="text-sm font-semibold">{selectedDispute.evidence}</p>
              </DetailHighlightPanel>
            </DetailSection>
            {selectedDispute.status === 'open' ? (
              <motion.div className="offer-actions" variants={detailBodyItem}>
                <button type="button" onClick={() => resolveDispute(selectedDispute, 'rejected')} className="action-btn action-btn--danger">
                  Reject
                </button>
                <button type="button" onClick={() => resolveDispute(selectedDispute, 'partial')} className="action-btn">
                  Refund 50%
                </button>
                <button type="button" onClick={() => resolveDispute(selectedDispute, 'refunded')} className="action-btn action-btn--primary">
                  Full refund
                </button>
              </motion.div>
            ) : (
              <motion.p className="text-muted text-sm font-semibold" variants={detailBodyItem}>
                Closed · {disputeStatusMeta[selectedDispute.status].label}
                {selectedDispute.refunded ? ` · ${formatMoney(selectedDispute.refunded)} returned` : ''}
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
