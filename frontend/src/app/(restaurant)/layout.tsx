export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Rustic grain overlay */}
      <div className="fixed inset-0 rustic-grain z-0 pointer-events-none" />
      {/* Sidebar nav */}
      <aside className="w-64 bg-surface-brown border-r border-outline-variant/20 min-h-screen fixed left-0 top-0 z-10">
        <div className="p-6 border-b border-outline-variant/20">
          <h1 className="text-xl font-black text-primary-container uppercase tracking-tighter font-display">
            MUNCHERZ
          </h1>
          <p className="text-label-sm text-on-surface-variant font-label-sm">Restaurant Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: '/restaurant/kds', label: 'Live KDS' },
            { href: '/restaurant/menu', label: 'Menu Manager' },
            { href: '/restaurant/inventory', label: 'Inventory' },
            { href: '/restaurant/orders', label: 'Orders' },
            { href: '/restaurant/analytics', label: 'Analytics' },
            { href: '/restaurant/deals', label: 'Deals' },
            { href: '/restaurant/feedback', label: 'Feedback' },
            { href: '/restaurant/delivery', label: 'Delivery' },
            { href: '/restaurant/settings', label: 'Settings' },
            { href: '/restaurant/staff', label: 'Staff' },
            { href: '/restaurant/riders', label: 'Riders' },
            { href: '/restaurant/qr', label: 'QR Codes' },
            { href: '/restaurant/reports', label: 'Reports' },
            { href: '/restaurant/kitchen-screens', label: 'Kitchen Screens' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-body font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-outline-variant/20">
          <p className="text-label-sm text-on-surface-variant/60">V. 2.4.1 Western Edition</p>
        </div>
      </aside>
      {/* Main content */}
      <main className="ml-64 flex-1 p-8 relative z-10">
        {children}
      </main>
    </div>
  )
}
