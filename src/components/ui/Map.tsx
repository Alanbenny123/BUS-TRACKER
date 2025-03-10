'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Fix for default marker icon in Leaflet with Next.js
const icon = new Icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Kerala map configuration
const KERALA_CENTER: [number, number] = [10.2, 76.4];
const KERALA_BOUNDS: [[number, number], [number, number]] = [
  [8.5, 74.5],
  [12.5, 77.5],
];

// Adi Shankara position
const ADI_SHANKARA_POSITION: [number, number] = [10.177686162000652, 76.43159471152298];

// OpenRouteService API key
const API_KEY = "5b3ce3597851110001cf6248bc068998129b41b6bc4b41db34be1934";

interface BusLocation {
  id: string;
  position: [number, number];
  number: string;
  status: string;
  speed: string;
  lastUpdate: string;
  route: string;
}

// Function to decode polyline
function decodePolyline(encoded: string) {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch route when user location changes
  const fetchRoute = async (userPos: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            coordinates: [
              [userPos[1], userPos[0]], // User location [longitude, latitude]
              [ADI_SHANKARA_POSITION[1], ADI_SHANKARA_POSITION[0]], // Adi Shankara [longitude, latitude]
            ],
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!data.routes?.[0]?.geometry) throw new Error('No route found');
      
      const coordinates = decodePolyline(data.routes[0].geometry);
      setRouteCoordinates(coordinates);
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Function to handle geolocation errors
  const handleLocationError = (error: GeolocationPositionError) => {
    let errorMessage = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location services in your browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please try again later.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please check your connection and try again.';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting your location.';
    }
    setLocationError(errorMessage);
    console.error('Geolocation error:', errorMessage);
  };

  // Function to request location permission
  const requestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(userPos);
        fetchRoute(userPos);
        setLocationError(null);
      },
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    setIsMounted(true);
    requestLocation();

    // Connect to Socket.IO server
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    });

    // Handle incoming location updates
    socket.on('receiveLocation', (data: { id: string; latitude: number; longitude: number }) => {
      setBuses(prevBuses => {
        const existingBus = prevBuses.find(bus => bus.id === data.id);
        if (existingBus) {
          return prevBuses.map(bus => 
            bus.id === data.id 
              ? { ...bus, position: [data.latitude, data.longitude], lastUpdate: 'Just now' }
              : bus
          );
        }
        return [...prevBuses, {
          id: data.id,
          position: [data.latitude, data.longitude],
          number: `Bus ${data.id}`,
          status: 'Active',
          speed: 'Updating...',
          lastUpdate: 'Just now',
          route: 'Current Route'
        }];
      });
    });

    // Handle user disconnection
    socket.on('user-disconnected', (userId: string) => {
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== userId));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  if (!isMounted) return null;

  const tileLayer = isDarkMode ? {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  } : {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={userLocation || KERALA_CENTER}
        zoom={8}
        minZoom={7}
        maxZoom={18}
        maxBounds={KERALA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer {...tileLayer} />
        
        {/* Adi Shankara Marker */}
        <Marker position={ADI_SHANKARA_POSITION} icon={icon}>
          <Popup>Adi Shankara</Popup>
        </Marker>

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={icon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Bus Markers */}
        {buses.map((bus) => (
          <Marker key={bus.id} position={bus.position} icon={icon}>
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

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 z-[1000] px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>

      {/* Location Error Message */}
      {locationError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{locationError}</p>
          <button
            onClick={requestLocation}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 