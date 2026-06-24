import { StaffAccount, StaffRole } from './types';
import StaffList from './StaffList';

async function fetchStaffData() {
  // Replace with actual Supabase client queries
  
  // Mock current user info (from Dev 1's auth context)
  const currentUserId = 'user-owner-123';
  const role: StaffRole = 'owner';

  // Mock staff list
  const staff: StaffAccount[] = [
    {
      id: 'staff-1',
      user_id: 'user-owner-123',
      name: 'Owner Name',
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'staff-2',
      user_id: 'user-manager-456',
      name: 'Manager Name',
      role: 'manager',
      is_active: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'staff-3',
      user_id: 'user-chef-789',
      name: 'Chef Name',
      role: 'chef',
      is_active: false,
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  return { staff, currentUserId, role };
}

export const metadata = {
  title: 'Staff Access | Muncherz',
};

export default async function StaffPage() {
  const { staff, currentUserId, role } = await fetchStaffData();

  // Guard: Only owners can access this page
  // The nav hides it, but we should double-guard the route
  if (role !== 'owner') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">Only the restaurant owner can manage staff accounts.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <StaffList initialStaff={staff} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
