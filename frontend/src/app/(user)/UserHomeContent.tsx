'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UserHomeContent() {
  const searchParams = useSearchParams();
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  useEffect(() => {
    // Read ?table= param from URL on home page load
    const table = searchParams.get('table');
    if (table) {
      // Store tableNumber in session/context
      sessionStorage.setItem('muncherz_table_number', table);
      sessionStorage.setItem('muncherz_order_type', 'dine-in');
      setTableNumber(table);

      // Auto-select "Dine-in" order type in checkout
      // Pass tableNumber to order placement
      // TODO: wire to order API — backend Section 13
    } else {
      const existingTable = sessionStorage.getItem('muncherz_table_number');
      if (existingTable) {
        setTableNumber(existingTable);
      }
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen bg-wild-black p-6 max-w-lg mx-auto text-center mt-20">
      {/* Noise texture overlay */}
      <div className="noise-overlay absolute inset-0" />

      <div className="relative z-10">
        <h1 className="font-display text-5xl font-black text-wild-red mb-4 tracking-tight">
          Muncherz
        </h1>
        <p className="font-body text-wild-paper/80 text-lg mb-8">
          Welcome to the best burgers in town.
        </p>

        {tableNumber && (
          <div className="bg-wild-brown border border-wild-rust text-wild-yellow px-6 py-4 rounded-wild-card mb-8 font-bold inline-block shadow-wild-ember">
            <span className="section-label text-wild-red mb-1 block">Dine-in</span>
            Table {tableNumber}
          </div>
        )}

        <div className="space-y-4">
          <button className="w-full bg-wild-red text-wild-paper py-4 rounded-wild-button font-bold text-lg hover:bg-wild-red-light hover:shadow-wild-glow transition-all active:scale-95">
            View Menu
          </button>
        </div>
      </div>
    </div>
  );
}
