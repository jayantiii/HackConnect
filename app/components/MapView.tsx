"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import React from "react";

interface University {
  name: string;
  posts: number;
  position: LatLngExpression;
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
  setSelectedCollege: (name: string | null) => void;
  selectedCollege: string | null;
  mapRef: any;
  handleSearch: () => void;
  search: string;
  setSearch: (s: string) => void;
  isLoggedIn: boolean;
  onClose: () => void;
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
}: MapViewProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[80%] h-[70vh] bg-white/80 rounded-xl shadow-lg overflow-hidden relative mt-8">
        {/* Close button inside map */}
        {isLoggedIn && (
          <button
            className="absolute top-4 right-4 z-40 text-2xl text-gray-400 hover:text-red-500 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow"
            onClick={onClose}
          >
            &times;
          </button>
        )}
        {/* Search bar inside map */}
        <div className="absolute top-4 left-4 z-40 flex gap-2 w-[60%]">
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 rounded border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <MapContainer
          center={[40, -30] as LatLngExpression}
          zoom={2}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {universities.map((uni, idx) => (
            <Marker
              key={idx}
              position={uni.position}
              icon={markerIcon as L.Icon}
              eventHandlers={{
                click: () => setSelectedCollege(uni.name),
              }}
            >
              <Popup>
                <div className="font-semibold">{uni.name}</div>
                <div className="text-sm text-gray-600">Posts: {posts.filter(p => p.university === uni.name).length}</div>
                <div className="text-sm text-gray-600">Users: {uni.posts}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
} 