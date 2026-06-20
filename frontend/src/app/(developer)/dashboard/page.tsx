import AppHealthCard from './AppHealthCard';
import ActiveUsersCard from './ActiveUsersCard';
import DbStatusCard from './DbStatusCard';
import PaymentSuccessRateCard from './PaymentSuccessRateCard';
import ErrorLogViewer from './ErrorLogViewer';
import ActivityLogViewer from './ActivityLogViewer';

export const metadata = {
  title: 'Developer Dashboard | Muncherz',
};

export default function DeveloperDashboardPage() {
  // Assumes developer session/2FA gate already protects this layout/route.
  // No re-implementation of auth/2FA here.
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
          <p className="text-sm text-gray-500">System health, error monitoring, and operational logs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AppHealthCard />
          <ActiveUsersCard />
          <DbStatusCard />
          <PaymentSuccessRateCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorLogViewer />
          <ActivityLogViewer />
        </div>
      </div>
    </div>
  );
}
