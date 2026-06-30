import { RegisterClient } from './RegisterClient'

export const metadata = { title: 'Register | Muncherz' }

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-muncherz-white flex items-center justify-center p-4">
      <RegisterClient />
    </main>
  )
}