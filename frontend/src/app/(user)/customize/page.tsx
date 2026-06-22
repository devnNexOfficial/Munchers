import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CustomizerPageClient } from '@/components/customizer/CustomizerPageClient'

export const metadata: Metadata = {
  title: 'Customize | Muncherz',
}

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string }>
}) {
  const resolvedParams = await searchParams
  const itemId = resolvedParams.itemId

  if (!itemId) {
    redirect('/')
  }

  return <CustomizerPageClient itemId={itemId} />
}
