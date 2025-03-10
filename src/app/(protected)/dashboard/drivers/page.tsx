'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DriverAvatar from '@/components/ui/DriverAvatar';
import io from 'socket.io-client';
import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

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

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverLocations, setDriverLocations] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  // Query for drivers data with caching
  const { data: drivers = [], isLoading, error } = useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 3600000, // Cache for 1 hour
  });

  // Socket connection with optimized updates
  useEffect(() => {
    if (!session) return;

    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: session.user?.email
      }
    });

    let locationUpdates: Record<string, { latitude: number; longitude: number }> = {};
    let updateTimeout: NodeJS.Timeout;

    // Batch location updates
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
  }, [session]);

  // Loading states
  if (isLoading) {
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

  // Error state
  if (error) {
    return (
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Drivers</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : 'An error occurred while loading the drivers.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
            >
              Try again
            </button>
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
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedDriver?.id === driver.id
                          ? 'bg-indigo-50 dark:bg-indigo-900'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <DriverAvatar name={driver.name} size={48} />
                          <span 
                            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                              isOnline ? 'bg-green-400' : 'bg-gray-400'
                            }`} 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{driver.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{driver.busNumber}</p>
                          {location && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Last update: {new Date().toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            {selectedDriver ? (
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <DriverAvatar name={selectedDriver.name} size={192} className="mb-6" />
                    <span 
                      className={`absolute bottom-6 right-0 block h-6 w-6 rounded-full ring-4 ring-white ${
                        driverLocations[selectedDriver.id] ? 'bg-green-400' : 'bg-gray-400'
                      }`} 
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedDriver.name}
                  </h2>
                  <p className="text-lg text-indigo-600 dark:text-indigo-400 mb-6">
                    {selectedDriver.busNumber}
                  </p>

                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedDriver.age} years
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedDriver.experience}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedDriver.phoneNumber}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedDriver.address}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bus Number Plate</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedDriver.numberPlate}
                      </p>
                    </div>

                    {driverLocations[selectedDriver.id] && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Location</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Lat: {driverLocations[selectedDriver.id].latitude.toFixed(6)}, 
                          Long: {driverLocations[selectedDriver.id].longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Last update: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Select a driver to view their details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 