import { RestaurantLoginForm } from '@/components/auth/RestaurantLoginForm'

export const metadata = { title: 'Restaurant Login | Muncherz' }

export default function RestaurantLoginPage() {
  return (
    <main className="min-h-screen bg-muncherz-white flex items-center justify-center p-4">
      <RestaurantLoginForm />
    </main>
  )
}
