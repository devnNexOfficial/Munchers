import React from 'react'
import { headers } from 'next/headers'
import RiderOrderView from './RiderOrderView'

/**
 * ⚠️ SECURITY NOTICE & CAPABILITY URL EXPLANATION:
 * This page is accessible via unauthenticated capability URLs (/rider/order/[orderId]).
 * There is no traditional session login or authentication for riders.
 * Authorization is based purely on possession of the unguessable order UUID.
 * Loudly flagged in both frontend views and backend route files.
 */

interface RiderOrderPageProps {
  params: Promise<{ orderId: string }>
}

export const metadata = {
  title: 'Rider Portal - Delivery details | Muncherz',
  robots: 'noindex, nofollow', // Prevent indexing capability URLs
}

export default async function RiderOrderPage({ params }: RiderOrderPageProps) {
  const { orderId } = await params
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'

  let orderData = null
  let errorMessage = null

  try {
    const res = await fetch(`${protocol}://${host}/api/rider/order/${orderId}`, {
      cache: 'no-store',
    })
    
    if (res.ok) {
      orderData = await res.json()
    } else {
      const errJson = await res.json().catch(() => ({}))
      errorMessage = errJson.error || 'Order details could not be retrieved.'
    }
  } catch (err) {
    console.error('Error fetching rider order on server:', err)
    errorMessage = 'Failed to connect to the server.'
  }

  if (errorMessage || !orderData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-[#D62828] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Delivery Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">{errorMessage || 'The requested delivery does not exist or has expired.'}</p>
          <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            If you are a rider, please contact your manager for a valid delivery link.
          </div>
        </div>
      </div>
    )
  }

  return <RiderOrderView order={orderData} orderId={orderId} />
}
