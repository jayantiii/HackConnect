"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import PostCreationModal from "./components/PostCreationModal";
import dynamic from "next/dynamic";

// Sample university data
const universities: { name: string; posts: number; position: LatLngExpression }[] = [
  {
    name: "MIT",
    posts: 5,
    position: [42.3601, -71.0942],
  },
  {
    name: "Stanford University",
    posts: 3,
    position: [37.4275, -122.1697],
  },
  {
    name: "University of Cambridge",
    posts: 2,
    position: [52.2043, 0.1149],
  },
];

// Custom marker icon (fixes default icon issue in Next.js)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const MapView = dynamic(() => import("./components/MapView"), { ssr: false });

export default function Home() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  const validateEmail = (email: string) => {
    return /.+@([\w-]+\.)?(edu|ac\.[a-z]{2})$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please use a valid university email (.edu or .ac.xx)");
      return;
    }
    setError("");
    setIsLoggedIn(true);
  };

  const handleCreatePost = (data: any) => {
    setPosts(prev => [...prev, { ...data, university: selectedCollege || "MIT", timestamp: new Date().toISOString() }]);
  };

  // Filter posts for selected college
  const filteredPosts = selectedCollege
    ? posts.filter(post => post.university === selectedCollege)
    : [];

  // Search handler
  const handleSearch = () => {
    if (!search.trim()) return;
    const found = universities.find(u => u.name.toLowerCase().includes(search.toLowerCase()));
    if (found && mapRef.current) {
      mapRef.current.setView(found.position, 8);
      setSelectedCollege(found.name);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar with Show/Hide Map button after login */}
      {isLoggedIn && (
        <div className="w-full flex justify-center items-center py-4 bg-white dark:bg-gray-900 shadow z-30">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors"
            onClick={() => setShowMap(v => !v)}
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>
      )}
      <div className="flex flex-1">
        {/* Left: Auth Form */}
        <div className="w-full md:w-1/4 bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-8 shadow-lg z-10">
          <div className="w-full max-w-xs">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">HackConnect</h1>
            {!isLoggedIn ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="University Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {error && <span className="text-red-500 text-sm">{error}</span>}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
                >
                  Login / Signup
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <span className="block font-semibold text-lg">Welcome!</span>
                  <span className="block text-gray-600 text-sm">{email}</span>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors w-full"
                  onClick={() => setShowModal(true)}
                >
                  Create New Post
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Right: Map View (conditionally rendered) */}
        <div className="hidden md:block w-3/4 relative bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-start">
          {(!isLoggedIn || showMap) && (
            <MapView
              universities={universities}
              posts={posts}
              setSelectedCollege={setSelectedCollege}
              selectedCollege={selectedCollege}
              mapRef={mapRef}
              handleSearch={handleSearch}
              search={search}
              setSearch={setSearch}
              isLoggedIn={isLoggedIn}
              onClose={() => setShowMap(false)}
            />
          )}
          {/* Posts Section for selected college */}
          {selectedCollege && (
            <div className="w-[80%] bg-white/90 rounded-lg shadow p-6 mt-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-blue-700">Posts for {selectedCollege}</h3>
                <button
                  className="text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setSelectedCollege(null)}
                >
                  &times;
                </button>
              </div>
              {filteredPosts.length === 0 ? (
                <div className="text-gray-500 text-sm">No posts for this college yet.</div>
              ) : (
                filteredPosts.map((post, i) => (
                  <div key={i} className="mb-4 border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="font-semibold">{post.title}</div>
                    <div className="text-xs text-gray-500 mb-1">{post.university} • {new Date(post.timestamp).toLocaleString()}</div>
                    <div className="text-sm mb-1">{post.description}</div>
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">{post.link}</a>
                    {/* Interactions (only for logged in users) */}
                    {isLoggedIn ? (
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">Like</button>
                        <button className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">Comment</button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
          {/* Modal at root level for proper overlay */}
          <PostCreationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreatePost}
          />
        </div>
      </div>
    </div>
  );
}
