'use client'

import { Award } from 'lucide-react'

type RestaurantSettings = { loyalty_enabled: boolean; loyalty_stamp_count: number; loyalty_reward_item: string }

export function LoyaltySection({ stamps, settings }: { stamps: number; settings: RestaurantSettings }) {
  const target = settings.loyalty_stamp_count || 10
  const progress = Math.min(stamps, target)
  
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-muncherz-black to-gray-900 p-6 text-white shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-muncherz-yellow" />
          <h3 className="font-black">Loyalty Rewards</h3>
        </div>
        <span className="text-xl font-black text-muncherz-yellow">{progress}/{target}</span>
      </div>
      
      <div className="mb-3 grid grid-cols-5 gap-2">
        {Array.from({ length: target }).map((_, i) => (
          <div key={i} className={`aspect-square rounded-full flex items-center justify-center ${i < progress ? 'bg-muncherz-yellow text-black' : 'bg-white/10'}`}>
            {i < progress && <span className="font-black text-xs">✓</span>}
          </div>
        ))}
      </div>
      
      <p className="text-sm font-medium text-gray-300">
        Collect {target} stamps to get free <span className="font-bold text-white">{settings.loyalty_reward_item || 'meal'}</span>
      </p>
    </section>
  )
}
