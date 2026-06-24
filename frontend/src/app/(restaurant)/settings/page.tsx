import { Metadata } from 'next';
import RestaurantSettingsPage from '@/components/kds/RestaurantSettingsPage';

export const metadata: Metadata = {
  title: "Settings | Muncherz Restaurant",
};

export default function Settings() {
  return <RestaurantSettingsPage />;
}
