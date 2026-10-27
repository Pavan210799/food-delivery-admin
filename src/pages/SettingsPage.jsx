import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Avatar from '../components/ui/Avatar.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DetailModal from '../components/ui/DetailModal.jsx'
import { DetailBody, DetailHighlightPanel, detailBodyItem } from '../components/ui/DetailModalParts.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import FormField, { FormReminder } from '../components/ui/FormField.jsx'
import GradientHero from '../components/ui/GradientHero.jsx'
import ModuleHeader from '../components/ui/ModuleHeader.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import TabBar from '../components/ui/TabBar.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import {
  adminUsersSeed,
  permissionList,
  platformSettingsDefaults,
  pricingDefaults,
  rolesSeed,
  timezones,
  zonesSeed,
} from '../data/moduleData.js'
import { appendAudit, currentAdmin, readAuditLog } from '../lib/auditLog.js'
import { useAuth } from '../lib/authContext.js'
import { pageItemVariants, pageListVariants } from '../lib/pageMotion.js'
import { usePageDirection } from '../lib/usePageDirection.js'
import { formatDateTime, makeId } from '../lib/format.js'
import { formatMoney } from '../lib/formatMoney.js'
import { paginate } from '../lib/pagination.js'
import { usePersistentState } from '../lib/usePersistentState.js'

const AUDIT_PAGE_SIZE = 10
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SAMPLE_DISTANCE_MI = 2.4

const sections = [
  { id: 'platform', label: 'Platform' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'zones', label: 'Delivery zones' },
  { id: 'roles', label: 'Roles & permissions' },
  { id: 'audit', label: 'Audit logs' },
]

const pricingFields = [
  { key: 'baseDeliveryFee', label: 'Base delivery fee ($)', step: '0.01' },
  { key: 'perMileFee', label: 'Per-mile fee ($)', step: '0.05' },
  { key: 'smallOrderThreshold', label: 'Small-order threshold ($)', step: '1' },
  { key: 'smallOrderFee', label: 'Small-order fee ($)', step: '0.5' },
  { key: 'serviceFeePct', label: 'Service fee (%)', step: '0.5' },
  { key: 'taxPct', label: 'Sales tax (%)', step: '0.001' },
  { key: 'defaultCommissionPct', label: 'Default commission (%)', step: '0.5' },
]

const emptyZone = { name: '', area: '', radiusMi: '3', baseEta: '30', surcharge: '0' }

function SaveBar({ dirty, onDiscard, onSave, saveLabel = 'Save changes' }) {
  return (
    <div className="register-modal-footer settings-save-bar">
      <AnimatePresence>
        {dirty ? (
          <motion.span
            className="settings-dirty-dot"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            Unsaved changes
          </motion.span>
        ) : null}
      </AnimatePresence>
      <button type="button" disabled={!dirty} onClick={onDiscard} className="register-btn register-btn--ghost">
        Discard
      </button>
      <button type="button" disabled={!dirty} onClick={onSave} className="register-btn register-btn--primary">
        {saveLabel}
      </button>
    </div>
  )
}

function computeSample(pricing, subtotal, surge) {
  const delivery = (Number(pricing.baseDeliveryFee) + Number(pricing.perMileFee) * SAMPLE_DISTANCE_MI) * (surge ? Number(pricing.surgeMultiplier) : 1)
  const service = subtotal * (Number(pricing.serviceFeePct) / 100)
  const small = subtotal < Number(pricing.smallOrderThreshold) ? Number(pricing.smallOrderFee) : 0
  const tax = subtotal * (Number(pricing.taxPct) / 100)
  const r = (n) => Math.round(n * 100) / 100
  return {
    rows: [
      { label: 'Food subtotal', value: subtotal },
      { label: `Delivery (${SAMPLE_DISTANCE_MI} mi${surge ? ` × ${pricing.surgeMultiplier}` : ''})`, value: r(delivery) },
      { label: `Service fee (${pricing.serviceFeePct}%)`, value: r(service) },
      ...(small ? [{ label: 'Small-order fee', value: small }] : []),
      { label: `Sales tax (${pricing.taxPct}%)`, value: r(tax) },
    ],
    total: r(subtotal + delivery + service + small + tax),
    restaurantNet: r(subtotal * (1 - Number(pricing.defaultCommissionPct) / 100)),
  }
}

export default function SettingsPage() {
  const notify = useToast()
  const me = useAuth().session ?? currentAdmin()
  const [platform, setPlatform] = usePersistentState('settings-platform', platformSettingsDefaults)
  const [pricing, setPricing] = usePersistentState('settings-pricing', pricingDefaults)
  const [zones, setZones] = usePersistentState('settings-zones', zonesSeed)
  const [roles, setRoles] = usePersistentState('settings-roles', rolesSeed)
  const [admins, setAdmins] = usePersistentState('settings-admins', adminUsersSeed)

  const [section, setSection] = useState('platform')
  const [platformDraft, setPlatformDraft] = useState(platform)
  const [platformReminder, setPlatformReminder] = useState('')
  const [pricingDraft, setPricingDraft] = useState(pricing)
  const [pricingReminder, setPricingReminder] = useState('')
  const [sampleSubtotal, setSampleSubtotal] = useState(32)
  const [sampleSurge, setSampleSurge] = useState(false)

  const [zoneModal, setZoneModal] = useState(false)
  const [zoneDraft, setZoneDraft] = useState(emptyZone)
  const [zoneReminder, setZoneReminder] = useState('')

  const [invite, setInvite] = useState({ name: '', email: '', roleId: 'support' })
  const [inviteReminder, setInviteReminder] = useState('')

  const [auditQuery, setAuditQuery] = useState('')
  const [auditModule, setAuditModule] = useState('all')
  const [auditPage, setAuditPage] = useState(1)
  const [confirm, setConfirm] = useState(null)

  const auditEntries = section === 'audit' ? readAuditLog() : []

  const platformDirty = JSON.stringify(platformDraft) !== JSON.stringify(platform)
  const pricingDirty = pricingFields.some((f) => Number(pricingDraft[f.key]) !== Number(pricing[f.key])) || Number(pricingDraft.surgeMultiplier) !== Number(pricing.surgeMultiplier)

  const sample = computeSample(pricingDraft, sampleSubtotal, sampleSurge)

  const savePlatform = () => {
    const d = platformDraft
    if (!d.platformName.trim()) return setPlatformReminder('The platform needs a display name.')
    if (!EMAIL_RE.test(d.supportEmail.trim())) return setPlatformReminder('That support email looks incomplete — double-check it.')
    if (d.supportPhone.replace(/\D/g, '').length < 7) return setPlatformReminder('Add a reachable support phone number.')
    const commit = () => {
      const next = { ...d, platformName: d.platformName.trim(), supportEmail: d.supportEmail.trim() }
      setPlatform(next)
      setPlatformDraft(next)
      setPlatformReminder('')
      appendAudit('Settings', 'Updated platform settings', next.maintenanceMode ? 'Maintenance mode ON' : next.platformName)
      notify('Platform settings saved')
      setConfirm(null)
    }
    if (d.maintenanceMode && !platform.maintenanceMode) {
      setConfirm({
        title: 'Enable maintenance mode?',
        message: 'Customers will see a maintenance screen and no new orders can be placed until you turn it off.',
        confirmLabel: 'Enable & save',
        tone: 'danger',
        onConfirm: commit,
      })
      return
    }
    commit()
  }

  const savePricing = () => {
    for (const f of pricingFields) {
      const v = pricingDraft[f.key]
      if (v === '' || Number.isNaN(Number(v)) || Number(v) < 0) return setPricingReminder(`${f.label.replace(/ \(.*\)/, '')} needs a value of 0 or more.`)
    }
    if (Number(pricingDraft.defaultCommissionPct) > 50) return setPricingReminder('Commission above 50% is unusual — keep it at 50% or lower.')
    if (Number(pricingDraft.taxPct) > 25) return setPricingReminder('Sales tax looks too high — please double-check the rate.')
    const next = Object.fromEntries(Object.entries(pricingDraft).map(([k, v]) => [k, Number(v)]))
    setPricing(next)
    setPricingDraft(next)
    setPricingReminder('')
    appendAudit('Settings', 'Updated pricing', `Delivery ${formatMoney(next.baseDeliveryFee)} · commission ${next.defaultCommissionPct}%`)
    notify('Pricing saved — applies to new orders')
  }

  const addZone = (e) => {
    e.preventDefault()
    if (!zoneDraft.name.trim()) return setZoneReminder('Give the zone a short name, like “Queens”.')
    if (zones.some((z) => z.name.toLowerCase() === zoneDraft.name.trim().toLowerCase())) return setZoneReminder('A zone with that name already exists.')
    if (!zoneDraft.area.trim()) return setZoneReminder('List the neighbourhoods this zone covers.')
    if (!(Number(zoneDraft.radiusMi) > 0)) return setZoneReminder('Radius should be more than 0 miles.')
    if (!(Number(zoneDraft.baseEta) >= 10)) return setZoneReminder('Base ETA should be at least 10 minutes.')
    const zone = {
      id: makeId('z'),
      name: zoneDraft.name.trim(),
      area: zoneDraft.area.trim(),
      radiusMi: Number(zoneDraft.radiusMi),
      baseEta: Number(zoneDraft.baseEta),
      surcharge: Number(zoneDraft.surcharge) || 0,
      active: true,
    }
    setZones((prev) => [...prev, zone])
    appendAudit('Settings', 'Added delivery zone', zone.name)
    notify(`${zone.name} zone is live`)
    setZoneModal(false)
    setZoneDraft(emptyZone)
    setZoneReminder('')
  }

  const togglePermission = (role, permId) => {
    const has = role.permissions.includes(permId)
    if (has && role.permissions.length === 1) {
      notify('A role needs at least one permission', 'info')
      return
    }
    setRoles((prev) =>
      prev.map((r) => (r.id === role.id ? { ...r, permissions: has ? r.permissions.filter((p) => p !== permId) : [...r.permissions, permId] } : r)),
    )
    const label = permissionList.find((p) => p.id === permId)?.label
    appendAudit('Settings', has ? 'Revoked permission' : 'Granted permission', `${role.name} · ${label}`)
    notify(`${role.name} ${has ? 'lost' : 'can now access'} ${label}`, 'info')
  }

  const sendInvite = (e) => {
    e.preventDefault()
    if (!invite.name.trim()) return setInviteReminder('Who are you inviting? Add their name.')
    if (!EMAIL_RE.test(invite.email.trim())) return setInviteReminder('Add a valid work email for the invite.')
    if (admins.some((a) => a.email.toLowerCase() === invite.email.trim().toLowerCase())) return setInviteReminder('That person already has access.')
    const user = { id: makeId('u'), name: invite.name.trim(), email: invite.email.trim(), roleId: invite.roleId, active: true }
    setAdmins((prev) => [...prev, user])
    appendAudit('Settings', 'Invited admin', `${user.name} · ${roles.find((r) => r.id === user.roleId)?.name}`)
    notify(`Invite sent to ${user.email}`)
    setInvite({ name: '', email: '', roleId: invite.roleId })
    setInviteReminder('')
  }

  const auditModules = ['all', ...new Set(auditEntries.map((e) => e.module))]
  const filteredAudit = auditEntries.filter((e) => {
    const q = auditQuery.trim().toLowerCase()
    const matchesQ = !q || `${e.action} ${e.target} ${e.actor}`.toLowerCase().includes(q)
    return matchesQ && (auditModule === 'all' || e.module === auditModule)
  })
  const auditPaged = paginate(filteredAudit, auditPage, AUDIT_PAGE_SIZE)
  const auditDirection = usePageDirection(auditPaged.page)

  const membersByRole = admins.reduce((acc, a) => ({ ...acc, [a.roleId]: (acc[a.roleId] ?? 0) + 1 }), {})

  return (
    <div className="module-page">
      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <ModuleHeader title="Settings" subtitle={`Signed in as ${me.name} · ${me.role}`} />
          <TabBar tabs={sections} active={section} onChange={setSection} layoutId="settings-section-tab" variant="page" />
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
            {section === 'platform' ? (
              <>
                <div className="dashboard-split-50-50">
                  <div className="panel-card space-y-4">
                    <h3 className="panel-title">General</h3>
                    <div className="register-form-grid">
                      <FormField label="Platform name">
                        <input
                          className="register-input"
                          value={platformDraft.platformName}
                          onChange={(e) => {
                            setPlatformDraft((d) => ({ ...d, platformName: e.target.value }))
                            setPlatformReminder('')
                          }}
                        />
                      </FormField>
                      <FormField label="Timezone">
                        <select
                          className="register-input"
                          value={platformDraft.timezone}
                          onChange={(e) => setPlatformDraft((d) => ({ ...d, timezone: e.target.value }))}
                        >
                          {timezones.map((tz) => (
                            <option key={tz}>{tz}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label="Support email">
                        <input
                          className="register-input"
                          type="email"
                          value={platformDraft.supportEmail}
                          onChange={(e) => {
                            setPlatformDraft((d) => ({ ...d, supportEmail: e.target.value }))
                            setPlatformReminder('')
                          }}
                        />
                      </FormField>
                      <FormField label="Support phone">
                        <input
                          className="register-input"
                          type="tel"
                          value={platformDraft.supportPhone}
                          onChange={(e) => {
                            setPlatformDraft((d) => ({ ...d, supportPhone: e.target.value }))
                            setPlatformReminder('')
                          }}
                        />
                      </FormField>
                    </div>
                  </div>
                  <div className="panel-card space-y-1">
                    <h3 className="panel-title">Operations</h3>
                    <Toggle
                      checked={platformDraft.restaurantSignups}
                      onChange={(v) => setPlatformDraft((d) => ({ ...d, restaurantSignups: v }))}
                      label="Restaurant self-signup"
                      description="Kitchens can apply from the partner portal"
                    />
                    <Toggle
                      checked={platformDraft.partnerAutoAssign}
                      onChange={(v) => setPlatformDraft((d) => ({ ...d, partnerAutoAssign: v }))}
                      label="Auto-assign delivery partners"
                      description="Nearest online partner gets new orders"
                    />
                    <Toggle
                      checked={platformDraft.orderAlerts}
                      onChange={(v) => setPlatformDraft((d) => ({ ...d, orderAlerts: v }))}
                      label="Late-order alerts"
                      description="Notify ops when an order passes its ETA"
                    />
                    <Toggle
                      checked={platformDraft.maintenanceMode}
                      onChange={(v) => setPlatformDraft((d) => ({ ...d, maintenanceMode: v }))}
                      label="Maintenance mode"
                      description="Pauses ordering across all apps"
                    />
                    {platformDraft.maintenanceMode ? (
                      <DetailHighlightPanel tone="danger">
                        <p className="text-sm font-semibold">Ordering is paused for customers while maintenance mode is on.</p>
                      </DetailHighlightPanel>
                    ) : null}
                  </div>
                </div>
                <FormReminder message={platformReminder} />
                <SaveBar
                  dirty={platformDirty}
                  onDiscard={() => {
                    setPlatformDraft(platform)
                    setPlatformReminder('')
                  }}
                  onSave={savePlatform}
                />
              </>
            ) : null}

            {section === 'pricing' ? (
              <>
                <div className="dashboard-split-60-40">
                  <div className="panel-card space-y-4">
                    <h3 className="panel-title">Fees & rates</h3>
                    <div className="register-form-grid">
                      {pricingFields.map((f) => (
                        <FormField key={f.key} label={f.label}>
                          <input
                            className="register-input"
                            type="number"
                            min="0"
                            step={f.step}
                            inputMode="decimal"
                            value={pricingDraft[f.key]}
                            onChange={(e) => {
                              setPricingDraft((d) => ({ ...d, [f.key]: e.target.value }))
                              setPricingReminder('')
                            }}
                          />
                        </FormField>
                      ))}
                      <FormField label={`Peak surge multiplier · ${Number(pricingDraft.surgeMultiplier).toFixed(1)}×`}>
                        <input
                          className="settings-range"
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={pricingDraft.surgeMultiplier}
                          onChange={(e) => setPricingDraft((d) => ({ ...d, surgeMultiplier: e.target.value }))}
                        />
                      </FormField>
                    </div>
                  </div>
                  <div className="panel-card space-y-3">
                    <h3 className="panel-title">Live sample order</h3>
                    <div className="module-filters">
                      {[12, 32, 64].map((v) => (
                        <FilterChip key={v} label={formatMoney(v)} active={sampleSubtotal === v} onClick={() => setSampleSubtotal(v)} />
                      ))}
                      <FilterChip label="Peak hour" active={sampleSurge} onClick={() => setSampleSurge((s) => !s)} />
                    </div>
                    <div className="detail-line-list">
                      {sample.rows.map((row) => (
                        <div key={row.label} className="detail-line-row">
                          <span className="min-w-0 truncate font-semibold">{row.label}</span>
                          <span className="shrink-0 font-bold tabular-nums">{formatMoney(row.value)}</span>
                        </div>
                      ))}
                      <div className="detail-line-row detail-line-row--total">
                        <span className="font-bold">Customer pays</span>
                        <span className="text-copper-dark font-bold tabular-nums">{formatMoney(sample.total)}</span>
                      </div>
                    </div>
                    <p className="text-muted text-xs font-semibold">
                      Restaurant receives {formatMoney(sample.restaurantNet)} after {pricingDraft.defaultCommissionPct}% commission.
                    </p>
                  </div>
                </div>
                <FormReminder message={pricingReminder} />
                <SaveBar
                  dirty={pricingDirty}
                  onDiscard={() => {
                    setPricingDraft(pricing)
                    setPricingReminder('')
                  }}
                  onSave={savePricing}
                  saveLabel="Save pricing"
                />
              </>
            ) : null}

            {section === 'zones' ? (
              <>
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <p className="text-muted text-sm font-semibold">
                    {zones.filter((z) => z.active).length} of {zones.length} zones accepting orders
                  </p>
                  <button type="button" className="register-kitchen-btn" onClick={() => setZoneModal(true)}>
                    <span aria-hidden="true">+</span>
                    Add zone
                  </button>
                </div>
                <div className="zone-grid">
                  <AnimatePresence initial={false}>
                    {zones.map((z) => (
                      <motion.div
                        key={z.id}
                        layout
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`zone-card ${z.active ? '' : 'zone-card--off'}`}
                      >
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-display truncate text-base font-bold">{z.name}</p>
                            <p className="text-muted text-xs font-semibold break-words">{z.area}</p>
                          </div>
                          <StatusBadge label={z.active ? 'Live' : 'Paused'} tone={z.active ? 'sage' : 'muted'} />
                        </div>
                        <dl className="zone-card-stats">
                          <div>
                            <dt>Radius</dt>
                            <dd>{z.radiusMi} mi</dd>
                          </div>
                          <div>
                            <dt>Base ETA</dt>
                            <dd>{z.baseEta} min</dd>
                          </div>
                          <div>
                            <dt>Surcharge</dt>
                            <dd>{z.surcharge ? formatMoney(z.surcharge) : '—'}</dd>
                          </div>
                        </dl>
                        <div className="zone-card-foot">
                          <Toggle
                            checked={z.active}
                            onChange={(v) => {
                              setZones((prev) => prev.map((x) => (x.id === z.id ? { ...x, active: v } : x)))
                              appendAudit('Settings', v ? 'Activated zone' : 'Paused zone', z.name)
                              notify(`${z.name} ${v ? 'is accepting orders' : 'paused'}`, v ? 'success' : 'info')
                            }}
                            label="Accepting orders"
                          />
                          <button
                            type="button"
                            className="action-btn action-btn--danger action-btn--sm"
                            onClick={() =>
                              setConfirm({
                                title: `Delete ${z.name}?`,
                                message: 'Addresses in this area will no longer be serviceable.',
                                confirmLabel: 'Delete zone',
                                tone: 'danger',
                                onConfirm: () => {
                                  setZones((prev) => prev.filter((x) => x.id !== z.id))
                                  appendAudit('Settings', 'Deleted delivery zone', z.name)
                                  notify(`${z.name} removed`, 'danger')
                                  setConfirm(null)
                                },
                              })
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : null}

            {section === 'roles' ? (
              <>
                <div className="role-grid">
                  {roles.map((role) => (
                    <div key={role.id} className="panel-card role-card">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display text-base font-bold break-words">{role.name}</p>
                          <p className="text-muted text-xs font-semibold">{role.description}</p>
                        </div>
                        <StatusBadge label={`${membersByRole[role.id] ?? 0} member${membersByRole[role.id] === 1 ? '' : 's'}`} tone={role.locked ? 'copper' : 'muted'} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {permissionList.map((p) => {
                          const on = role.permissions.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              aria-pressed={on}
                              disabled={role.locked}
                              onClick={() => togglePermission(role, p.id)}
                              className={`choice-chip ${on ? 'choice-chip--on' : ''}`}
                            >
                              {on ? '✓ ' : ''}
                              {p.label}
                            </button>
                          )
                        })}
                      </div>
                      {role.locked ? <p className="text-muted mt-2 text-xs font-semibold">Locked · super admins always keep full access.</p> : null}
                    </div>
                  ))}
                </div>
                <div className="dashboard-split-60-40">
                  <div className="panel-card">
                    <h3 className="panel-title">Admin users</h3>
                    <div className="detail-line-list">
                      {admins.map((a) => {
                        const isSelf = a.name === me.name
                        return (
                          <div key={a.id} className={`detail-line-row flex-wrap ${a.active ? '' : 'opacity-60'}`}>
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                              <Avatar name={a.name} tone={a.active ? 'copper' : 'danger'} />
                              <div className="min-w-0">
                                <p className="truncate font-bold">
                                  {a.name}
                                  {isSelf ? <span className="text-muted font-semibold"> · you</span> : null}
                                </p>
                                <p className="text-muted truncate text-xs font-semibold">{a.email}</p>
                              </div>
                            </div>
                            <div className="detail-line-row-actions w-full sm:w-auto">
                              <select
                                className="register-input admin-role-select"
                                value={a.roleId}
                                disabled={isSelf}
                                aria-label={`Role for ${a.name}`}
                                onChange={(e) => {
                                  const roleName = roles.find((r) => r.id === e.target.value)?.name
                                  setAdmins((prev) => prev.map((x) => (x.id === a.id ? { ...x, roleId: e.target.value } : x)))
                                  appendAudit('Settings', 'Changed admin role', `${a.name} → ${roleName}`)
                                  notify(`${a.name} is now ${roleName}`, 'info')
                                }}
                              >
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                disabled={isSelf}
                                className={`action-btn action-btn--sm ${a.active ? 'action-btn--danger' : 'action-btn--sage'}`}
                                onClick={() =>
                                  setConfirm({
                                    title: a.active ? `Deactivate ${a.name}?` : `Reactivate ${a.name}?`,
                                    message: a.active ? 'They will be signed out and lose admin access.' : 'They will regain access with their current role.',
                                    confirmLabel: a.active ? 'Deactivate' : 'Reactivate',
                                    tone: a.active ? 'danger' : 'copper',
                                    onConfirm: () => {
                                      setAdmins((prev) => prev.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)))
                                      appendAudit('Settings', a.active ? 'Deactivated admin' : 'Reactivated admin', a.name)
                                      notify(`${a.name} ${a.active ? 'deactivated' : 'reactivated'}`, a.active ? 'danger' : 'success')
                                      setConfirm(null)
                                    },
                                  })
                                }
                              >
                                {a.active ? 'Deactivate' : 'Reactivate'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <form className="panel-card space-y-3" onSubmit={sendInvite} noValidate>
                    <h3 className="panel-title">Invite an admin</h3>
                    <FormField label="Full name">
                      <input
                        className="register-input"
                        value={invite.name}
                        onChange={(e) => {
                          setInvite((d) => ({ ...d, name: e.target.value }))
                          setInviteReminder('')
                        }}
                        placeholder="Jordan Lee"
                      />
                    </FormField>
                    <FormField label="Work email">
                      <input
                        className="register-input"
                        type="email"
                        value={invite.email}
                        onChange={(e) => {
                          setInvite((d) => ({ ...d, email: e.target.value }))
                          setInviteReminder('')
                        }}
                        placeholder="jordan@marlow.app"
                      />
                    </FormField>
                    <FormField label="Role">
                      <select className="register-input" value={invite.roleId} onChange={(e) => setInvite((d) => ({ ...d, roleId: e.target.value }))}>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormReminder message={inviteReminder} />
                    <div className="register-modal-footer">
                      <button type="submit" className="register-btn register-btn--primary">
                        Send invite
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : null}

            {section === 'audit' ? (
              <>
                <div className="flex min-w-0 flex-col gap-3">
                  <label className="search-field search-field--wide">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="11" cy="11" r="6.5" />
                      <path d="m16 16 4 4" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      value={auditQuery}
                      onChange={(e) => {
                        setAuditQuery(e.target.value)
                        setAuditPage(1)
                      }}
                      placeholder="Search action, target or person"
                      aria-label="Search audit log"
                    />
                  </label>
                  <div className="module-filters">
                    {auditModules.map((m) => (
                      <FilterChip
                        key={m}
                        label={m === 'all' ? 'All modules' : m}
                        active={auditModule === m}
                        onClick={() => {
                          setAuditModule(m)
                          setAuditPage(1)
                        }}
                      />
                    ))}
                  </div>
                </div>
                {auditPaged.items.length === 0 ? (
                  <EmptyState message="No audit entries match your search." />
                ) : (
                  <AnimatePresence mode="wait" custom={auditDirection}>
                  <motion.ol
                    key={auditPaged.page}
                    className="audit-list"
                    custom={auditDirection}
                    variants={pageListVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {auditPaged.items.map((e) => (
                      <motion.li key={e.id} className="audit-item" custom={auditDirection} variants={pageItemVariants}>
                        <span className="audit-dot" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm break-words">
                            <span className="font-bold">{e.actor}</span> <span className="text-muted">{e.action.toLowerCase()}</span>{' '}
                            <span className="font-semibold">{e.target}</span>
                          </p>
                          <p className="text-muted mt-0.5 text-xs font-semibold">{formatDateTime(e.at)}</p>
                        </div>
                        <StatusBadge label={e.module} tone="copper" />
                      </motion.li>
                    ))}
                  </motion.ol>
                  </AnimatePresence>
                )}
                <Pagination {...auditPaged} onPage={setAuditPage} />
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <DetailModal
        open={zoneModal}
        onClose={() => {
          setZoneModal(false)
          setZoneReminder('')
        }}
        hero={<GradientHero eyebrow="Delivery coverage" title="Add zone" subtitle="Define a new serviceable area" tone="sage" />}
      >
        <form onSubmit={addZone} noValidate>
          <DetailBody>
            <motion.div className="register-form-grid" variants={detailBodyItem}>
              <FormField label="Zone name">
                <input
                  className="register-input"
                  value={zoneDraft.name}
                  onChange={(e) => {
                    setZoneDraft((d) => ({ ...d, name: e.target.value }))
                    setZoneReminder('')
                  }}
                  placeholder="Queens"
                />
              </FormField>
              <FormField label="Radius (mi)">
                <input
                  className="register-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={zoneDraft.radiusMi}
                  onChange={(e) => setZoneDraft((d) => ({ ...d, radiusMi: e.target.value }))}
                />
              </FormField>
              <FormField label="Neighbourhoods covered" className="register-field--full">
                <input
                  className="register-input"
                  value={zoneDraft.area}
                  onChange={(e) => {
                    setZoneDraft((d) => ({ ...d, area: e.target.value }))
                    setZoneReminder('')
                  }}
                  placeholder="Astoria · Long Island City"
                />
              </FormField>
              <FormField label="Base ETA (min)">
                <input
                  className="register-input"
                  type="number"
                  min="10"
                  value={zoneDraft.baseEta}
                  onChange={(e) => setZoneDraft((d) => ({ ...d, baseEta: e.target.value }))}
                />
              </FormField>
              <FormField label="Surcharge ($)">
                <input
                  className="register-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={zoneDraft.surcharge}
                  onChange={(e) => setZoneDraft((d) => ({ ...d, surcharge: e.target.value }))}
                />
              </FormField>
            </motion.div>
            <FormReminder message={zoneReminder} />
            <motion.div className="register-modal-footer" variants={detailBodyItem}>
              <button
                type="button"
                className="register-btn register-btn--ghost"
                onClick={() => {
                  setZoneModal(false)
                  setZoneReminder('')
                }}
              >
                Cancel
              </button>
              <button type="submit" className="register-btn register-btn--primary">
                Add zone
              </button>
            </motion.div>
          </DetailBody>
        </form>
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
