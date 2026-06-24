import { motion } from 'framer-motion'

import type { CustomizerIngredient } from '@/lib/layerConfig'

import { BurgerCanvas } from './BurgerCanvas'
import { IngredientPanel } from './IngredientPanel'
import { SummaryList } from './SummaryList'

interface CustomizerLayoutProps {
  ingredients: CustomizerIngredient[]
  currentIngredients: CustomizerIngredient[]
  title: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
  basePrice: number
  basePrepTime: number
  onExit: () => void
  onSaveToCart: () => void
  buttonText: string
}

export function CustomizerLayout({
  ingredients,
  currentIngredients,
  title,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext,
  basePrice,
  basePrepTime,
  onExit,
  onSaveToCart,
  buttonText,
}: CustomizerLayoutProps) {
  return (
    <motion.div
      key="customizer-layout"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen w-full flex-row overflow-hidden bg-[#0A0A0A]"
    >
      <div className="w-1/4 h-full border-r">
        <IngredientPanel
          ingredients={currentIngredients}
          title={title}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={onNext}
          onBack={onBack}
          canGoNext={canGoNext}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <BurgerCanvas ingredients={ingredients} />
        <button
          onClick={onExit}
          className="absolute top-4 left-4 z-50 rounded bg-white px-4 py-2 text-sm font-bold text-black"
        >
          Exit Customizer
        </button>
      </div>

      <div className="w-1/4 h-full border-l">
        <SummaryList
          ingredients={ingredients}
          basePrice={basePrice}
          basePrepTime={basePrepTime}
          onAddToCart={onSaveToCart}
          buttonText={buttonText}
        />
      </div>
    </motion.div>
  )
}

