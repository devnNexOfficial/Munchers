export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar nav */}
      <aside className="w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-10">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-[#D62828]">
            Muncherz
          </h1>
          <p className="text-xs text-gray-500">Restaurant Panel</p>
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
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-[#D62828] hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
