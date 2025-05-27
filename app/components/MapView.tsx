"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import React from "react";
import { universities, type University } from "../data/universities";

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
  mapRef: React.RefObject<any>;
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
  useEffect(() => {
    // Fix Leaflet default icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-80">
        <div className="flex items-center justify-center gap-2">
          <input
            type="text"
            placeholder="Search universities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 whitespace-nowrap dark:bg-blue-700 dark:hover:bg-blue-800"
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
        className="dark:bg-gray-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {universities.map((university) => (
          <Marker
            key={university.name}
            position={university.position as LatLngExpression}
            icon={markerIcon}
          >
            <Popup>
              <div className="text-center dark:text-gray-900">
                <h3 className="font-bold mb-2">{university.name}</h3>
                <p className="text-sm text-gray-600">
                  {university.address.city}, {university.address.state}
                </p>
                <p className="text-sm text-gray-600">{university.address.country}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Posts: {university.posts} | Users: {university.users}
                </p>
                <button
                  onClick={() => onAddFilter(university.name)}
                  className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium py-1.5 px-3 rounded transition-colors dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100"
                >
                  Show Hackathons
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 