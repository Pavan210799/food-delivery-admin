/** Seed data for modules 4–8. Shared entities (orders, customers, partners, kitchens) come from platformData. */

import { isoDateOffset } from '../lib/format.js'

/* ── Delivery partners ─────────────────────────────────────────── */

export const partnerStatusMeta = {
  active: { label: 'Active', tone: 'sage' },
  pending_verification: { label: 'Verification', tone: 'gold' },
  suspended: { label: 'Suspended', tone: 'danger' },
}

export const documentStatusMeta = {
  verified: { label: 'Verified', tone: 'sage' },
  pending: { label: 'Pending review', tone: 'gold' },
  rejected: { label: 'Rejected', tone: 'danger' },
}

export const partnerFilterBuckets = [
  { id: 'all', label: 'All partners' },
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
  { id: 'pending_verification', label: 'Verification' },
  { id: 'suspended', label: 'Suspended' },
]

export const partnerZones = ['North', 'Central', 'East', 'South']
export const partnerVehicles = ['E-bike', 'Scooter', 'Car', 'Bicycle']
export const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const PARTNER_PAY_PER_DELIVERY = 6.5

/* ── Customers ─────────────────────────────────────────────────── */

export const customerStatusMeta = {
  active: { label: 'Active', tone: 'sage' },
  blocked: { label: 'Blocked', tone: 'danger' },
}

export const customerFilterBuckets = [
  { id: 'all', label: 'All customers' },
  { id: 'active', label: 'Active' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'complaints', label: 'Open complaints' },
  { id: 'refunds', label: 'Refund history' },
]

export const customerProfiles = {
  c1: {
    phone: '+1 212 555 0101', joinedAt: '2023-02-11', tier: 'Gold', lifetimeSpend: 1184,
    addresses: [
      { id: 'a1', label: 'Home', line: '88 East 7th Street, East Village, NY 10003' },
      { id: 'a2', label: 'Work', line: '230 Park Avenue, Floor 12, NY 10169' },
    ],
    reviews: [
      { id: 'r1', restaurant: 'Saffron Atelier', rating: 5, text: 'The butter chicken is unreal. Arrived piping hot.', date: '2026-10-21' },
      { id: 'r2', restaurant: 'Nopal & Salt', rating: 4, text: 'Great tacos, salsa could be spicier.', date: '2026-10-09' },
    ],
    complaints: [],
  },
  c2: {
    phone: '+1 646 555 0102', joinedAt: '2024-04-03', tier: 'Silver', lifetimeSpend: 386,
    addresses: [{ id: 'a1', label: 'Home', line: '21 Bedford Street, West Village, NY 10014' }],
    reviews: [{ id: 'r1', restaurant: 'Casa Luna', rating: 2, text: 'Burrata was missing from my order.', date: '2026-10-27' }],
    complaints: [
      { id: 'cp1', subject: 'Missing item — burrata', orderId: 'ML-8810', status: 'open', date: '2026-10-27' },
      { id: 'cp2', subject: 'Order cancelled without notice', orderId: 'ML-8765', status: 'resolved', date: '2026-10-26' },
    ],
  },
  c3: {
    phone: '+1 718 555 0103', joinedAt: '2022-11-28', tier: 'Platinum', lifetimeSpend: 1642,
    addresses: [
      { id: 'a1', label: 'Home', line: '40 Spring Street, Nolita, NY 10012' },
      { id: 'a2', label: 'Parents', line: '190 Court Street, Cobble Hill, NY 11201' },
    ],
    reviews: [
      { id: 'r1', restaurant: 'Koi & Cedar', rating: 5, text: 'Best nigiri in the city, packaging was perfect.', date: '2026-10-24' },
      { id: 'r2', restaurant: 'Verde Room', rating: 5, text: 'Lamb kofta was incredible.', date: '2026-10-26' },
    ],
    complaints: [],
  },
  c4: {
    phone: '+1 917 555 0104', joinedAt: '2025-01-19', tier: 'Bronze', lifetimeSpend: 412,
    addresses: [{ id: 'a1', label: 'Home', line: '14 Hudson Street, Tribeca, NY 10013' }],
    reviews: [],
    complaints: [{ id: 'cp1', subject: 'Late delivery — 25 min over ETA', orderId: 'ML-8740', status: 'open', date: '2026-10-27' }],
  },
  c5: {
    phone: '+1 347 555 0105', joinedAt: '2024-07-30', tier: 'Silver', lifetimeSpend: 598,
    addresses: [{ id: 'a1', label: 'Home', line: '310 Bedford Avenue, Williamsburg, NY 11249' }],
    reviews: [{ id: 'r1', restaurant: 'Ember & Rye', rating: 4, text: 'Ribeye cooked perfectly.', date: '2026-10-18' }],
    complaints: [],
  },
  c6: {
    phone: '+1 212 555 0106', joinedAt: '2022-06-14', tier: 'Platinum', lifetimeSpend: 2318,
    addresses: [
      { id: 'a1', label: 'Home', line: '75 Wall Street, Apt 21C, NY 10005' },
      { id: 'a2', label: 'Gym', line: '1 Little West 12th Street, NY 10014' },
    ],
    reviews: [{ id: 'r1', restaurant: 'Saffron Atelier', rating: 5, text: 'Consistently excellent.', date: '2026-10-22' }],
    complaints: [{ id: 'cp1', subject: 'Charged twice for one order', orderId: 'ML-8716', status: 'open', date: '2026-10-26' }],
  },
  c7: {
    phone: '+1 646 555 0107', joinedAt: '2023-09-05', tier: 'Gold', lifetimeSpend: 764,
    addresses: [{ id: 'a1', label: 'Home', line: '520 West 43rd Street, Hell’s Kitchen, NY 10036' }],
    reviews: [],
    complaints: [],
  },
  c8: {
    phone: '+1 718 555 0108', joinedAt: '2025-08-22', tier: 'Bronze', lifetimeSpend: 211, status: 'blocked',
    blockReason: 'Repeated chargeback disputes',
    addresses: [{ id: 'a1', label: 'Home', line: '44 Jay Street, DUMBO, NY 11201' }],
    reviews: [{ id: 'r1', restaurant: 'Casa Luna', rating: 1, text: 'Never arrived.', date: '2026-09-30' }],
    complaints: [],
  },
}

/* ── Payments & finance ────────────────────────────────────────── */

export const SALES_TAX_RATE = 8.875
export const SETTLEMENT_CYCLE = 'Oct 20 – Oct 26'

export const transactionStatusMeta = {
  success: { label: 'Paid', tone: 'sage' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'gold' },
  voided: { label: 'Voided', tone: 'muted' },
}

export const transactionFilterBuckets = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'voided', label: 'Voided' },
]

export const failedPaymentsSeed = [
  { id: 'TX-90412', orderId: 'ML-8851', customerId: 'c5', restaurantId: 'koi-cedar', amount: 58, method: 'Card', reason: 'Card declined by issuer', at: 'Today, 10:41' },
  { id: 'TX-90407', orderId: 'ML-8849', customerId: 'c7', restaurantId: 'ember-rye', amount: 84, method: 'Apple Pay', reason: 'Authentication failed', at: 'Today, 10:12' },
  { id: 'TX-90388', orderId: 'ML-8846', customerId: 'c8', restaurantId: 'casa-luna', amount: 33, method: 'Card', reason: 'Insufficient funds', at: 'Today, 09:20' },
  { id: 'TX-90361', orderId: 'ML-8843', customerId: 'c6', restaurantId: 'saffron-atelier', amount: 61, method: 'Wallet', reason: 'Bank network timeout', at: 'Yesterday, 21:48' },
]

/* ── Offers & promotions ───────────────────────────────────────── */

export const offerTypeMeta = {
  percent: { label: 'Percent off' },
  flat: { label: 'Flat discount' },
  free_delivery: { label: 'Free delivery' },
}

export const offerStatusMeta = {
  active: { label: 'Active', tone: 'sage' },
  scheduled: { label: 'Scheduled', tone: 'gold' },
  paused: { label: 'Paused', tone: 'muted' },
  expired: { label: 'Expired', tone: 'danger' },
}

export const offerFilterBuckets = [
  { id: 'all', label: 'All offers' },
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'paused', label: 'Paused' },
  { id: 'expired', label: 'Expired' },
]

export const offerAudiences = ['All customers', 'New customers', 'Gold & Platinum', 'Lapsed 30+ days']

const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=70`

export const promoCovers = [
  { id: 'feast', label: 'Feast', url: unsplash('photo-1414235077428-338989a2e8c0') },
  { id: 'burger', label: 'Burgers', url: unsplash('photo-1568901346375-23c9450c58cd') },
  { id: 'pizza', label: 'Pizza', url: unsplash('photo-1513104890138-7c749659a591') },
  { id: 'sushi', label: 'Sushi', url: unsplash('photo-1579871494447-9811cf80d66c') },
  { id: 'steak', label: 'Grill', url: unsplash('photo-1600891964092-4316c288032e') },
  { id: 'curry', label: 'Curry', url: unsplash('photo-1585937421612-70a008356fbe') },
  { id: 'salad', label: 'Healthy', url: unsplash('photo-1512621776951-a57141f2eefd') },
  { id: 'tacos', label: 'Tacos', url: unsplash('photo-1565299585323-38d6b0865b47') },
]

export const defaultCoverByType = { percent: 'feast', flat: 'steak', free_delivery: 'burger' }

export const offersSeed = [
  {
    id: 'of-1', code: 'WELCOME20', cover: 'feast', title: 'Welcome to Marlow', type: 'percent', value: 20, minOrder: 25,
    usageLimit: 2000, perUserLimit: 1, used: 512, startDate: isoDateOffset(-20), expiryDate: isoDateOffset(5),
    audience: 'New customers', paused: false, discountGiven: 3584, redemptionsWeek: [58, 71, 64, 80, 92, 104, 43],
  },
  {
    id: 'of-2', code: 'FREESHIP', cover: 'burger', title: 'Free delivery weekdays', type: 'free_delivery', value: 0, minOrder: 20,
    usageLimit: null, perUserLimit: 5, used: 891, startDate: isoDateOffset(-30), expiryDate: isoDateOffset(12),
    audience: 'All customers', paused: false, discountGiven: 2664, redemptionsWeek: [131, 124, 138, 142, 119, 96, 141],
  },
  {
    id: 'of-3', code: 'EMBER10', cover: 'steak', title: '$10 off Ember & Rye', type: 'flat', value: 10, minOrder: 50,
    usageLimit: 500, perUserLimit: 2, used: 214, startDate: isoDateOffset(-10), expiryDate: isoDateOffset(20),
    audience: 'All customers', paused: false, discountGiven: 2140, redemptionsWeek: [24, 31, 28, 35, 41, 38, 17],
  },
  {
    id: 'of-4', code: 'COMEBACK15', cover: 'curry', title: 'We miss you', type: 'percent', value: 15, minOrder: 30,
    usageLimit: 800, perUserLimit: 1, used: 96, startDate: isoDateOffset(-6), expiryDate: isoDateOffset(24),
    audience: 'Lapsed 30+ days', paused: true, discountGiven: 518, redemptionsWeek: [14, 18, 12, 21, 16, 15, 0],
  },
  {
    id: 'of-5', code: 'HOLIDAY25', cover: 'pizza', title: 'Holiday feast', type: 'percent', value: 25, minOrder: 60,
    usageLimit: 1500, perUserLimit: 1, used: 0, startDate: isoDateOffset(28), expiryDate: isoDateOffset(60),
    audience: 'All customers', paused: false, discountGiven: 0, redemptionsWeek: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'of-6', code: 'SUMMERSUSHI', cover: 'sushi', title: 'Summer sushi week', type: 'flat', value: 8, minOrder: 40,
    usageLimit: 600, perUserLimit: 2, used: 600, startDate: isoDateOffset(-90), expiryDate: isoDateOffset(-40),
    audience: 'Gold & Platinum', paused: false, discountGiven: 4800, redemptionsWeek: [0, 0, 0, 0, 0, 0, 0],
  },
]

export const referralDefaults = {
  enabled: true,
  referrerReward: 10,
  refereeReward: 15,
  minFirstOrder: 25,
  invitesSent: 3842,
  signups: 1206,
  firstOrders: 874,
}

/* ── Support & reports ─────────────────────────────────────────── */

export const ticketStatusMeta = {
  open: { label: 'Open', tone: 'gold' },
  in_progress: { label: 'In progress', tone: 'copper' },
  resolved: { label: 'Resolved', tone: 'sage' },
}

export const ticketPriorityMeta = {
  low: { label: 'Low', tone: 'muted' },
  medium: { label: 'Medium', tone: 'gold' },
  high: { label: 'High', tone: 'copper' },
  urgent: { label: 'Urgent', tone: 'danger' },
}

export const ticketFilterBuckets = [
  { id: 'all', label: 'All tickets' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
]

export const ticketsSeed = [
  {
    id: 'TK-1051', subject: 'Missing burrata from order', customerId: 'c2', orderId: 'ML-8810', priority: 'high',
    status: 'open', channel: 'In-app chat', createdAt: 'Today, 10:18',
    messages: [
      { id: 'm1', from: 'customer', text: 'My Casa Luna order arrived without the burrata. Could I get a refund for it?', at: '10:18' },
    ],
  },
  {
    id: 'TK-1050', subject: 'Charged twice for one order', customerId: 'c6', orderId: 'ML-8716', priority: 'urgent',
    status: 'in_progress', channel: 'Email', createdAt: 'Yesterday, 22:04',
    messages: [
      { id: 'm1', from: 'customer', text: 'I see two charges of $61 on my card for the same Saffron Atelier order.', at: '22:04' },
      { id: 'm2', from: 'agent', text: 'Thanks Vikram — we have escalated this to the payments team and will update you shortly.', at: '22:31' },
    ],
  },
  {
    id: 'TK-1049', subject: 'Driver could not find building', customerId: 'c4', orderId: 'ML-8740', priority: 'medium',
    status: 'open', channel: 'Phone', createdAt: 'Today, 09:55',
    messages: [{ id: 'm1', from: 'customer', text: 'The courier circled the block twice. Food was cold when it arrived.', at: '09:55' }],
  },
  {
    id: 'TK-1047', subject: 'Update delivery address on account', customerId: 'c7', orderId: null, priority: 'low',
    status: 'open', channel: 'In-app chat', createdAt: 'Yesterday, 16:22',
    messages: [{ id: 'm1', from: 'customer', text: 'I moved apartments — how do I change my default address?', at: '16:22' }],
  },
  {
    id: 'TK-1042', subject: 'Promo code not applying', customerId: 'c1', orderId: null, priority: 'medium',
    status: 'resolved', channel: 'In-app chat', createdAt: 'Oct 25, 20:40',
    messages: [
      { id: 'm1', from: 'customer', text: 'WELCOME20 says invalid at checkout.', at: '20:40' },
      { id: 'm2', from: 'agent', text: 'WELCOME20 is for first orders only — we have added a $5 credit to your wallet instead.', at: '21:10' },
    ],
  },
]

export const disputeStatusMeta = {
  open: { label: 'Open', tone: 'gold' },
  refunded: { label: 'Refunded', tone: 'sage' },
  partial: { label: 'Partial refund', tone: 'copper' },
  rejected: { label: 'Rejected', tone: 'muted' },
}

export const disputesSeed = [
  {
    id: 'DP-311', orderId: 'ML-8716', customerId: 'c6', against: 'Payments', amount: 61, status: 'open',
    claim: 'Duplicate card charge for a single order.', evidence: 'Gateway shows two captures 4 seconds apart.', openedAt: 'Yesterday, 22:10',
  },
  {
    id: 'DP-309', orderId: 'ML-8810', customerId: 'c2', against: 'Casa Luna', amount: 17, status: 'open',
    claim: 'Burrata & stone fruit missing from delivery.', evidence: 'Kitchen packing photo shows 1 of 2 items.', openedAt: 'Today, 10:20',
  },
  {
    id: 'DP-305', orderId: 'ML-8740', customerId: 'c4', against: 'Courier · Dev P.', amount: 12, status: 'open',
    claim: 'Delivery 25 minutes late; food arrived cold.', evidence: 'GPS trace shows 11-minute idle near drop-off.', openedAt: 'Today, 10:02',
  },
  {
    id: 'DP-298', orderId: 'ML-8765', customerId: 'c2', against: 'Casa Luna', amount: 19, status: 'refunded',
    claim: 'Order cancelled after payment captured.', evidence: 'Kitchen closed early.', openedAt: 'Oct 26, 18:20',
  },
]

export const notificationAudiences = ['All customers', 'All delivery partners', 'All restaurants', 'Gold & Platinum customers']
export const notificationChannels = ['Push', 'Email', 'SMS']

export const notificationsSeed = [
  { id: 'nt-3', title: 'Weekend surge bonus', message: 'Earn 1.5× per delivery Fri–Sun, 6–10pm.', audience: 'All delivery partners', channels: ['Push', 'SMS'], sentAt: '2026-10-25T17:00:00', reach: 214 },
  { id: 'nt-2', title: 'FREESHIP is back', message: 'Free delivery on weekday orders over $20.', audience: 'All customers', channels: ['Push', 'Email'], sentAt: '2026-10-22T11:30:00', reach: 18240 },
  { id: 'nt-1', title: 'Settlement schedule update', message: 'Weekly payouts now land every Tuesday.', audience: 'All restaurants', channels: ['Email'], sentAt: '2026-10-18T09:00:00', reach: 6 },
]

/* ── Settings ──────────────────────────────────────────────────── */

export const platformSettingsDefaults = {
  platformName: 'Marlow',
  supportEmail: 'support@marlow.app',
  supportPhone: '+1 212 555 0100',
  timezone: 'America/New_York',
  maintenanceMode: false,
  restaurantSignups: true,
  partnerAutoAssign: true,
  orderAlerts: true,
}

export const timezones = ['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata']

export const pricingDefaults = {
  baseDeliveryFee: 2.99,
  perMileFee: 0.75,
  smallOrderThreshold: 15,
  smallOrderFee: 2,
  serviceFeePct: 5,
  taxPct: SALES_TAX_RATE,
  surgeMultiplier: 1.2,
  defaultCommissionPct: 15,
}

export const zonesSeed = [
  { id: 'z-north', name: 'North', area: 'Upper West Side · Harlem', radiusMi: 3.5, baseEta: 30, surcharge: 0, active: true },
  { id: 'z-central', name: 'Central', area: 'Midtown · Chelsea · Flatiron', radiusMi: 2.5, baseEta: 25, surcharge: 0, active: true },
  { id: 'z-east', name: 'East', area: 'East Village · LES · Williamsburg', radiusMi: 3, baseEta: 28, surcharge: 1, active: true },
  { id: 'z-south', name: 'South', area: 'Tribeca · FiDi · Brooklyn Heights', radiusMi: 4, baseEta: 35, surcharge: 1.5, active: true },
  { id: 'z-queens', name: 'Queens pilot', area: 'Long Island City · Astoria', radiusMi: 2, baseEta: 40, surcharge: 2.5, active: false },
]

export const permissionList = [
  { id: 'orders', label: 'Orders' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'partners', label: 'Partners' },
  { id: 'customers', label: 'Customers' },
  { id: 'payments', label: 'Payments' },
  { id: 'offers', label: 'Offers' },
  { id: 'support', label: 'Support' },
  { id: 'settings', label: 'Settings' },
]

export const rolesSeed = [
  { id: 'super', name: 'Super admin', description: 'Full access, cannot be restricted', locked: true, permissions: permissionList.map((p) => p.id) },
  { id: 'ops', name: 'Operations', description: 'Day-to-day order and fleet management', locked: false, permissions: ['orders', 'restaurants', 'partners', 'customers', 'support'] },
  { id: 'finance', name: 'Finance', description: 'Payments, settlements, and promotions budget', locked: false, permissions: ['orders', 'payments', 'offers'] },
  { id: 'support', name: 'Support agent', description: 'Tickets, disputes, and customer accounts', locked: false, permissions: ['orders', 'customers', 'support'] },
]

export const adminUsersSeed = [
  { id: 'u1', name: 'Pavan A.', email: 'pavan@marlow.app', roleId: 'super', active: true },
  { id: 'u2', name: 'Meera N.', email: 'meera@marlow.app', roleId: 'ops', active: true },
  { id: 'u3', name: 'Daniel O.', email: 'daniel@marlow.app', roleId: 'finance', active: true },
  { id: 'u4', name: 'Ana R.', email: 'ana@marlow.app', roleId: 'support', active: true },
  { id: 'u5', name: 'Tom B.', email: 'tom@marlow.app', roleId: 'support', active: false },
]
