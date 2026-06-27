import { DeveloperLoginForm } from '@/components/auth/DeveloperLoginForm'

export const metadata = { title: 'Developer Login | Muncherz' }

export default function DeveloperLoginPage() {
  return (
    <main className="min-h-screen bg-muncherz-white flex items-center justify-center p-4">
      <DeveloperLoginForm />
    </main>
  )
}
