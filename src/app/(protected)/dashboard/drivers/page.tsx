'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DriverAvatar from '@/components/ui/DriverAvatar';
import io from 'socket.io-client';
import { useSession, signIn } from 'next-auth/react';

// Types
interface Driver {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  address: string;
  busNumber: string;
  experience: string;
  numberPlate: string;
  lastLocation?: { latitude: number; longitude: number };
  lastUpdate?: string;
  isOnline?: boolean;
}

// Initial mock data
const initialDrivers: Driver[] = [
  {
    id: '1',
    name: 'Arun Kumar',
    age: 35,
    phoneNumber: '+91 9876543210',
    address: 'Kalady, Kerala',
    busNumber: 'College Bus 101',
    experience: '8 years',
    numberPlate: 'KL-07-AX-1234'
  },
  {
    id: '2',
    name: 'Rajesh Menon',
    age: 42,
    phoneNumber: '+91 9876543211',
    address: 'Perumbavoor, Kerala',
    busNumber: 'College Bus 102',
    experience: '12 years',
    numberPlate: 'KL-07-AX-5678'
  }
];

// API functions
const fetchDrivers = async (): Promise<Driver[]> => {
  // Simulate API call - replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return initialDrivers;
};

const SOCKET_UPDATE_INTERVAL = 5000; // 5 seconds

export default function DriversPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('github', { callbackUrl: '/dashboard/drivers' });
    },
  });

  // Declare all state hooks at the top level
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverLocations, setDriverLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  // Query for drivers data with caching
  const { data: drivers = [], isLoading } = useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 3600000, // Cache for 1 hour
  });

  useEffect(() => {
    if (status === 'loading') return;

    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: session?.user?.email
      }
    });

    let locationUpdates: Record<string, { latitude: number; longitude: number }> = {};
    let updateTimeout: NodeJS.Timeout;

    const processLocationUpdates = () => {
      if (Object.keys(locationUpdates).length > 0) {
        setDriverLocations(prev => ({ ...prev, ...locationUpdates }));
        locationUpdates = {};
      }
      updateTimeout = setTimeout(processLocationUpdates, SOCKET_UPDATE_INTERVAL);
    };

    newSocket.on('receiveLocation', (data: { id: string; latitude: number; longitude: number }) => {
      locationUpdates[data.id] = { latitude: data.latitude, longitude: data.longitude };
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    updateTimeout = setTimeout(processLocationUpdates, SOCKET_UPDATE_INTERVAL);
    setSocket(newSocket);

    return () => {
      clearTimeout(updateTimeout);
      newSocket.disconnect();
    };
  }, [session, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bus Drivers</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              View detailed information about our bus drivers
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Drivers List */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select a Driver</h2>
              <div className="space-y-4">
                {drivers.map((driver) => {
                  const location = driverLocations[driver.id];
                  const isOnline = !!location;
                  
                  return (
                    <button
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-lg transition ${
                        selectedDriver?.id === driver.id
                          ? 'bg-indigo-50 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <DriverAvatar name={driver.name} isOnline={isOnline} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {driver.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {driver.busNumber}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              {selectedDriver ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <DriverAvatar 
                      name={selectedDriver.name} 
                      isOnline={!!driverLocations[selectedDriver.id]}
                      size="lg"
                    />
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                        {selectedDriver.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedDriver.busNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Contact Information
                      </h3>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Phone</dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedDriver.phoneNumber}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Address</dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedDriver.address}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Bus Information
                      </h3>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Number Plate</dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedDriver.numberPlate}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Experience</dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedDriver.experience}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a driver to view their details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}