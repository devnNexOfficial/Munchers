import { PhoneOtpForm } from '@/components/auth/PhoneOtpForm'

export const metadata = { title: 'Login | Muncherz' }

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-muncherz-white flex items-center justify-center p-4">
      <PhoneOtpForm />
    </main>
  )
}
