'use client';

import React, { useState } from 'react';

/**
 * ⚠️ SECURITY NOTICE & CAPABILITY URL EXPLANATION:
 * This component is rendered on the unauthenticated Rider Order Portal route.
 * There is no staff login session or JWT check guarding this page.
 * Access depends entirely on the unguessable order UUID parameter in the URL.
 * 
 * Impact: If a third party gains access to this URL, they can view the customer's
 * phone number and delivery address, and mark the order delivered. This has been
 * flagged as a known system architecture limitation and is documented accordingly.
 */

interface RiderOrder {
  order_number: string;
  customer_phone: string;
  delivery_address: string;
  landmark: string | null;
  payment_method: 'cod' | 'jazzcash' | 'easypaisa' | 'card';
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
}

interface RiderOrderViewProps {
  order: RiderOrder;
  orderId: string;
}

export default function RiderOrderView({ order, orderId }: RiderOrderViewProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCOD = order.payment_method === 'cod';
  const canSubmit = !isCOD || codConfirmed;

  // Generate Google Maps URL
  const queryAddress = `${order.delivery_address}${order.landmark ? `, near ${order.landmark}` : ''}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryAddress)}`;

  const handleMarkDelivered = async () => {
    if (isLoading || !canSubmit) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rider/order/${orderId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cod_confirmed: isCOD ? codConfirmed : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentStatus('delivered');
      } else {
        setError(data.error || 'Failed to update delivery status. Please try again.');
      }
    } catch (err) {
      console.error('Error delivering order:', err);
      setError('A network error occurred. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentBadge = () => {
    switch (order.payment_method) {
      case 'cod':
        return { text: 'Cash on Delivery (COD)', color: 'bg-amber-50 border-amber-200 text-amber-700' };
      case 'jazzcash':
        return { text: 'JazzCash Prepaid', color: 'bg-red-50 border-red-200 text-red-700' };
      case 'easypaisa':
        return { text: 'EasyPaisa Prepaid', color: 'bg-green-50 border-green-200 text-green-700' };
      default:
        return { text: 'Card Paid', color: 'bg-blue-50 border-blue-200 text-blue-700' };
    }
  };

  const badge = getPaymentBadge();

  if (currentStatus === 'delivered') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-50 text-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Completed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Order <span className="font-bold text-gray-800">#{order.order_number}</span> has been marked as delivered and payment logged.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl text-left mb-6 border border-gray-100">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Delivery Summary</div>
            <div className="text-sm text-gray-600 mb-1 flex justify-between">
              <span>Method:</span>
              <span className="font-medium text-gray-800">{isCOD ? 'COD Collected' : 'Prepaid'}</span>
            </div>
            <div className="text-sm text-gray-600 flex justify-between">
              <span>Address:</span>
              <span className="font-medium text-gray-800 truncate max-w-[200px]" title={order.delivery_address}>
                {order.delivery_address}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            You can now close this tab. The restaurant manager has been notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 flex flex-col items-center justify-start pt-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A0A0A] p-5 text-white flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400 font-bold tracking-wider uppercase">Active Delivery</div>
            <h1 className="text-lg font-bold">Order #{order.order_number}</h1>
          </div>
          <span className="px-3 py-1 bg-[#F7B731] text-black text-xs font-bold uppercase rounded-full">
            {currentStatus}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Method Badge */}
          <div className={`p-4 border rounded-xl flex items-start gap-3 ${badge.color}`}>
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-bold text-sm">Payment Type</div>
              <div className="text-xs opacity-90">{badge.text}</div>
            </div>
          </div>

          {/* Customer Address Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer & Delivery Info</h3>
            
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-4">
              {/* Phone */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-400">Phone Number</div>
                    <div className="text-sm font-bold text-gray-800">{order.customer_phone}</div>
                  </div>
                </div>
                
                <a 
                  href={`tel:${order.customer_phone}`} 
                  className="bg-[#FAFAFA] border border-gray-200 p-2.5 rounded-lg hover:bg-gray-100 text-[#0A0A0A] font-bold text-sm flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call
                </a>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Address */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-gray-400">Delivery Address</div>
                    <div className="text-sm font-bold text-gray-800 leading-snug">{order.delivery_address}</div>
                    {order.landmark && (
                      <div className="text-xs text-gray-500 mt-1 font-medium bg-amber-50 border border-amber-100 rounded px-2 py-0.5 inline-block">
                        Landmark: {order.landmark}
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Maps Button */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 bg-[#D62828] text-white py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {isCOD && (
              <label className="flex items-start gap-3 p-3.5 bg-yellow-50/50 border border-yellow-200/60 rounded-xl cursor-pointer select-none hover:bg-yellow-50 transition-colors">
                <input
                  type="checkbox"
                  checked={codConfirmed}
                  onChange={(e) => setCodConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#D62828] focus:ring-[#D62828] shrink-0 mt-0.5 accent-[#D62828]"
                />
                <span className="text-xs text-gray-700 font-bold leading-normal">
                  I confirm that I have collected cash payment for this order.
                </span>
              </label>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#D62828] text-xs font-bold rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleMarkDelivered}
              disabled={!canSubmit || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                canSubmit && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark Delivered
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
