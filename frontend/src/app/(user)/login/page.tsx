import { LoginClient } from './LoginClient'

export const metadata = { title: 'Login | Muncherz' }

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4">
      <LoginClient />
    </main>
  )
}
