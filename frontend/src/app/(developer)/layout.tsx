export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Rustic grain overlay */}
      <div className="fixed inset-0 rustic-grain z-0 pointer-events-none" />
      <aside className="w-64 bg-surface-brown border-r border-outline-variant/20 min-h-screen fixed left-0 top-0 z-10">
        <div className="p-6 border-b border-outline-variant/20">
          <h1 className="text-xl font-black text-primary-container uppercase tracking-tighter font-display">
            MUNCHERZ
          </h1>
          <p className="text-label-sm text-on-surface-variant font-label-sm">Developer Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          <a
            href="/developer/dashboard"
            className="block px-4 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-body font-medium"
          >
            Dashboard
          </a>
          <a
            href="/developer/dashboard/analytics"
            className="block px-4 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-body font-medium"
          >
            Analytics
          </a>
          <a
            href="/developer/dashboard/logs"
            className="block px-4 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-body font-medium"
          >
            System Logs
          </a>
          <a
            href="/developer/dashboard/settings"
            className="block px-4 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-body font-medium"
          >
            Settings
          </a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-outline-variant/20">
          <p className="text-label-sm text-on-surface-variant/60">V. 2.4.1 Western Edition</p>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8 relative z-10">{children}</main>
    </div>
  )
}
