/** Single source of truth for all admin modules (dashboard + future pages). */

import { restaurants as marlowKitchens } from './restaurants.js'
import { DEFAULT_REGISTER_COVER } from '../lib/restaurantAdminPersist.js'

function portrait(path) {
  return `https://randomuser.me/api/portraits/${path}.jpg`
}

export const platformMeta = {
  brand: 'Marlow',
  currency: 'USD',
}

export const analytics = {
  salesDaily: [
    { label: 'Mon', orders: 284, revenueK: 41 },
    { label: 'Tue', orders: 531, revenueK: 79 },
    { label: 'Wed', orders: 362, revenueK: 52 },
    { label: 'Thu', orders: 698, revenueK: 104 },
    { label: 'Fri', orders: 419, revenueK: 63 },
    { label: 'Sat', orders: 812, revenueK: 121 },
    { label: 'Sun', orders: 295, revenueK: 44 },
  ],
  activeUsersDaily: [
    { label: 'Mon', users: 368 },
    { label: 'Tue', users: 512 },
    { label: 'Wed', users: 401 },
    { label: 'Thu', users: 589 },
    { label: 'Fri', users: 447 },
    { label: 'Sat', users: 634 },
    { label: 'Sun', users: 392 },
  ],
  peakHoursToday: [
    { label: '10am', orders: 18 },
    { label: '11am', orders: 74 },
    { label: '12pm', orders: 142 },
    { label: '1pm', orders: 118 },
    { label: '2pm', orders: 52 },
    { label: '7pm', orders: 164 },
    { label: '8pm', orders: 198 },
    { label: '9pm', orders: 127 },
    { label: '10pm', orders: 61 },
  ],
  orderStatusMix: [
    { id: 'delivered', label: 'Delivered', value: 58, color: '#24543c', gradientId: 'slice-sage' },
    { id: 'transit', label: 'In transit', value: 22, color: '#c45c26', gradientId: 'slice-copper' },
    { id: 'pending', label: 'Pending', value: 12, color: '#8d6b32', gradientId: 'slice-gold' },
    { id: 'cancelled', label: 'Cancelled', value: 8, color: '#8c2e2e', gradientId: 'slice-danger' },
  ],
  deliveryZones: [
    { id: 'north', label: 'North', sharePct: 88, orders: 420, color: '#c45c26', gradientId: 'ring-copper' },
    { id: 'central', label: 'Central', sharePct: 72, orders: 356, color: '#24543c', gradientId: 'ring-sage' },
    { id: 'east', label: 'East', sharePct: 64, orders: 298, color: '#8d6b32', gradientId: 'ring-gold' },
    { id: 'south', label: 'South', sharePct: 91, orders: 445, color: '#8d3e12', gradientId: 'ring-copper-dark' },
  ],
  performanceMetrics: [
    {
      id: 'fulfillment',
      label: 'Fulfillment rate',
      value: 96.8,
      unit: '%',
      progress: 96.8,
      hint: 'Orders completed vs placed',
      gradient: 'linear-gradient(90deg, #5a9d78, #24543c)',
      glow: '#24543c66',
    },
    {
      id: 'ontime',
      label: 'On-time delivery',
      value: 91.2,
      unit: '%',
      progress: 91.2,
      hint: 'Within promised window',
      gradient: 'linear-gradient(90deg, #f0a574, #c45c26)',
      glow: '#c45c2666',
    },
    {
      id: 'aov',
      label: 'Avg. order value',
      value: 42,
      unit: '$',
      progress: 72,
      hint: 'Mean basket size',
      gradient: 'linear-gradient(90deg, #d4b06a, #8d6b32)',
      glow: '#8d6b3266',
    },
    {
      id: 'cancel',
      label: 'Cancellation rate',
      value: 2.1,
      unit: '%',
      progress: 12,
      hint: 'Lower is better',
      gradient: 'linear-gradient(90deg, #b84a4a, #8c2e2e)',
      glow: '#8c2e2e55',
    },
  ],
  overview: {
    totalOrders: 12847,
    ordersChangePct: 8.4,
    revenueDisplay: '$504K',
    revenueChangePct: 12.1,
    activeUsers: 3412,
    usersChangePct: 5.2,
    activeDeliveries: 186,
  },
}

/** Admin filter buckets for order management (task mail §2). */
export const orderFilterBuckets = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'delivering', label: 'Active deliveries' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunds', label: 'Refund requests' },
]

export const orderStatusMeta = {
  pending: { label: 'Pending', tone: 'gold', bucket: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'copper', bucket: 'confirmed' },
  preparing: { label: 'Preparing', tone: 'copper', bucket: 'confirmed' },
  delivering: { label: 'Out for delivery', tone: 'sage', bucket: 'delivering' },
  delivered: { label: 'Delivered', tone: 'sage', bucket: 'delivered' },
  cancelled: { label: 'Cancelled', tone: 'danger', bucket: 'cancelled' },
  refund_requested: { label: 'Refund requested', tone: 'danger', bucket: 'refunds' },
}

export const restaurantFilterBuckets = [
  { id: 'all', label: 'All restaurants' },
  { id: 'active', label: 'Active' },
  { id: 'pending_approval', label: 'Pending approval' },
  { id: 'verification_pending', label: 'Verification' },
]

export const restaurantStatusMeta = {
  active: { label: 'Active', tone: 'sage' },
  pending_approval: { label: 'Pending approval', tone: 'gold' },
  verification_pending: { label: 'Verification', tone: 'copper' },
  suspended: { label: 'Suspended', tone: 'danger' },
}

function menuCategoryId(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const kitchenAdminStatus = {
  'saffron-atelier': 'pending_approval',
  'nopal-salt': 'verification_pending',
}

function buildKitchenCatalog() {
  const categoryNames = [...new Set(marlowKitchens.flatMap((k) => k.menu.map((m) => m.category)))].sort()
  const foodCategories = categoryNames.map((name) => ({ id: menuCategoryId(name), name }))

  const unavailableIds = new Set(['ember-gem', 'luna-branzino', 'koi-sunomono'])

  const menuItems = marlowKitchens.flatMap((kitchen) =>
    kitchen.menu.map((item) => ({
      id: item.id,
      restaurantId: kitchen.id,
      categoryId: menuCategoryId(item.category),
      name: item.name,
      price: item.price,
      available: !unavailableIds.has(item.id),
      veg: item.vegetarian,
    })),
  )

  const restaurants = marlowKitchens.map((kitchen) => {
    const status = kitchenAdminStatus[kitchen.id] ?? 'active'
    return {
      id: kitchen.id,
      name: kitchen.name,
      status,
      cuisine: kitchen.cuisine,
      address: `${kitchen.address}, ${kitchen.neighborhood}`,
      phone: '+1 212 555 0198',
      ownerName: `${kitchen.name} kitchen`,
      rating: kitchen.rating,
      reviewCount: kitchen.reviews,
      image: kitchen.image,
      neighborhood: kitchen.neighborhood,
      etaLabel: kitchen.etaLabel,
      priceLevel: kitchen.priceLevel,
      distance: kitchen.distance,
      deliveryFee: kitchen.deliveryFee,
      offer: kitchen.offer ?? null,
      commissionPct: 15 + (kitchen.menu.length % 6),
      verified: status === 'active',
      registeredAt: '12 Jan 2024',
      operatingHours: [{ day: 'Mon – Sun', slots: '11:00 – 23:00', closed: false }],
      blurb: kitchen.blurb,
    }
  })

  return { foodCategories, menuItems, restaurants }
}

const ordersCore = [
  {
    id: 'ML-8842',
    status: 'confirmed',
    restaurantId: 'saffron-atelier',
    customerId: 'c1',
    placedAt: 'Today, 10:24',
    eta: '11:05',
    total: 49,
    payment: 'Card',
    address: '88 East 7th Street, East Village',
    partnerId: 'p1',
    items: [
      { name: 'Saffron butter chicken', qty: 1, price: 22 },
      { name: 'Garlic naan', qty: 2, price: 5 },
      { name: 'Steamed basmati', qty: 1, price: 0 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '10:24', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '10:28', done: true },
      { id: 'prep', label: 'Preparing', time: '10:35', done: true, current: true },
      { id: 'pickup', label: 'Picked up', time: '—', done: false },
      { id: 'delivered', label: 'Delivered', time: '—', done: false },
    ],
    refund: null,
  },
  {
    id: 'ML-8810',
    status: 'refund_requested',
    restaurantId: 'casa-luna',
    customerId: 'c2',
    placedAt: 'Today, 09:12',
    eta: '—',
    total: 39,
    payment: 'Card',
    address: '21 Bedford Street, West Village',
    partnerId: null,
    items: [
      { name: 'Burrata & stone fruit', qty: 1, price: 17 },
      { name: 'Tagliatelle al ragù', qty: 1, price: 24 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '09:12', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '09:18', done: true },
      { id: 'prep', label: 'Preparing', time: '09:25', done: true },
      { id: 'pickup', label: 'Picked up', time: '09:40', done: true },
      { id: 'delivered', label: 'Delivered', time: '10:02', done: true },
    ],
    refund: { amount: 17, reason: 'Missing burrata', status: 'pending', requestedAt: '10:18' },
  },
  {
    id: 'ML-8799',
    status: 'delivering',
    restaurantId: 'koi-cedar',
    customerId: 'c3',
    placedAt: 'Today, 10:05',
    eta: '10:42',
    total: 36,
    payment: 'Card',
    address: '40 Spring Street, Nolita',
    partnerId: 'p1',
    items: [
      { name: 'Nigiri set', qty: 1, price: 32 },
      { name: 'Cold barley tea', qty: 1, price: 4 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '10:05', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '10:08', done: true },
      { id: 'prep', label: 'Preparing', time: '10:15', done: true },
      { id: 'pickup', label: 'Picked up', time: '10:28', done: true, current: true },
      { id: 'delivered', label: 'Delivered', time: '—', done: false },
    ],
    refund: null,
  },
  {
    id: 'ML-8788',
    status: 'pending',
    restaurantId: 'ember-rye',
    customerId: 'c4',
    placedAt: 'Today, 10:31',
    eta: '11:20',
    total: 72,
    payment: 'Card',
    address: '14 Hudson Street, Hudson Street',
    partnerId: null,
    items: [
      { name: 'Dry-aged ribeye', qty: 1, price: 48 },
      { name: 'Charred broccolini', qty: 1, price: 11 },
      { name: 'Lemon verbena cooler', qty: 1, price: 7 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '10:31', done: true, current: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '—', done: false },
      { id: 'prep', label: 'Preparing', time: '—', done: false },
      { id: 'pickup', label: 'Picked up', time: '—', done: false },
      { id: 'delivered', label: 'Delivered', time: '—', done: false },
    ],
    refund: null,
  },
  {
    id: 'ML-8772',
    status: 'delivered',
    restaurantId: 'verde-room',
    customerId: 'c3',
    placedAt: 'Yesterday, 20:14',
    eta: '20:52',
    total: 44,
    payment: 'Card',
    address: '190 Court Street, Cobble Hill',
    partnerId: 'p2',
    items: [
      { name: 'Lamb kofta', qty: 1, price: 22 },
      { name: 'Fattoush', qty: 1, price: 12 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '20:14', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '20:16', done: true },
      { id: 'prep', label: 'Preparing', time: '20:22', done: true },
      { id: 'pickup', label: 'Picked up', time: '20:38', done: true },
      { id: 'delivered', label: 'Delivered', time: '20:51', done: true },
    ],
    refund: null,
  },
  {
    id: 'ML-8765',
    status: 'cancelled',
    restaurantId: 'casa-luna',
    customerId: 'c2',
    placedAt: 'Yesterday, 18:02',
    eta: '—',
    total: 19,
    payment: 'Card',
    address: '21 Bedford Street, West Village',
    partnerId: null,
    items: [{ name: 'Margherita', qty: 1, price: 19 }],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '18:02', done: true },
      { id: 'cancelled', label: 'Cancelled by restaurant', time: '18:08', done: true, current: true },
    ],
    refund: null,
    cancelReason: 'Kitchen closed early',
  },
  {
    id: 'ML-8755',
    status: 'preparing',
    restaurantId: 'nopal-salt',
    customerId: 'c1',
    placedAt: 'Today, 10:18',
    eta: '10:55',
    total: 35,
    payment: 'Wallet',
    address: '112 Orchard Street, Lower East Side',
    partnerId: null,
    items: [
      { name: 'Short rib tacos', qty: 1, price: 18 },
      { name: 'Elote', qty: 1, price: 8 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '10:18', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '10:20', done: true },
      { id: 'prep', label: 'Preparing', time: '10:25', done: true, current: true },
      { id: 'pickup', label: 'Picked up', time: '—', done: false },
      { id: 'delivered', label: 'Delivered', time: '—', done: false },
    ],
    refund: null,
  },
  {
    id: 'ML-8740',
    status: 'delivering',
    restaurantId: 'ember-rye',
    customerId: 'c4',
    placedAt: 'Today, 09:48',
    eta: '10:35',
    total: 40,
    payment: 'Card',
    address: '14 Hudson Street, Hudson Street',
    partnerId: 'p2',
    items: [
      { name: 'Ember burger', qty: 1, price: 24 },
      { name: 'Chocolate pot de crème', qty: 1, price: 12 },
    ],
    tracking: [
      { id: 'placed', label: 'Order placed', time: '09:48', done: true },
      { id: 'confirmed', label: 'Restaurant confirmed', time: '09:52', done: true },
      { id: 'prep', label: 'Preparing', time: '10:00', done: true },
      { id: 'pickup', label: 'Picked up', time: '10:12', done: true, current: true },
      { id: 'delivered', label: 'Delivered', time: '—', done: false },
    ],
    refund: null,
  },
]

const customersCore = [
  { id: 'c1', name: 'Priya Sharma', email: 'priya@example.com', photo: portrait('women/44'), status: 'active', ordersCount: 24 },
  { id: 'c2', name: 'Arjun Mehta', email: 'arjun@example.com', photo: portrait('men/32'), status: 'active', ordersCount: 9 },
  { id: 'c3', name: 'Neha Reddy', email: 'neha@example.com', photo: portrait('women/68'), status: 'active', ordersCount: 31 },
  { id: 'c4', name: 'Karan Joshi', email: 'karan@example.com', photo: portrait('men/46'), status: 'active', ordersCount: 6 },
]

function defaultTracking(status) {
  const base = [
    { id: 'placed', label: 'Order placed', time: '—', done: true },
    { id: 'confirmed', label: 'Restaurant confirmed', time: '—', done: false },
    { id: 'prep', label: 'Preparing', time: '—', done: false },
    { id: 'pickup', label: 'Picked up', time: '—', done: false },
    { id: 'delivered', label: 'Delivered', time: '—', done: false },
  ]
  if (status === 'pending') return [{ ...base[0], current: true }, ...base.slice(1)]
  if (status === 'cancelled') {
    return [
      { id: 'placed', label: 'Order placed', time: '—', done: true },
      { id: 'cancelled', label: 'Cancelled', time: '—', done: true, current: true },
    ]
  }
  if (status === 'delivered') return base.map((s) => ({ ...s, done: true }))
  if (status === 'delivering') {
    return base.map((s, i) => ({ ...s, done: i < 4, current: i === 3 }))
  }
  if (status === 'refund_requested') {
    return base.map((s) => ({ ...s, done: true }))
  }
  if (status === 'preparing' || status === 'confirmed') {
    return base.map((s, i) => ({ ...s, done: i < 2, current: i === 2 }))
  }
  return base
}

function orderLinesFromKitchen(kitchen, i) {
  const a = kitchen.menu[i % kitchen.menu.length]
  const b = kitchen.menu[(i + 2) % kitchen.menu.length]
  if (i % 3 === 0) {
    return [{ name: a.name, qty: 1, price: a.price }]
  }
  return [
    { name: a.name, qty: 1, price: a.price },
    { name: b.name, qty: 1, price: b.price },
  ]
}

function buildCatalog() {
  const kitchenCatalog = buildKitchenCatalog()
  const { restaurants: allRestaurants, menuItems: allMenu, foodCategories } = kitchenCatalog

  const extraCustomers = [
    { id: 'c5', name: 'Sana Iqbal', email: 'sana@example.com', photo: portrait('women/65'), status: 'active', ordersCount: 14 },
    { id: 'c6', name: 'Vikram Patel', email: 'vikram@example.com', photo: portrait('men/75'), status: 'active', ordersCount: 42 },
    { id: 'c7', name: 'Lakshmi Rao', email: 'lakshmi@example.com', photo: portrait('women/79'), status: 'active', ordersCount: 18 },
    { id: 'c8', name: 'Rohan Desai', email: 'rohan@example.com', photo: portrait('men/52'), status: 'active', ordersCount: 7 },
  ]
  const allCustomers = [...customersCore, ...extraCustomers]

  const statusCycle = [
    'pending',
    'confirmed',
    'preparing',
    'delivering',
    'delivered',
    'delivered',
    'cancelled',
    'delivering',
    'delivered',
    'confirmed',
  ]
  const payments = ['Card', 'Apple Pay', 'Wallet']
  const extraOrders = Array.from({ length: 26 }, (_, i) => {
    const num = 8720 - i
    const status = i === 4 ? 'refund_requested' : statusCycle[i % statusCycle.length]
    const kitchen = allRestaurants[i % allRestaurants.length]
    const marlowKitchen = marlowKitchens.find((k) => k.id === kitchen.id)
    const items = orderLinesFromKitchen(marlowKitchen, i)
    const total = items.reduce((sum, line) => sum + line.price * line.qty, 0)
    const customerId = allCustomers[i % allCustomers.length].id
    return {
      id: `ML-${num}`,
      status,
      restaurantId: kitchen.id,
      customerId,
      placedAt: i < 6 ? `Today, ${9 + (i % 4)}:${10 + i * 2}` : `Yesterday, ${14 + (i % 6)}:${20 + i}`,
      eta: status === 'delivered' || status === 'cancelled' ? '—' : `${10 + (i % 5)}:${30 + i}`,
      total,
      payment: payments[i % payments.length],
      address: kitchen.address,
      partnerId: status === 'delivering' ? (i % 2 === 0 ? 'p1' : 'p2') : null,
      items,
      tracking: defaultTracking(status),
      refund:
        status === 'refund_requested'
          ? { amount: Math.round(total * 0.25), reason: 'Quality issue', status: 'pending', requestedAt: 'Today, 09:40' }
          : null,
      cancelReason: status === 'cancelled' ? 'Customer unavailable' : undefined,
    }
  })

  const allOrders = [...ordersCore, ...extraOrders]

  return {
    orders: allOrders,
    restaurants: allRestaurants,
    menuItems: allMenu,
    foodCategories,
    customers: allCustomers,
  }
}

const catalog = buildCatalog()
export const orders = catalog.orders
export const restaurants = catalog.restaurants
export const menuItems = catalog.menuItems
export const foodCategories = catalog.foodCategories
export const customers = catalog.customers

const verifiedDocs = [
  { id: 'license', label: "Driver's license", status: 'verified' },
  { id: 'id', label: 'Government ID', status: 'verified' },
  { id: 'insurance', label: 'Vehicle insurance', status: 'verified' },
  { id: 'background', label: 'Background check', status: 'verified' },
]

function docsWith(overrides) {
  return verifiedDocs.map((doc) => ({ ...doc, status: overrides[doc.id] ?? doc.status }))
}

export const deliveryPartners = [
  {
    id: 'p1', name: 'Ravi K.', phone: '+1 212 555 0141', email: 'ravi.k@marlow.app', photo: portrait('men/22'), zone: 'North',
    vehicle: 'E-bike', vehicleNo: 'NY-EB-2041', status: 'active', online: true, rating: 4.9,
    deliveriesToday: 11, totalDeliveries: 1284, onTimePct: 96, acceptancePct: 92, joinedAt: '2023-03-14',
    earningsWeek: [142, 168, 121, 188, 204, 236, 97], tipsWeek: 186, documents: docsWith({}),
  },
  {
    id: 'p2', name: 'Anita S.', phone: '+1 212 555 0172', email: 'anita.s@marlow.app', photo: portrait('women/26'), zone: 'Central',
    vehicle: 'Scooter', vehicleNo: 'NY-SC-7712', status: 'active', online: false, rating: 4.7,
    deliveriesToday: 0, totalDeliveries: 846, onTimePct: 93, acceptancePct: 88, joinedAt: '2023-08-02',
    earningsWeek: [118, 96, 0, 132, 154, 171, 0], tipsWeek: 104, documents: docsWith({}),
  },
  {
    id: 'p3', name: 'Marcus L.', phone: '+1 718 555 0119', email: 'marcus.l@marlow.app', photo: portrait('men/36'), zone: 'East',
    vehicle: 'Car', vehicleNo: 'NY-CR-3390', status: 'active', online: true, rating: 4.8,
    deliveriesToday: 8, totalDeliveries: 1027, onTimePct: 94, acceptancePct: 90, joinedAt: '2023-05-21',
    earningsWeek: [131, 149, 160, 112, 198, 214, 128], tipsWeek: 152, documents: docsWith({}),
  },
  {
    id: 'p4', name: 'Sofia G.', phone: '+1 646 555 0188', email: 'sofia.g@marlow.app', photo: portrait('women/31'), zone: 'South',
    vehicle: 'Bicycle', vehicleNo: '—', status: 'active', online: true, rating: 4.95,
    deliveriesToday: 9, totalDeliveries: 612, onTimePct: 98, acceptancePct: 95, joinedAt: '2024-01-09',
    earningsWeek: [104, 122, 118, 141, 133, 167, 89], tipsWeek: 141, documents: docsWith({}),
  },
  {
    id: 'p5', name: 'Omar H.', phone: '+1 917 555 0104', email: 'omar.h@marlow.app', photo: portrait('men/61'), zone: 'Central',
    vehicle: 'Scooter', vehicleNo: 'NY-SC-1208', status: 'pending_verification', online: false, rating: 0,
    deliveriesToday: 0, totalDeliveries: 0, onTimePct: 0, acceptancePct: 0, joinedAt: '2026-10-24',
    earningsWeek: [0, 0, 0, 0, 0, 0, 0], tipsWeek: 0,
    documents: docsWith({ insurance: 'pending', background: 'pending' }),
  },
  {
    id: 'p6', name: 'Grace T.', phone: '+1 347 555 0163', email: 'grace.t@marlow.app', photo: portrait('women/50'), zone: 'North',
    vehicle: 'E-bike', vehicleNo: 'NY-EB-5517', status: 'pending_verification', online: false, rating: 0,
    deliveriesToday: 0, totalDeliveries: 0, onTimePct: 0, acceptancePct: 0, joinedAt: '2026-10-25',
    earningsWeek: [0, 0, 0, 0, 0, 0, 0], tipsWeek: 0,
    documents: docsWith({ license: 'pending', id: 'pending', insurance: 'pending', background: 'pending' }),
  },
  {
    id: 'p7', name: 'Dev P.', phone: '+1 212 555 0127', email: 'dev.p@marlow.app', photo: portrait('men/11'), zone: 'East',
    vehicle: 'Car', vehicleNo: 'NY-CR-8804', status: 'active', online: false, rating: 4.6,
    deliveriesToday: 3, totalDeliveries: 431, onTimePct: 89, acceptancePct: 84, joinedAt: '2024-06-17',
    earningsWeek: [88, 0, 102, 94, 0, 146, 61], tipsWeek: 72, documents: docsWith({}),
  },
  {
    id: 'p8', name: 'Hannah W.', phone: '+1 646 555 0150', email: 'hannah.w@marlow.app', photo: portrait('women/17'), zone: 'South',
    vehicle: 'Scooter', vehicleNo: 'NY-SC-4471', status: 'suspended', online: false, rating: 4.1,
    deliveriesToday: 0, totalDeliveries: 298, onTimePct: 78, acceptancePct: 71, joinedAt: '2024-02-28',
    earningsWeek: [0, 0, 0, 0, 0, 0, 0], tipsWeek: 0, documents: docsWith({ insurance: 'rejected' }),
    suspendReason: 'Expired vehicle insurance',
  },
]

export const transactions = [
  { id: 'tx1', type: 'order_payment', amount: 612, status: 'success', orderId: 'ML-8842' },
  { id: 'tx2', type: 'refund', amount: 120, status: 'pending', orderId: 'ML-8810' },
]

export const offers = [
  { id: 'o1', code: 'WELCOME20', uses: 512, limit: 2000, minOrder: 299, expiresInDays: 5 },
  { id: 'o2', code: 'FREESHIP', uses: 891, limit: null, minOrder: 199, expiresInDays: 12 },
]

export const supportTickets = [
  { id: 't1', subject: 'Missing item', status: 'open', orderId: 'ML-8810' },
  { id: 't2', subject: 'Late delivery', status: 'resolved', orderId: 'ML-8755' },
]

export const activityFeed = [
  { id: 'a1', time: '2m', title: 'Order #ML-8842 confirmed', type: 'order' },
  { id: 'a2', time: '8m', title: 'Saffron Atelier — pending approval', type: 'restaurant' },
  { id: 'a3', time: '14m', title: 'Refund #ML-8810 opened', type: 'refund' },
  { id: 'a4', time: '22m', title: 'Ravi K. online · North', type: 'partner' },
  { id: 'a5', time: '35m', title: 'WELCOME20 — 512 redemptions', type: 'promo' },
  { id: 'a6', time: '41m', title: 'Settlement batch #104 queued', type: 'payment' },
]

/** Dashboard-facing snapshot — always derived from `analytics` + shared entities. */
export function getDashboardSnapshot() {
  const {
    overview,
    salesDaily,
    activeUsersDaily,
    peakHoursToday,
    orderStatusMix,
    deliveryZones,
    performanceMetrics,
  } = analytics

  const metrics = [
    {
      id: 'orders',
      label: 'Total orders',
      value: overview.totalOrders.toLocaleString('en-US'),
      change: `+${overview.ordersChangePct}%`,
      trend: 'up',
      accent: 'copper',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: overview.revenueDisplay,
      change: `+${overview.revenueChangePct}%`,
      trend: 'up',
      accent: 'sage',
    },
    {
      id: 'users',
      label: 'Active users',
      value: overview.activeUsers.toLocaleString('en-US'),
      change: `+${overview.usersChangePct}%`,
      trend: 'up',
      accent: 'gold',
    },
    {
      id: 'deliveries',
      label: 'Active deliveries',
      value: String(overview.activeDeliveries),
      change: 'Live',
      trend: 'neutral',
      accent: 'copper',
    },
  ]

  return {
    metrics,
    salesDaily,
    activeUsersDaily,
    peakHoursToday,
    orderStatusMix,
    deliveryZones,
    performanceMetrics,
    activities: activityFeed,
  }
}

/** Module counts for placeholder screens — same data source. */
export function getModuleCounts() {
  return {
    orders: orders.length,
    restaurants: restaurants.length,
    deliveryPartners: deliveryPartners.length,
    customers: customers.length,
    transactions: transactions.length,
    offers: offers.length,
    supportTickets: supportTickets.length,
  }
}

function customerMap() {
  return Object.fromEntries(customers.map((c) => [c.id, c]))
}

function restaurantMap() {
  return Object.fromEntries(restaurants.map((r) => [r.id, r]))
}

function partnerMap() {
  return Object.fromEntries(deliveryPartners.map((p) => [p.id, p]))
}

export function orderMatchesBucket(order, bucketId) {
  if (bucketId === 'all') return true
  const meta = orderStatusMeta[order.status]
  if (!meta) return false
  if (bucketId === 'refunds') return Boolean(order.refund) || order.status === 'refund_requested'
  if (bucketId === 'confirmed') return meta.bucket === 'confirmed'
  return meta.bucket === bucketId
}

export function countOrdersByBucket(bucketId) {
  return orders.filter((o) => orderMatchesBucket(o, bucketId)).length
}

/** Order management module — enriched rows + filter metadata. */
export function getOrderManagementSnapshot() {
  const customersById = customerMap()
  const restaurantsById = restaurantMap()
  const partnersById = partnerMap()

  const enriched = orders.map((order) => ({
    ...order,
    customer: customersById[order.customerId]?.name ?? '—',
    customerEmail: customersById[order.customerId]?.email ?? '',
    restaurant: restaurantsById[order.restaurantId]?.name ?? '—',
    partner: order.partnerId ? partnersById[order.partnerId]?.name ?? '—' : null,
    statusLabel: orderStatusMeta[order.status]?.label ?? order.status,
    statusTone: orderStatusMeta[order.status]?.tone ?? 'muted',
  }))

  const filterCounts = Object.fromEntries(
    orderFilterBuckets.map((b) => [b.id, countOrdersByBucket(b.id)]),
  )

  const shareOfOrders = (count) =>
    `${Math.round((count / Math.max(filterCounts.all, 1)) * 100)}% of orders`

  const metrics = [
    {
      id: 'pending',
      label: 'Pending',
      value: String(filterCounts.pending),
      change: shareOfOrders(filterCounts.pending),
      accent: 'gold',
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      value: String(filterCounts.confirmed),
      change: shareOfOrders(filterCounts.confirmed),
      accent: 'copper',
    },
    {
      id: 'deliveries',
      label: 'Active deliveries',
      value: String(filterCounts.delivering),
      change: 'Live',
      accent: 'sage',
    },
    {
      id: 'refunds',
      label: 'Refund requests',
      value: String(filterCounts.refunds),
      change: 'Needs review',
      accent: 'danger',
    },
  ]

  return {
    filters: orderFilterBuckets,
    filterCounts,
    metrics,
    orders: enriched,
  }
}

export function restaurantMatchesBucket(restaurant, bucketId) {
  if (bucketId === 'all') return true
  if (bucketId === 'active') return restaurant.status === 'active'
  return restaurant.status === bucketId
}

const defaultRegisterCover = DEFAULT_REGISTER_COVER

function slugKitchenId(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base || 'kitchen'}-${Date.now().toString(36)}`
}

/** Admin-only registration payload → restaurant record (session list). */
export function createPendingRestaurantFromRegistration(input) {
  const commission = Number.parseFloat(input.commissionPct)
  return {
    id: slugKitchenId(input.name),
    name: input.name.trim(),
    status: 'pending_approval',
    cuisine: input.cuisine.trim(),
    address: `${input.street.trim()}, ${input.neighborhood.trim()}`,
    phone: input.phone.trim(),
    ownerName: input.ownerName.trim(),
    rating: 0,
    reviewCount: 0,
    image: input.imageUrl?.trim() || defaultRegisterCover,
    neighborhood: input.neighborhood.trim(),
    etaLabel: '30–45 min',
    priceLevel: '$$',
    distance: '—',
    deliveryFee: 2.99,
    offer: null,
    commissionPct: Number.isNaN(commission) ? 15 : Math.min(35, Math.max(5, commission)),
    verified: false,
    registeredAt: 'Just now',
    operatingHours: [{ day: 'Mon – Sun', slots: '11:00 – 23:00', closed: false }],
    blurb: input.blurb.trim(),
  }
}

export function enrichRestaurantAdminRecord(restaurant) {
  const categoriesById = Object.fromEntries(foodCategories.map((c) => [c.id, c]))
  const items = menuItems.filter((m) => m.restaurantId === restaurant.id)
  const byCategory = foodCategories
    .map((cat) => ({
      ...cat,
      items: items.filter((m) => m.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0)

  return {
    ...restaurant,
    statusLabel: restaurantStatusMeta[restaurant.status]?.label ?? restaurant.status,
    statusTone: restaurantStatusMeta[restaurant.status]?.tone ?? 'muted',
    menuByCategory: byCategory,
    menuItemCount: items.length,
    unavailableCount: items.filter((m) => !m.available).length,
    categoriesById,
  }
}

export function buildRestaurantModuleStats(restaurantList) {
  const filterCounts = Object.fromEntries(
    restaurantFilterBuckets.map((b) => [
      b.id,
      restaurantList.filter((r) => restaurantMatchesBucket(r, b.id)).length,
    ]),
  )

  const totalMenuItems = restaurantList.reduce((sum, r) => sum + (r.menuItemCount ?? 0), 0)

  const metrics = [
    {
      id: 'store',
      label: 'Total listed',
      value: String(filterCounts.all),
      change: `${totalMenuItems} menu items`,
      accent: 'sage',
    },
    {
      id: 'active',
      label: 'Active',
      value: String(filterCounts.active),
      change: `${Math.round((filterCounts.active / Math.max(filterCounts.all, 1)) * 100)}% live`,
      accent: 'copper',
    },
    {
      id: 'approval',
      label: 'Pending approval',
      value: String(filterCounts.pending_approval),
      change: 'Awaiting review',
      accent: 'gold',
    },
    {
      id: 'verification',
      label: 'Verification',
      value: String(filterCounts.verification_pending),
      change: 'Docs pending',
      accent: 'danger',
    },
  ]

  return { filterCounts, metrics }
}

/** Restaurant & menu module — listing + menu grouped by category. */
export function getRestaurantManagementSnapshot() {
  const categoriesById = Object.fromEntries(foodCategories.map((c) => [c.id, c]))

  const filterCounts = Object.fromEntries(
    restaurantFilterBuckets.map((b) => [
      b.id,
      restaurants.filter((r) => restaurantMatchesBucket(r, b.id)).length,
    ]),
  )

  const enriched = restaurants.map((r) => {
    const items = menuItems.filter((m) => m.restaurantId === r.id)
    const byCategory = foodCategories
      .map((cat) => ({
        ...cat,
        items: items.filter((m) => m.categoryId === cat.id),
      }))
      .filter((g) => g.items.length > 0)

    return {
      ...r,
      statusLabel: restaurantStatusMeta[r.status]?.label ?? r.status,
      statusTone: restaurantStatusMeta[r.status]?.tone ?? 'muted',
      menuByCategory: byCategory,
      menuItemCount: items.length,
      unavailableCount: items.filter((m) => !m.available).length,
      categoriesById,
    }
  })

  const metrics = [
    {
      id: 'store',
      label: 'Total listed',
      value: String(filterCounts.all),
      change: `${menuItems.length} menu items`,
      accent: 'sage',
    },
    {
      id: 'active',
      label: 'Active',
      value: String(filterCounts.active),
      change: `${Math.round((filterCounts.active / Math.max(filterCounts.all, 1)) * 100)}% live`,
      accent: 'copper',
    },
    {
      id: 'approval',
      label: 'Pending approval',
      value: String(filterCounts.pending_approval),
      change: 'Awaiting review',
      accent: 'gold',
    },
    {
      id: 'verification',
      label: 'Verification',
      value: String(filterCounts.verification_pending),
      change: 'Docs pending',
      accent: 'danger',
    },
  ]

  return {
    filters: restaurantFilterBuckets,
    filterCounts,
    metrics,
    categories: foodCategories,
    restaurants: enriched,
  }
}
