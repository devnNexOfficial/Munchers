import KDSBoard from './KDSBoard';

export const metadata = {
  title: 'Live KDS | Muncherz',
};

export default function KDSPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
          <p className="text-sm text-gray-500">Live order management for restaurant staff</p>
        </div>
        <KDSBoard />
      </div>
    </div>
  );
}
