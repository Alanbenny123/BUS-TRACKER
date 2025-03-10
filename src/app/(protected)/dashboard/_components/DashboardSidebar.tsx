'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TruckIcon, 
  MapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'College Bus Overview', href: '/dashboard', icon: TruckIcon },
   { name: 'Drivers', href: '/dashboard/drivers', icon: UserGroupIcon },
  
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-indigo-700 dark:bg-gray-800">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-white">College Tracking</h1>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-800 dark:bg-gray-900 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-indigo-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-2">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600 dark:hover:bg-gray-700"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 h-6 w-6 flex-shrink-0 text-indigo-300"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 