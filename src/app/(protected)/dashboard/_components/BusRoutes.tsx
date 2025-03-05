'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/ui/Map'), { ssr: false });

interface BusRoute {
  id: string;
  number: string;
  time: string;
  status: string;
}

const mockBusRoutes: BusRoute[] = [
  { id: '1', number: 'Tescolt 4x 1.800', time: '160 poj PM', status: 'On Time' },
  { id: '2', number: 'Tescolt 4x 1.800', time: '150 poj PM', status: 'Delayed' },
  { id: '3', number: 'Tescolt 4x 2.800', time: '154 poj PM', status: 'On Time' },
  { id: '4', number: 'Tescolt 4x 3.800', time: '154 poj PM', status: 'On Time' },
  { id: '5', number: 'Tescolt 4x 2.500', time: '160 poj PM', status: 'Delayed' },
];

export default function BusRoutes() {
  const [selectedTab, setSelectedTab] = useState('Sath');
  const tabs = ['Sath', 'Thrt', 'State', 'Dailp'];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Whaalype shorel</h2>
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bus List */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bus</h3>
            {mockBusRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{route.number}</p>
                  <p className="text-sm text-gray-500">{route.time}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.status === 'On Time'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {route.status}
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="h-[400px] rounded-lg overflow-hidden">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
} 