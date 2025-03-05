'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Leaflet with Next.js
const icon = new Icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Mock bus locations - replace with real data from your API
const busLocations = [
  {
    id: '1',
    position: [28.6139, 77.2090], // Delhi
    number: 'College Bus 101',
    status: 'On Time',
    speed: '45 km/h',
    lastUpdate: '2 mins ago',
    route: 'North Campus → South Campus'
  },
  {
    id: '2',
    position: [28.6304, 77.2177], // Connaught Place
    number: 'College Bus 102',
    status: 'Delayed',
    speed: '30 km/h',
    lastUpdate: '1 min ago',
    route: 'CP → Delhi University'
  },
  {
    id: '3',
    position: [28.5921, 77.2264], // AIIMS
    number: 'College Bus 103',
    status: 'On Time',
    speed: '40 km/h',
    lastUpdate: '3 mins ago',
    route: 'AIIMS → IIT Delhi'
  }
];

interface BusLocation {
  id: string;
  position: [number, number];
  number: string;
  status: string;
  speed: string;
  lastUpdate: string;
  route: string;
}

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [buses, setBuses] = useState<BusLocation[]>(busLocations);

  useEffect(() => {
    setIsMounted(true);

    // Simulate real-time updates - replace with real WebSocket or API polling
    const interval = setInterval(() => {
      // Simulate bus movement
      setBuses(prevBuses => 
        prevBuses.map(bus => ({
          ...bus,
          position: [
            bus.position[0] + (Math.random() - 0.5) * 0.001,
            bus.position[1] + (Math.random() - 0.5) * 0.001
          ],
          lastUpdate: '1 min ago'
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <MapContainer
      center={[28.6139, 77.2090]} // Centered on Delhi
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={bus.position}
          icon={icon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium text-gray-900">{bus.number}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Route: {bus.route}</p>
                <p className="text-sm text-gray-600">
                  Status: <span className={bus.status === 'On Time' ? 'text-green-600' : 'text-red-600'}>{bus.status}</span>
                </p>
                <p className="text-sm text-gray-600">Speed: {bus.speed}</p>
                <p className="text-sm text-gray-600">Last Update: {bus.lastUpdate}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 