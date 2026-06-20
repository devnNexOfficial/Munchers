'use client';

/*
 * 🚨 SECURITY NOTE 🚨
 * The nav hiding here is UX only. It does not provide security. 
 * The backend MUST enforce the same role matrix at the API/RLS level.
 * A chef with dev tools open can still hit any URL directly, and the 
 * actual access boundary has to be server-side. This UI work makes 
 * the experience correct for normal use; it is not the security boundary.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StaffRole } from './staff/types';

interface RestaurantNavProps {
  currentRole: StaffRole;
}

export default function RestaurantNav({ currentRole }: RestaurantNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Redirect chef if they land outside KDS
  useEffect(() => {
    if (currentRole === 'chef' && pathname && !pathname.includes('/kds')) {
      router.replace('/kds');
    }
  }, [currentRole, pathname, router]);

  const navLinks = [
    { label: 'KDS', href: '/kds', roles: ['owner', 'manager', 'chef'] },
    { label: 'Menu', href: '/menu', roles: ['owner', 'manager'] },
    { label: 'Inventory', href: '/inventory', roles: ['owner', 'manager'] },
    { label: 'Deals', href: '/deals', roles: ['owner', 'manager'] },
    { label: 'Orders & Financials', href: '/reports', roles: ['owner', 'manager'] },
    { label: 'Analytics', href: '/analytics', roles: ['owner', 'manager'] },
    { label: 'Feedback', href: '/feedback', roles: ['owner', 'manager'] },
    { label: 'Delivery & Settings', href: '/delivery', roles: ['owner', 'manager'] },
    { label: 'Staff', href: '/staff', roles: ['owner'] }
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(currentRole));

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-2">
          {visibleLinks.map(link => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
