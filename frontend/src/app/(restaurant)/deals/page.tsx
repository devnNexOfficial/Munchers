import { Deal, MenuItemOption, StaffRole } from './types';
import DealsList from './DealsList';

async function fetchDealsData() {
  // Replace with actual Supabase client queries
  const deals: Deal[] = [];
  const menuOptions: MenuItemOption[] = [];
  
  // Mock staff role (this would come from session context)
  const role: StaffRole = 'owner';

  return { deals, menuOptions, role };
}

export const metadata = {
  title: 'Deals Manager | Muncherz',
};

export default async function DealsPage() {
  const { deals, menuOptions, role } = await fetchDealsData();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <DealsList initialDeals={deals} menuOptions={menuOptions} role={role} />
      </div>
    </div>
  );
}
