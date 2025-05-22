"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import React from "react";

interface University {
  name: string;
  position: LatLngExpression;
  posts: number;
  users: number;
  address: {
    city: string;
    state: string;
    country: string;
  };
}

interface Post {
  title: string;
  link: string;
  type: string;
  description?: string;
  university: string;
  timestamp: string;
}

interface MapViewProps {
  universities: University[];
  posts: Post[];
  setSelectedCollege: (college: string | null) => void;
  selectedCollege: string | null;
  mapRef: any;
  handleSearch: () => void;
  search: string;
  setSearch: (search: string) => void;
  isLoggedIn: boolean;
  onClose: () => void;
  onAddFilter: (university: string) => void;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function MapView({
  universities,
  posts,
  setSelectedCollege,
  selectedCollege,
  mapRef,
  handleSearch,
  search,
  setSearch,
  isLoggedIn,
  onClose,
  onAddFilter
}: MapViewProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-80">
        <div className="flex items-center justify-center gap-2">
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {universities.map((university) => (
          <Marker
            key={university.name}
            position={university.position}
            icon={markerIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{university.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {university.address.city}, {university.address.state}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {university.address.country}
                </p>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Hackathons: {university.posts}</p>
                  <p>Students: {university.users}</p>
                </div>
                {university.posts > 0 && (
                  <button
                    onClick={() => onAddFilter(university.name)}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-1 px-2 rounded transition-colors"
                  >
                    Show Hackathon Events
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 