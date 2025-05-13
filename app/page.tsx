"use client";
import { useState, useRef, useEffect } from "react";
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
  const [user, setUser] = useState<any>(null);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Fetch all hackathons on mount
    fetch("/api/hackathons")
      .then(res => res.json())
      .then(setHackathons);
  }, []);

  const validateEmail = (email: string) => {
    return /.+@([\w-]+\.)?(edu|ac\.[a-z]{2})$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please use a valid university email (.edu or .ac.xx)");
      return;
    }
    setError("");
    // Create user in backend
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: email.split("@")[0] })
    });
    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setError("Failed to create user");
    }
  };

  const handleCreatePost = async (data: any) => {
    // Create hackathon in backend
    const hackathonData = {
      name: data.title,
      date: new Date().toISOString(),
      location: selectedCollege || "MIT",
      info: data.description || "",
      website: data.link
    };
    const res = await fetch("/api/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hackathonData)
    });
    if (res.ok) {
      const newHackathon = await res.json();
      setHackathons(prev => [...prev, newHackathon]);
    }
  };

  // Filter hackathons for selected college
  const filteredHackathons = selectedCollege
    ? hackathons.filter(h => h.location === selectedCollege)
    : [];

  // Register user for hackathon
  const handleRegister = async (hackathonId: number) => {
    if (!user) return;
    // Add hackathon to user's acceptedHackathons
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, hackathonId })
    });
    // Add user to hackathon's registeredStudents
    await fetch('/api/hackathons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId, userId: user.id })
    });
    // Refresh hackathons
    const res = await fetch('/api/hackathons');
    setHackathons(await res.json());
  };

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
                <h3 className="font-bold text-xl text-blue-700">Hackathons for {selectedCollege}</h3>
                <button
                  className="text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setSelectedCollege(null)}
                >
                  &times;
                </button>
              </div>
              {filteredHackathons.length === 0 ? (
                <div className="text-gray-500 text-sm">No hackathons for this college yet.</div>
              ) : (
                filteredHackathons.map((hackathon, i) => (
                  <div key={i} className="mb-4 border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="font-semibold">{hackathon.name}</div>
                    <div className="text-xs text-gray-500 mb-1">{hackathon.location} • {new Date(hackathon.date).toLocaleString()}</div>
                    <div className="text-sm mb-1">{hackathon.info}</div>
                    <a href={hackathon.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">{hackathon.website}</a>
                    <div className="text-xs text-gray-500 mt-1">Registered Students: {hackathon.registeredStudents.length}</div>
                    {isLoggedIn ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                          onClick={() => handleRegister(hackathon.id)}
                          disabled={user && hackathon.registeredStudents.includes(user.id)}
                        >
                          {user && hackathon.registeredStudents.includes(user.id) ? 'Registered' : 'Register'}
                        </button>
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
