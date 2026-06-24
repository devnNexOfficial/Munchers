import { Metadata } from 'next';
import QRCodeFlow from '@/components/kds/QRCodeFlow';

export const metadata: Metadata = {
  title: "QR Codes | Muncherz Restaurant",
};

export default async function QRPage() {
  // Mock checking restaurant settings from DB
  const qrEnabled = true;

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-5xl mx-auto mb-8 print:hidden">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">QR Dine-in Manager</h1>
        <p className="text-gray-500 mt-1">Generate and print QR codes for tables. Customers can scan to order directly to the kitchen.</p>
      </div>
      
      <QRCodeFlow qrEnabled={qrEnabled} />
    </div>
  );
}
