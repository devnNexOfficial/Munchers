import { IngredientStockRow, RestockNotificationCount } from './types';
import InventoryList from './InventoryList';

// Mock server fetch
async function fetchInventoryData() {
  // Replace with actual Supabase client and queries
  // 1. Fetch ingredients
  // 2. Fetch restock_notifications grouped by ingredient_id
  
  return {
    ingredients: [] as IngredientStockRow[],
    notifications: [] as RestockNotificationCount[],
  };
}

export const metadata = {
  title: 'Inventory Control | Muncherz',
};

export default async function InventoryPage() {
  const { ingredients, notifications } = await fetchInventoryData();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Control</h1>
          <p className="text-sm text-gray-500">Manage stock levels, availability, and restock alerts</p>
        </div>

        <InventoryList 
          initialIngredients={ingredients} 
          initialNotifications={notifications} 
        />
      </div>
    </div>
  );
}
