'use client'

import type { Dispatch, SetStateAction } from 'react'
import { MapPin, Plus } from 'lucide-react'

type Address = { id: string; label: string; address_text: string; is_default: boolean }

export function AddressesSection({ addresses, setAddresses }: { addresses: Address[]; setAddresses: Dispatch<SetStateAction<Address[]>> }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-muncherz-black">Saved Addresses</h3>
        <button className="flex items-center gap-1 text-sm font-bold text-muncherz-red hover:underline">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>
      
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No saved addresses
          </div>
        ) : (
          addresses.map((addr: Address) => (
            <div key={addr.id} className="flex items-start justify-between rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.label || 'Address'}</span>
                    {addr.is_default && (
                      <span className="rounded bg-muncherz-yellow/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-yellow-800">Default</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{addr.address_text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
