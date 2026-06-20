import { Category, Ingredient, MenuItem, MenuItemIngredient } from './types';
import CategoryTab from './CategoryTab';
import IngredientTab from './IngredientTab';
import MenuItemTab from './MenuItemTab';

// Mock fetching function. In reality, you'd use supabase-js server client to fetch all these from the DB.
async function fetchMenuData() {
  // const supabase = createServerComponentClient({ cookies });
  // const [categories, ingredients, menuItems, assignments] = await Promise.all([...]);
  
  return {
    categories: [] as Category[],
    ingredients: [] as Ingredient[],
    menuItems: [] as MenuItem[],
    assignments: [] as MenuItemIngredient[],
  };
}

export const metadata = {
  title: 'Menu Manager | Muncherz',
};

export default async function MenuManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const data = await fetchMenuData();
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || 'items';


  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
          <p className="text-sm text-gray-500">Manage categories, ingredients, and menu items</p>
        </div>

        {/* Custom Tabs Navigation (client-side routing handled via basic links or we could use client state) */}
        <div className="flex gap-4 border-b border-gray-200 mb-6 pb-2">
          <a href="?tab=categories" className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'categories' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Categories
          </a>
          <a href="?tab=ingredients" className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'ingredients' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Ingredients
          </a>
          <a href="?tab=items" className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'items' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Menu Items
          </a>
        </div>

        <div>
          {currentTab === 'categories' && <CategoryTab initialCategories={data.categories} />}
          {currentTab === 'ingredients' && <IngredientTab initialIngredients={data.ingredients} />}
          {currentTab === 'items' && (
            <MenuItemTab 
              initialItems={data.menuItems} 
              categories={data.categories} 
              allIngredients={data.ingredients} 
              initialAssignments={data.assignments} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
