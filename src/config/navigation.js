export const navSections = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard & analytics', end: true },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { to: '/orders', label: 'Order management' },
      { to: '/restaurants', label: 'Restaurants & menu' },
      { to: '/delivery-partners', label: 'Delivery partners' },
      { to: '/customers', label: 'Customer management' },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { to: '/payments', label: 'Payments & finance' },
      { to: '/offers', label: 'Offers & promotions' },
      { to: '/support', label: 'Support & reports' },
      { to: '/settings', label: 'Settings' },
    ],
  },
]

export function findNavItem(pathname) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.end ? pathname === item.to : pathname.startsWith(item.to)) {
        return item
      }
    }
  }
  return { label: 'Admin' }
}
