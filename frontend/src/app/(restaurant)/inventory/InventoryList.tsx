'use client';

import { useState, useEffect } from 'react';
import { IngredientStockRow, RestockNotificationCount } from './types';
import InventoryRow from './InventoryRow';
import LowStockBanner from './LowStockBanner';

// Mock Supabase
// import { supabase } from '@/lib/supabase';

interface InventoryListProps {
  initialIngredients: IngredientStockRow[];
  initialNotifications: RestockNotificationCount[];
}

export default function InventoryList({ initialIngredients, initialNotifications }: InventoryListProps) {
  const [ingredients, setIngredients] = useState<IngredientStockRow[]>(initialIngredients);
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sort, setSort] = useState<'name' | 'stock_asc' | 'category'>('name');

  useEffect(() => {
    // Supabase Realtime Subscription on ingredients table
    // let channel: unknown;
    // if (typeof supabase !== 'undefined') {
    //   channel = supabase
    //     .channel('inventory-sync')
    //     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients' }, (payload) => {
    //       const updated = payload.new as IngredientStockRow;
    //       setIngredients(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    //     })
    //     .subscribe();
    // }
    return () => {
      // if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdate = async (id: string, updates: Partial<IngredientStockRow>) => {
    // Optimistic UI update
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i));
    
    // API / Supabase update call
    try {
      await fetch(`/api/restaurant/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // Revert optimistic update on failure (omitted for brevity, assume success or reload in real app)
    }
  };

  const lowStockIngredients = ingredients.filter(i => i.stock_count !== null && i.stock_count <= i.low_stock_alert && i.stock_count > 0 && i.is_available);

  const getFilteredAndSorted = () => {
    let filtered = ingredients;
    if (filter === 'in_stock') {
      filtered = filtered.filter(i => (i.stock_count === null || i.stock_count > i.low_stock_alert) && i.is_available);
    } else if (filter === 'low_stock') {
      filtered = filtered.filter(i => i.stock_count !== null && i.stock_count <= i.low_stock_alert && i.stock_count > 0 && i.is_available);
    } else if (filter === 'out_of_stock') {
      filtered = filtered.filter(i => i.stock_count === 0 || !i.is_available);
    }

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'category') return a.category.localeCompare(b.category);
      if (sort === 'stock_asc') {
        const valA = a.stock_count === null ? Infinity : a.stock_count;
        const valB = b.stock_count === null ? Infinity : b.stock_count;
        return valA - valB;
      }
      return 0;
    });
  };

  return (
    <div>
      <LowStockBanner lowStockIngredients={lowStockIngredients} />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'in_stock', 'low_stock', 'out_of_stock'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sort by:</label>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value as any)}
            className="border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828] focus:border-[#D62828]"
          >
            <option value="name">Name (A-Z)</option>
            <option value="category">Category</option>
            <option value="stock_asc">Stock (Low to High)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-bold text-gray-700">Ingredient</th>
              <th className="p-4 text-sm font-bold text-gray-700">Stock Count</th>
              <th className="p-4 text-sm font-bold text-gray-700">Alert Threshold</th>
              <th className="p-4 text-sm font-bold text-gray-700">Status</th>
              <th className="p-4 text-sm font-bold text-gray-700">Last Updated</th>
              <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAndSorted().map(ing => (
              <InventoryRow 
                key={ing.id} 
                ingredient={ing} 
                notifications={initialNotifications.find(n => n.ingredient_id === ing.id)} 
                onUpdate={handleUpdate} 
              />
            ))}
            {getFilteredAndSorted().length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No ingredients found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
