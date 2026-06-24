import type { CustomizerIngredient } from '@/lib/layerConfig'

import { AnimatedNumber } from './AnimatedNumber'

interface SummaryTotalsProps {
  prepTime: number
  subtotal: number
  missingRequired: CustomizerIngredient[]
  buttonText: string
  onAddToCart: () => void
}

export function SummaryTotals({
  prepTime,
  subtotal,
  missingRequired,
  buttonText,
  onAddToCart,
}: SummaryTotalsProps) {
  const hasMissingRequired = missingRequired.length > 0

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-2 flex items-center justify-between text-gray-600">
        <span className="text-sm font-bold">Prep Time</span>
        <span className="text-sm font-black">
          <AnimatedNumber value={prepTime} suffix=" mins" />
        </span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-black text-muncherz-black">Subtotal</span>
        <span className="text-2xl font-black text-muncherz-red">
          <AnimatedNumber value={subtotal} prefix="PKR " />
        </span>
      </div>

      <button
        onClick={onAddToCart}
        disabled={hasMissingRequired}
        className="w-full rounded-xl bg-muncherz-red py-4 text-center text-lg font-black text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {hasMissingRequired ? 'Add Required Items First' : buttonText}
      </button>

      {hasMissingRequired && (
        <div className="mt-3 text-center text-xs font-bold text-muncherz-red">
          Still needed: {missingRequired.map((ingredient) => ingredient.name).join(', ')}
        </div>
      )}
    </div>
  )
}

