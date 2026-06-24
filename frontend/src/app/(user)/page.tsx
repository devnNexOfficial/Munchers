import { Suspense } from 'react';
import UserHomeContent from './UserHomeContent';

export default function UserHomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center mt-20 text-gray-400">Loading...</div>}>
      <UserHomeContent />
    </Suspense>
  );
}
