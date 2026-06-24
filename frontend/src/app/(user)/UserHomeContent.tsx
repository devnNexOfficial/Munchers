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
    <div className="p-6 max-w-lg mx-auto text-center mt-20">
      <h1 className="text-4xl font-black text-[#D62828] mb-4">Muncherz</h1>
      <p className="text-gray-600 mb-8">Welcome to the best burgers in town.</p>

      {tableNumber && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-8 font-bold inline-block">
          Dine-in — Table {tableNumber}
        </div>
      )}

      <div className="space-y-4">
        <button className="w-full bg-[#0A0A0A] text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors">
          View Menu
        </button>
      </div>
    </div>
  );
}
