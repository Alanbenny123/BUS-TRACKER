'use client';

import dynamic from 'next/dynamic';

// Dynamicall y import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/ui/Map'), { ssr: false });

const busRoutes = [
  {
    id: '1',
    number: 'College Bus 101',
    time: '8:00 AM',
    status: 'On Time',
    route: 'North Campus → Adi Shankara Collage'
  },
  {
    id: '2',
    number: 'College Bus 102',
    time: '8:15 AM',
    status: 'Delayed',
    route: 'CP → Adi Shankara Collage'
  }/*,
  {
    id: '3',
    number: 'College Bus 103',
    time: '8:30 AM',
    status: 'On Time',
    route: 'AIIMS → IIT Delhi'
  }*/
];

export default function DashboardPage() {
  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">College Bus Tracking</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Real-time monitoring of college buses across Delhi.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Bus List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">Bus Routes</h2>
              <p className="text-sm text-gray-500">Today's schedule and status</p>
            </div>

            <div className="mt-6 space-y-4">
              {busRoutes.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bus.number}</p>
                        <p className="text-xs text-gray-500">{bus.route}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          bus.status === 'On Time'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bus.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 text-right">{bus.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="h-[400px] rounded-lg overflow-hidden">
                <Map />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Buses</dt>
                    <dd className="text-lg font-medium text-gray-900">3</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">On Time</dt>
                    <dd className="text-lg font-medium text-green-600">2</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Delayed</dt>
                    <dd className="text-lg font-medium text-red-600">1</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 