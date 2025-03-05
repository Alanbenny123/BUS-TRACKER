'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-end items-center">
          <div className="flex items-center">
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {session?.user?.name || 'Profile'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Student
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {(session?.user?.name || 'U')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 