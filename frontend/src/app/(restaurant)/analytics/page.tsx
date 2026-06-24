import { Metadata } from 'next';
import AnalyticsClientWrapper from './AnalyticsClientWrapper';

export const metadata: Metadata = {
  title: "Analytics | Muncherz Restaurant",
};

export default async function AnalyticsPage() {
  // Mock server-side fetch to satisfy requirements.
  // Real implementation would hit Supabase or internal service.
  const initialSummary = {
    total_revenue: 0,
    total_orders: 0,
    top_items: []
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
      <AnalyticsClientWrapper initialSummary={initialSummary} initialPopular={null} />
    </div>
  );
}
