import Image from 'next/image'
import { motion } from 'framer-motion'

import type { CustomizerIngredient, IngredientSelection } from '@/lib/layerConfig'
import { formatPKR } from '@/lib/utils/formatCurrency'

interface SummaryListItemProps {
  ingredient: CustomizerIngredient
  selection: IngredientSelection
}

export function SummaryListItem({ ingredient, selection }: SummaryListItemProps) {
  const lineTotal = selection.qty * ingredient.pricePerUnit

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="mb-3 flex items-center justify-between rounded-xl bg-gray-50 p-2 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-white p-1">
          <Image
            src={ingredient.pngImageUrl || '/placeholder.png'}
            alt={ingredient.name}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{ingredient.name}</p>
          <p className="text-xs font-medium text-gray-500">
            x{selection.qty}
            {selection.tier ? ` (${selection.tier})` : ''}
          </p>
        </div>
      </div>
      <div className="text-sm font-black text-muncherz-red">
        {formatPKR(lineTotal)}
      </div>
    </motion.div>
  )
}

