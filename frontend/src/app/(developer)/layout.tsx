export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#D62828]">Muncherz</h1>
          <p className="text-xs text-gray-500">Developer Panel</p>
        </div>
        <a href="/developer/dashboard" className="text-sm text-gray-600">
          Dashboard
        </a>
      </header>
      <main className="p-8">{children}</main>
    </div>
  )
}
