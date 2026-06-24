import { Rider, DeliverySettings, StaffRole } from './types';
import RiderTab from './RiderTab';
import DeliverySettingsTab from './DeliverySettingsTab';

// Mock fetch functions
async function fetchDeliveryData() {
  // Replace with actual Supabase queries
  
  // Mock Rider data
  const riders: Rider[] = [];
  
  // Mock Delivery Settings
  const settings: DeliverySettings = {
    delivery_enabled: true,
    free_delivery_km: 5.0,
    delivery_charge: 150,
    max_delivery_km: 15.0,
    surge_enabled: false,
    surge_charge: 0,
    surge_start_time: null,
    surge_end_time: null,
    qr_dine_in_enabled: false
  };

  // Mock staff role (this would come from session context)
  const role: StaffRole = 'owner';

  return { riders, settings, role };
}

export const metadata = {
  title: 'Delivery Setup | Muncherz',
};

export default async function DeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { riders, settings, role } = await fetchDeliveryData();
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || 'riders';


  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delivery & Rider Setup</h1>
          <p className="text-sm text-gray-500">Manage delivery settings, pricing, and your rider fleet</p>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex gap-4 border-b border-gray-200 mb-6 pb-2">
          <a href="?tab=riders" className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'riders' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Riders
          </a>
          <a href="?tab=settings" className={`font-medium pb-2 border-b-2 transition-colors ${currentTab === 'settings' ? 'border-[#D62828] text-[#D62828]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Delivery Settings
          </a>
        </div>

        <div>
          {currentTab === 'riders' && (
            <RiderTab initialRiders={riders} role={role} />
          )}
          {currentTab === 'settings' && (
            <DeliverySettingsTab initialSettings={settings} role={role} />
          )}
        </div>
      </div>
    </div>
  );
}
