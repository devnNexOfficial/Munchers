import { KitchenScreensClient } from './KitchenScreensClient';

export const metadata = {
  title: 'Kitchen Screens Management | Muncherz',
};

export default function KitchenScreensPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Screens</h1>
          <p className="text-gray-500">Manage registered kitchen displays for your restaurant.</p>
        </div>
        <KitchenScreensClient />
      </div>
    </div>
  );
}
