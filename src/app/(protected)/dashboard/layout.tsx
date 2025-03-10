'use client';

import { ReactNode } from 'react';
import DashboardSidebar from './_components/DashboardSidebar';
import DashboardHeader from './_components/DashboardHeader';
import dynamic from 'next/dynamic';

// Dynamically import Chatbot with no SSR
const Chatbot = dynamic(() => import('@/components/ui/Chatbot'), {
  loading: () => null,
  ssr: false
});

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen flex dark:bg-gray-900">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          {children}
        </main>
        <Chatbot />
      </div>
    </div>
  );
} 