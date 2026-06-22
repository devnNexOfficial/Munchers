import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CustomizerPageClient } from '@/components/customizer/CustomizerPageClient'

export const metadata: Metadata = {
  title: 'Customize | Muncherz',
}

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<{ itemId?: string; editCartItemId?: string }>
}) {
  const resolvedParams = await searchParams
  const itemId = resolvedParams.itemId
  const editCartItemId = resolvedParams.editCartItemId

  if (!itemId) {
    redirect('/')
  }

  return <CustomizerPageClient itemId={itemId} editCartItemId={editCartItemId} />
}
