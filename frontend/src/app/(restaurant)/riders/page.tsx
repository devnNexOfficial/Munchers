import { createClient } from '@/lib/supabase/server';
import RidersList from './RidersList';
import { Rider, StaffRole } from './types';

export const metadata = {
  title: 'Rider Management | Muncherz',
};

async function fetchRidersData() {
  try {
    const supabase = await createClient();
    const { data: riders, error } = await supabase
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching riders:', error);
      return [];
    }
    return (riders || []) as Rider[];
  } catch (err) {
    console.error('Database connection failed, using empty mock array:', err);
    return [];
  }
}

export default async function RidersPage() {
  const riders = await fetchRidersData();
  const role: StaffRole = 'owner'; // Defaulting to owner for full access in panel UI

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <RidersList initialRiders={riders} role={role} />
      </div>
    </div>
  );
}
