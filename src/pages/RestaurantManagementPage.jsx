import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import RestaurantKitchenCard from '../components/restaurants/RestaurantKitchenCard.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DetailModal from '../components/ui/DetailModal.jsx'
import {
  DetailBody,
  DetailHighlightPanel,
  DetailSection,
  DetailStat,
  DetailStatGrid,
  detailBodyItem,
  detailTabPanel,
} from '../components/ui/DetailModalParts.jsx'
import FilterChip from '../components/ui/FilterChip.jsx'
import MetricCard from '../components/dashboard/MetricCard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatMoney } from '../lib/formatMoney.js'
import {
  loadRestaurantAdminPersist,
  saveRestaurantAdminPersist,
} from '../lib/restaurantAdminPersist.js'
import RegisterRestaurantModal from '../components/restaurants/RegisterRestaurantModal.jsx'
import {
  buildRestaurantModuleStats,
  createPendingRestaurantFromRegistration,
  enrichRestaurantAdminRecord,
  getRestaurantManagementSnapshot,
  restaurantMatchesBucket,
} from '../data/platformData.js'

const emptyRegisterForm = {
  name: '',
  cuisine: '',
  neighborhood: '',
  street: '',
  ownerName: '',
  phone: '',
  blurb: '',
  commissionPct: '15',
  imageUrl: '',
  imagePreview: '',
}

function revokePreviewUrl(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

function DetailTabs({ tab, onTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'menu', label: 'Menu' },
    { id: 'hours', label: 'Hours & commission' },
  ]
  return (
    <div className="detail-tab-bar">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTab(t.id)}
          className={`detail-tab-btn ${tab === t.id ? 'detail-tab-btn--active' : ''}`}
        >
          {tab === t.id ? (
            <motion.span
              layoutId="restaurant-detail-tab"
              className="detail-tab-indicator"
              transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            />
          ) : null}
          <span className="relative z-[1]">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

function RestaurantModalHero({ restaurant }) {
  return (
    <div className="detail-modal-hero--flush relative h-44 sm:h-48">
      <motion.img
        src={restaurant.image}
        alt=""
        className="detail-modal-hero-media h-full w-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
      <div className="detail-modal-hero-shine" aria-hidden="true" />
      <div className="absolute right-0 bottom-0 left-0 z-[1] p-5 sm:p-6">
        <p className="text-paper/75 text-[0.65rem] font-extrabold tracking-[0.16em] uppercase">Marlow kitchen</p>
        <h2 id="detail-modal-title" className="font-display mt-1 text-2xl font-bold tracking-tight break-words text-paper sm:text-3xl">
          {restaurant.name}
        </h2>
        <p className="text-paper/90 mt-1 text-sm font-medium">
          {restaurant.cuisine} · {restaurant.neighborhood}
        </p>
        <div className="modal-hero-status mt-3">
          <StatusBadge label={restaurant.statusLabel} tone={restaurant.statusTone} onPhoto />
        </div>
      </div>
    </div>
  )
}

const DEFAULT_MENU_CATEGORY = { id: 'specials', name: 'Specials' }

function getMenuAddReminder(name, priceRaw) {
  const trimmedName = name.trim()
  const price = Number.parseFloat(priceRaw)
  const hasName = trimmedName.length > 0
  const hasPrice = priceRaw !== '' && !Number.isNaN(price) && price > 0

  if (hasName && hasPrice) return null
  if (!hasName && !hasPrice) {
    return 'Almost there — add a dish name and price, then tap + again.'
  }
  if (!hasName) return 'What should we call this one? Add a dish name above.'
  if (priceRaw === '' || Number.isNaN(price)) {
    return 'Pop in a price (e.g. 18) and you’re good to go.'
  }
  return 'Use a price above zero and you’re all set.'
}

function applyRestaurantOverrides(restaurant, stockByItemId, commissionByRestaurantId, addedMenuItems = []) {
  const menuByCategory = restaurant.menuByCategory.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      available: stockByItemId[item.id] ?? item.available,
    })),
  }))

  const extras = addedMenuItems.filter((item) => item.restaurantId === restaurant.id)
  for (const raw of extras) {
    const item = {
      ...raw,
      available: stockByItemId[raw.id] ?? raw.available,
    }
    const catId = item.categoryId || DEFAULT_MENU_CATEGORY.id
    let group = menuByCategory.find((g) => g.id === catId)
    if (!group) {
      group = {
        id: catId,
        name: item.categoryName || DEFAULT_MENU_CATEGORY.name,
        items: [],
      }
      menuByCategory.push(group)
    }
    group.items.push(item)
  }

  const allItems = menuByCategory.flatMap((g) => g.items)
  return {
    ...restaurant,
    commissionPct: commissionByRestaurantId[restaurant.id] ?? restaurant.commissionPct,
    menuByCategory,
    menuItemCount: allItems.length,
    unavailableCount: allItems.filter((i) => !i.available).length,
  }
}

function RestaurantDetailBody({
  restaurant,
  detailTab,
  onTab,
  commissionDraft,
  onCommissionDraftChange,
  onRequestCommissionSave,
  onRequestStockToggle,
  menuCategories,
  menuDraft,
  menuAddReminder,
  onMenuDraftChange,
  onRequestAddMenuItem,
}) {
  return (
    <DetailBody>
      <motion.div variants={detailBodyItem}>
        <DetailTabs tab={detailTab} onTab={onTab} />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {detailTab === 'overview' ? (
          <motion.div
            key="overview"
            variants={detailTabPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            {restaurant.blurb ? (
              <DetailHighlightPanel>
                <p className="detail-section-title mb-2">About</p>
                <p className="text-sm leading-relaxed font-medium">{restaurant.blurb}</p>
              </DetailHighlightPanel>
            ) : null}
            <DetailStatGrid>
              <DetailStat label="Owner" value={restaurant.ownerName} accent="copper" />
              <DetailStat label="Registered" value={restaurant.registeredAt} accent="gold" />
              <DetailStat label="Phone" value={restaurant.phone} accent="muted" />
              <DetailStat
                label="Rating"
                value={`★ ${restaurant.rating}`}
                hint={`${restaurant.reviewCount} reviews`}
                accent="sage"
              />
            </DetailStatGrid>
            <DetailSection title="Location">
              <DetailHighlightPanel>
                <p className="text-sm leading-relaxed font-semibold">{restaurant.address}</p>
                <p className="text-muted mt-2 text-xs font-semibold">
                  {restaurant.distance} · {restaurant.etaLabel} · {restaurant.priceLevel}
                </p>
              </DetailHighlightPanel>
            </DetailSection>
          </motion.div>
        ) : null}

        {detailTab === 'menu' ? (
          <motion.div
            key="menu"
            variants={detailTabPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="max-h-[26rem] space-y-4 overflow-y-auto pr-1"
          >
            <DetailSection title="Add menu item">
              <DetailHighlightPanel>
                <div className="menu-add-panel">
                  <label className="menu-add-field">
                    <span className="register-field-label">Dish name</span>
                    <input
                      type="text"
                      value={menuDraft.name}
                      onChange={(e) => onMenuDraftChange({ name: e.target.value })}
                      placeholder="e.g. Truffle pasta"
                      className="register-input"
                    />
                  </label>
                  <label className="menu-add-field menu-add-field--price">
                    <span className="register-field-label">Price ($)</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={menuDraft.price}
                      onChange={(e) => onMenuDraftChange({ price: e.target.value })}
                      placeholder="18"
                      className="register-input"
                    />
                  </label>
                  <label className="menu-add-field">
                    <span className="register-field-label">Category</span>
                    <select
                      value={menuDraft.categoryId}
                      onChange={(e) => onMenuDraftChange({ categoryId: e.target.value })}
                      className="register-input"
                    >
                      {menuCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value={DEFAULT_MENU_CATEGORY.id}>{DEFAULT_MENU_CATEGORY.name}</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="menu-add-btn"
                    aria-label="Add menu item"
                    onClick={onRequestAddMenuItem}
                  >
                    +
                  </button>
                </div>
                {menuAddReminder ? (
                  <p className="menu-add-reminder" role="status">
                    {menuAddReminder}
                  </p>
                ) : null}
              </DetailHighlightPanel>
            </DetailSection>

            {restaurant.unavailableCount > 0 ? (
              <DetailHighlightPanel tone="danger">
                <p className="text-sm font-bold">
                  {restaurant.unavailableCount} item(s) marked out of stock for customers.
                </p>
              </DetailHighlightPanel>
            ) : null}
            {restaurant.menuByCategory.length === 0 ? (
              <DetailHighlightPanel>
                <p className="text-sm font-semibold">No dishes yet — use + above to add the first item.</p>
              </DetailHighlightPanel>
            ) : null}
            {restaurant.menuByCategory.map((group) => (
              <DetailSection key={group.id} title={group.name}>
                <div className="detail-line-list">
                  {group.items.map((item) => (
                    <div key={item.id} className="detail-line-row flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-bold ${!item.available ? 'text-muted line-through decoration-danger/40' : ''}`}>
                          {item.name}
                        </p>
                        <p className="text-muted text-xs font-semibold">
                          {item.veg ? 'Veg' : 'Non-veg'} ·{' '}
                          {item.available ? (
                            <span className="text-sage">In stock</span>
                          ) : (
                            <span className="text-danger">Out of stock</span>
                          )}
                        </p>
                      </div>
                      <div className="detail-line-row-actions w-full sm:w-auto">
                        <span className="font-bold tabular-nums">{formatMoney(item.price)}</span>
                        <button
                          type="button"
                          onClick={() => onRequestStockToggle(item)}
                          className={`rounded-lg border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide transition-colors ${
                            item.available
                              ? 'border-danger/25 bg-danger/5 text-danger hover:bg-danger/10'
                              : 'border-sage/30 bg-sage/10 text-sage hover:bg-sage/15'
                          }`}
                        >
                          {item.available ? 'Out of stock' : 'Restock'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ))}
          </motion.div>
        ) : null}

        {detailTab === 'hours' ? (
          <motion.div
            key="hours"
            variants={detailTabPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-4"
          >
            <DetailSection title="Operating hours">
              <div className="detail-line-list">
                {restaurant.operatingHours.map((row) => (
                  <div key={row.day} className="detail-line-row">
                    <span className="font-bold">{row.day}</span>
                    <span className={row.closed ? 'text-danger font-bold' : 'text-muted font-semibold tabular-nums'}>
                      {row.closed ? 'Closed' : row.slots}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>
            <DetailSection title="Commission settings">
              <DetailHighlightPanel>
                <p className="text-muted text-xs font-semibold">Platform fee on each order from this kitchen.</p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="block">
                    <span className="detail-stat-label">Rate (%)</span>
                    <input
                      type="number"
                      min={5}
                      max={35}
                      step={0.5}
                      value={commissionDraft}
                      onChange={(e) => onCommissionDraftChange(e.target.value)}
                      className="border-line bg-paper mt-1 w-28 rounded-lg border px-3 py-2 text-sm font-bold tabular-nums shadow-[0_4px_12px_rgba(22,19,17,0.04)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={onRequestCommissionSave}
                    className="bg-copper hover:bg-copper-dark w-full rounded-lg px-4 py-2 text-sm font-bold text-paper shadow-[0_8px_20px_rgba(196,92,38,0.32)] transition-transform hover:scale-[1.02] sm:w-auto"
                  >
                    Save commission
                  </button>
                </div>
                <p className="text-muted mt-3 text-xs font-semibold">
                  Current applied rate:{' '}
                  <span className="text-copper-dark font-bold tabular-nums">{restaurant.commissionPct}%</span>
                </p>
              </DetailHighlightPanel>
            </DetailSection>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DetailBody>
  )
}

export default function RestaurantManagementPage() {
  const snapshot = useMemo(() => getRestaurantManagementSnapshot(), [])
  const { filters } = snapshot

  const [initialPersist] = useState(() => loadRestaurantAdminPersist())
  const [addedRestaurants, setAddedRestaurants] = useState(() => initialPersist.addedRestaurants)
  const [stockByItemId, setStockByItemId] = useState(() => initialPersist.stockByItemId)
  const [commissionByRestaurantId, setCommissionByRestaurantId] = useState(
    () => initialPersist.commissionByRestaurantId,
  )
  const [confirm, setConfirm] = useState(null)
  const [bucket, setBucket] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [detailTab, setDetailTab] = useState('overview')
  const [commissionDraft, setCommissionDraft] = useState('')
  const [addedMenuItems, setAddedMenuItems] = useState(() => initialPersist.addedMenuItems)
  const [menuDraft, setMenuDraft] = useState({ name: '', price: '', categoryId: 'mains' })
  const [menuAddReminder, setMenuAddReminder] = useState('')
  const fileInputRef = useRef(null)
  const menuCategories = snapshot.categories

  const restaurants = useMemo(() => {
    const merged = [
      ...addedRestaurants.map((r) => enrichRestaurantAdminRecord(r)),
      ...snapshot.restaurants,
    ]
    return merged.map((r) =>
      applyRestaurantOverrides(r, stockByItemId, commissionByRestaurantId, addedMenuItems),
    )
  }, [addedRestaurants, snapshot.restaurants, stockByItemId, commissionByRestaurantId, addedMenuItems])

  const { filterCounts, metrics } = useMemo(() => buildRestaurantModuleStats(restaurants), [restaurants])

  const visible = useMemo(
    () => restaurants.filter((r) => restaurantMatchesBucket(r, bucket)),
    [restaurants, bucket],
  )

  const selected = restaurants.find((r) => r.id === selectedId) ?? null

  useEffect(() => {
    saveRestaurantAdminPersist({
      addedRestaurants,
      addedMenuItems,
      stockByItemId,
      commissionByRestaurantId,
    })
  }, [addedRestaurants, addedMenuItems, stockByItemId, commissionByRestaurantId])

  useEffect(() => {
    setSelectedId(null)
    setModalOpen(false)
  }, [bucket])

  useEffect(() => {
    if (selected) setCommissionDraft(String(selected.commissionPct))
  }, [selectedId, selected?.commissionPct])

  useEffect(() => {
    setMenuDraft({ name: '', price: '', categoryId: menuCategories[0]?.id ?? DEFAULT_MENU_CATEGORY.id })
    setMenuAddReminder('')
  }, [selectedId, menuCategories])

  const closeRegister = () => {
    revokePreviewUrl(registerForm.imagePreview)
    setRegisterForm(emptyRegisterForm)
    setRegisterOpen(false)
  }

  const patchRegisterForm = (patch) => {
    setRegisterForm((prev) => ({ ...prev, ...patch }))
  }

  const onRegisterPickImage = () => {
    fileInputRef.current?.click()
  }

  const onRegisterFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    revokePreviewUrl(registerForm.imagePreview)
    const reader = new FileReader()
    reader.onload = () => {
      patchRegisterForm({
        imagePreview: typeof reader.result === 'string' ? reader.result : '',
        imageUrl: '',
      })
    }
    reader.readAsDataURL(file)
  }

  const requestRegisterSubmit = () => {
    setConfirm({
      title: 'Submit kitchen for review?',
      message: `"${registerForm.name.trim()}" will appear as Pending approval. Menu can be added after review.`,
      confirmLabel: 'Submit for review',
      onConfirm: () => {
        const record = createPendingRestaurantFromRegistration({
          ...registerForm,
          imageUrl: registerForm.imagePreview || registerForm.imageUrl,
        })
        setAddedRestaurants((prev) => [record, ...prev])
        setBucket('pending_approval')
        setConfirm(null)
        closeRegister()
      },
    })
  }

  return (
    <div className="module-page">
      <section className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Restaurant summary">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} {...metric} index={index} />
        ))}
      </section>

      <div className="chart-panel module-workspace module-table-card flex flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="module-page-header-row">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold tracking-tight">Restaurants & menu</h2>
              <p className="text-muted text-xs font-medium">Marlow kitchens · register new partners for review</p>
            </div>
            <button type="button" onClick={() => setRegisterOpen(true)} className="register-kitchen-btn">
              <span aria-hidden="true">+</span>
              Register kitchen
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={onRegisterFile} />
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

        {visible.length === 0 ? (
          <p className="admin-table-empty text-muted px-4 py-10 text-center text-sm font-medium">
            No restaurants in this view.
          </p>
        ) : (
          <div className="module-restaurant-grid">
            {visible.map((row, index) => (
              <RestaurantKitchenCard
                key={row.id}
                restaurant={row}
                index={index}
                selected={selectedId === row.id && modalOpen}
                onClick={() => {
                  setSelectedId(row.id)
                  setDetailTab('overview')
                  setModalOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <DetailModal
        open={modalOpen && Boolean(selected)}
        onClose={() => setModalOpen(false)}
        hero={selected ? <RestaurantModalHero restaurant={selected} /> : null}
      >
        {selected ? (
          <RestaurantDetailBody
            key={selected.id}
            restaurant={selected}
            detailTab={detailTab}
            onTab={setDetailTab}
            commissionDraft={commissionDraft}
            onCommissionDraftChange={setCommissionDraft}
            onRequestCommissionSave={() => {
              const next = Number.parseFloat(commissionDraft)
              if (Number.isNaN(next) || next < 5 || next > 35) return
              if (next === selected.commissionPct) return
              setConfirm({
                title: 'Update commission?',
                message: `Change ${selected.name} commission from ${selected.commissionPct}% to ${next}%? This applies to new orders immediately.`,
                confirmLabel: 'Update commission',
                onConfirm: () => {
                  setCommissionByRestaurantId((prev) => ({ ...prev, [selected.id]: next }))
                  setConfirm(null)
                },
              })
            }}
            menuCategories={menuCategories}
            menuDraft={menuDraft}
            menuAddReminder={menuAddReminder}
            onMenuDraftChange={(patch) => {
              setMenuDraft((prev) => ({ ...prev, ...patch }))
              setMenuAddReminder('')
            }}
            onRequestAddMenuItem={() => {
              const name = menuDraft.name.trim()
              const price = Number.parseFloat(menuDraft.price)
              const reminder = getMenuAddReminder(menuDraft.name, menuDraft.price)
              if (reminder) {
                setMenuAddReminder(reminder)
                return
              }
              setMenuAddReminder('')
              const category =
                menuCategories.find((c) => c.id === menuDraft.categoryId) ??
                (menuDraft.categoryId === DEFAULT_MENU_CATEGORY.id ? DEFAULT_MENU_CATEGORY : null)
              setConfirm({
                title: 'Add menu item?',
                message: `Add "${name}" at ${formatMoney(price)} to ${selected.name}?`,
                confirmLabel: 'Add item',
                onConfirm: () => {
                  setAddedMenuItems((prev) => [
                    ...prev,
                    {
                      id: `added-${selected.id}-${Date.now().toString(36)}`,
                      restaurantId: selected.id,
                      name,
                      price,
                      categoryId: category?.id ?? DEFAULT_MENU_CATEGORY.id,
                      categoryName: category?.name ?? DEFAULT_MENU_CATEGORY.name,
                      veg: false,
                      available: true,
                    },
                  ])
                  setMenuDraft({ name: '', price: '', categoryId: menuDraft.categoryId })
                  setMenuAddReminder('')
                  setConfirm(null)
                },
              })
            }}
            onRequestStockToggle={(item) => {
              const nextAvailable = !item.available
              setConfirm({
                title: nextAvailable ? 'Mark item back in stock?' : 'Mark out of stock?',
                message: nextAvailable
                  ? `"${item.name}" will appear on the customer menu again.`
                  : `"${item.name}" will be hidden from the customer menu until restocked.`,
                confirmLabel: nextAvailable ? 'Restock' : 'Mark out of stock',
                tone: nextAvailable ? 'copper' : 'danger',
                onConfirm: () => {
                  setStockByItemId((prev) => ({ ...prev, [item.id]: nextAvailable }))
                  setConfirm(null)
                },
              })
            }}
          />
        ) : null}
      </DetailModal>

      <RegisterRestaurantModal
        open={registerOpen}
        form={registerForm}
        onChange={patchRegisterForm}
        onClose={closeRegister}
        onPickImage={onRegisterPickImage}
        onSubmit={requestRegisterSubmit}
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
