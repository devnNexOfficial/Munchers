'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { IngredientStockRow, RestockNotificationCount, StockStatus, stockUpdateSchema } from './types';
import RestockNotificationBadge from './RestockNotificationBadge';

interface InventoryRowProps {
  ingredient: IngredientStockRow;
  notifications?: RestockNotificationCount;
  onUpdate: (id: string, updates: Partial<IngredientStockRow>) => Promise<void>;
}

export default function InventoryRow({ ingredient, notifications, onUpdate }: InventoryRowProps) {
  const [stockCount, setStockCount] = useState<string>(ingredient.stock_count === null ? '' : ingredient.stock_count.toString());
  const [alertThreshold, setAlertThreshold] = useState<string>(ingredient.low_stock_alert.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingAvailabilityUpdate, setPendingAvailabilityUpdate] = useState<boolean | null>(null);

  // Sync state if props change from Realtime
  useEffect(() => {
    setStockCount(ingredient.stock_count === null ? '' : ingredient.stock_count.toString());
    setAlertThreshold(ingredient.low_stock_alert.toString());
  }, [ingredient.stock_count, ingredient.low_stock_alert]);

  const getStatus = (): StockStatus => {
    if (ingredient.stock_count === 0 || !ingredient.is_available) return 'out_of_stock';
    if (ingredient.stock_count === null) return 'unlimited';
    if (ingredient.stock_count <= ingredient.low_stock_alert) return 'low_stock';
    return 'in_stock';
  };

  const status = getStatus();

  const handleStockBlur = async () => {
    const parsedStock = stockCount.trim() === '' ? null : parseInt(stockCount);
    if (parsedStock === ingredient.stock_count) return;

    try {
      stockUpdateSchema.parse({ stock_count: parsedStock, low_stock_alert: parseInt(alertThreshold) || 0 });
      setError(null);
      setIsUpdating(true);
      
      const updates: Partial<IngredientStockRow> = { stock_count: parsedStock };
      
      // If setting to 0, automatically set is_available = false
      if (parsedStock === 0) {
        updates.is_available = false;
      } 
      // If setting > 0 AND it was unavailable, prompt
      else if (parsedStock !== null && parsedStock > 0 && !ingredient.is_available) {
        setShowPrompt(true);
        setIsUpdating(false);
        return; // wait for prompt
      }

      await onUpdate(ingredient.id, updates);
    } catch (e) {
      if (e instanceof z.ZodError) setError('Invalid stock value');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAlertBlur = async () => {
    const parsedAlert = parseInt(alertThreshold);
    if (isNaN(parsedAlert) || parsedAlert === ingredient.low_stock_alert) return;

    try {
      stockUpdateSchema.parse({ stock_count: ingredient.stock_count, low_stock_alert: parsedAlert });
      setError(null);
      setIsUpdating(true);
      await onUpdate(ingredient.id, { low_stock_alert: parsedAlert });
    } catch (e) {
      if (e instanceof z.ZodError) setError('Invalid alert threshold');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAvailability = async () => {
    if (!ingredient.is_available) {
      setShowPrompt(true);
    } else {
      setIsUpdating(true);
      await onUpdate(ingredient.id, { is_available: false });
      setIsUpdating(false);
    }
  };

  const confirmAvailabilityToggle = async (markAvailable: boolean) => {
    setShowPrompt(false);
    setIsUpdating(true);
    try {
      const parsedStock = stockCount.trim() === '' ? null : parseInt(stockCount);
      const updates: Partial<IngredientStockRow> = { 
        stock_count: parsedStock,
        is_available: markAvailable 
      };
      await onUpdate(ingredient.id, updates);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="p-4">
          <div className="font-medium text-gray-900">{ingredient.name}</div>
          <div className="text-xs text-gray-500 capitalize">{ingredient.category}</div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={stockCount} 
              onChange={e => setStockCount(e.target.value)}
              onBlur={handleStockBlur}
              placeholder="Unlimited"
              disabled={isUpdating}
              className="w-24 border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828] focus:border-[#D62828]"
            />
            {error && <span className="text-xs text-[#EF4444]">{error}</span>}
          </div>
        </td>
        <td className="p-4">
          <input 
            type="number" 
            value={alertThreshold} 
            onChange={e => setAlertThreshold(e.target.value)}
            onBlur={handleAlertBlur}
            disabled={isUpdating}
            className="w-20 border border-gray-300 rounded p-1.5 text-sm focus:ring-[#D62828] focus:border-[#D62828]"
          />
        </td>
        <td className="p-4">
          <div className="flex items-center">
            {status === 'in_stock' && <span className="px-2 py-1 bg-green-100 text-[#22C55E] text-xs font-bold uppercase rounded">In Stock</span>}
            {status === 'low_stock' && <span className="px-2 py-1 bg-yellow-100 text-[#F59E0B] text-xs font-bold uppercase rounded">Low Stock</span>}
            {status === 'out_of_stock' && <span className="px-2 py-1 bg-red-100 text-[#EF4444] text-xs font-bold uppercase rounded">Out of Stock</span>}
            {status === 'unlimited' && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded">Unlimited</span>}
            <RestockNotificationBadge data={notifications} />
          </div>
        </td>
        <td className="p-4 text-xs text-gray-400">
          {new Date(ingredient.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </td>
        <td className="p-4 text-right">
          <button 
            onClick={toggleAvailability}
            disabled={isUpdating}
            className={`text-sm font-bold ${ingredient.is_available ? 'text-gray-500 hover:text-gray-900' : 'text-[#22C55E] hover:text-green-700'}`}
          >
            {ingredient.is_available ? 'Mark Out of Stock' : 'Mark Available'}
          </button>
        </td>
      </tr>

      {showPrompt && (
        <tr>
          <td colSpan={6} className="bg-yellow-50 p-4 border-b border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Mark ingredient as available again?</p>
                <p className="text-xs text-gray-600 mt-1">This will trigger automated restock notifications to waiting users.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => confirmAvailabilityToggle(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  No, keep it out of stock
                </button>
                <button onClick={() => confirmAvailabilityToggle(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-[#D62828] rounded hover:bg-red-700">
                  Yes, mark available
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
