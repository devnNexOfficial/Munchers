interface IngredientStepDotsProps {
  currentStep: number
  totalSteps: number
}

export function IngredientStepDots({ currentStep, totalSteps }: IngredientStepDotsProps) {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pb-6 pt-10">
      <div className="flex justify-center gap-2" role="tablist" aria-label="Customizer steps">
        {Array.from({ length: totalSteps }).map((_, stepIndex) => (
          <div
            key={stepIndex}
            role="tab"
            aria-selected={stepIndex === currentStep}
            className={`h-2 rounded-full transition-all duration-300 ${
              stepIndex === currentStep ? 'w-6 bg-muncherz-red' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

