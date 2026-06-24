import { ChevronLeft, ChevronRight } from 'lucide-react'

interface IngredientPanelHeaderProps {
  title: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
}

export function IngredientPanelHeader({
  title,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  canGoNext,
}: IngredientPanelHeaderProps) {
  const isNextDisabled = currentStep === totalSteps - 1 || !canGoNext

  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        aria-label="Previous step"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <h2 className="text-xl font-black text-muncherz-black">{title}</h2>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="Next step"
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isNextDisabled
            ? 'bg-gray-100 opacity-30 text-gray-700'
            : 'bg-muncherz-red text-white shadow-md'
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

