import ReportsClientWrapper from './ReportsClientWrapper';

export const metadata = {
  title: 'Orders & Finance | Muncherz',
};

export default function OrdersFinancePage() {
  // Server component shell.
  // In a full implementation, we could await fetchInitialOrders() here 
  // and pass as initialData to the wrapper for SSR hydration.
  
  return <ReportsClientWrapper />;
}
