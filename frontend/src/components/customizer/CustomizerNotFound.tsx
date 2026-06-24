interface CustomizerNotFoundProps {
  onBackToMenu: () => void
}

export function CustomizerNotFound({ onBackToMenu }: CustomizerNotFoundProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-muncherz-black text-white">
      <p className="text-lg font-black">Item not found ??</p>
      <button
        onClick={onBackToMenu}
        className="rounded-xl bg-muncherz-red px-6 py-3 text-sm font-black"
      >
        Back to Menu
      </button>
    </div>
  )
}


