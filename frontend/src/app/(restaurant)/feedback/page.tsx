import { Metadata } from 'next';
import FeedbackList from './FeedbackList';

export const metadata: Metadata = {
  title: "Feedback | Muncherz Restaurant",
};

export default async function FeedbackPage() {
  // Mock fetching initial feedback list server-side.
  // Real implementation will query the feedback table from Supabase.
  const initialEntries: any[] = [];
  const role = 'owner'; // Mocking role

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Feedback</h1>
      <FeedbackList initialEntries={initialEntries} role={role} />
    </div>
  );
}
