"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import PostCreationModal from "./components/PostCreationModal";
import { universities, type University } from "./data/universities";
import RegistrationModal, { type RegistrationData } from "./components/RegistrationModal";
import RegisteredStudentsModal from "./components/RegisteredStudentsModal";

const collegeNames = universities.map(u => u.name);

// Dynamically import MapView with no SSR
const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

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
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterInput, setFilterInput] = useState("");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);
  const [showRegisteredStudentsModal, setShowRegisteredStudentsModal] = useState(false);
  const [selectedHackathonForStudents, setSelectedHackathonForStudents] = useState<any>(null);

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
      setEmail(userData.email);
    }
  }, []);

  // Store user data in localStorage when logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    // Fetch all hackathons and users on mount
    Promise.all([
      fetch("/api/hackathons").then(res => res.json()),
      fetch("/api/users").then(res => res.json())
    ]).then(([hackathonsData, usersData]) => {
      setHackathons(hackathonsData);
      setAllUsers(usersData);
    });
  }, []);

  // Calculate university stats
  const universityStats = universities.map(uni => {
    const universityHackathons = hackathons.filter(h => h.location === uni.name);
    const universityUsers = allUsers.filter(u => u.university === uni.name);
    return {
      ...uni,
      posts: universityHackathons.length,
      users: universityUsers.length
    };
  });

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

    // First check if user exists
    const usersRes = await fetch("/api/users");
    const users = await usersRes.json();
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      // Log in existing user
      setUser(existingUser);
      setIsLoggedIn(true);
    } else {
      // Create new user
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name: email.split("@")[0],
          university: "", // Initialize with empty university
          acceptedHackathons: [] // Initialize with empty hackathons array
        })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setError("Failed to create user");
      }
    }
  };

  const handleCreatePost = async (data: any) => {
    if (!user) return;
    // Create hackathon in backend
    const hackathonData = {
      name: data.title,
      date: new Date().toISOString(),
      location: data.college,
      info: data.description ? data.description : "No Description",
      website: data.link,
      creatorEmail: user.email
    };
    console.log('Posting hackathonData:', hackathonData);
    const res = await fetch("/api/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hackathonData)
    });
    if (res.ok) {
      const newHackathon = await res.json();
      setHackathons(prev => [...prev, newHackathon]);
      console.log('Created post:', newHackathon);
      // Fetch and log all hackathons
      const allRes = await fetch('/api/hackathons');
      const allHackathons = await allRes.json();
      console.log('All hackathons:', allHackathons);
    }
  };

  const handleDeleteHackathon = async (hackathonId: number) => {
    if (!user) return;
    const res = await fetch('/api/hackathons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId, email: user.email })
    });
    if (res.ok) {
      setHackathons(prev => prev.filter(h => h.id !== hackathonId));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete hackathon');
    }
  };

  // Filter hackathons based on active filters
  const filteredHackathons = hackathons.filter(hackathon => {
    if (activeFilters.length === 0) return true;
    
    // Get the university for this hackathon
    const university = universities.find(u => u.name === hackathon.location);
    
    // Create an array of all searchable text
    const searchableText = [
      hackathon.location, // Include the hackathon's location directly
      ...(university ? [
        university.name,
        university.address.city,
        university.address.state,
        university.address.country
      ] : [])
    ].map(text => text.toLowerCase());

    // Check if any filter matches any part of the searchable text
    return activeFilters.some(filter => {
      const filterLower = filter.toLowerCase();
      return searchableText.some(text => {
        // Split the text into words and check if any word starts with the filter
        const words = text.split(/\s+/);
        return words.some((word: string) => word.startsWith(filterLower));
      });
    });
  });

  // Register user for hackathon
  const handleRegister = async (hackathonId: number) => {
    if (!user) return;
    const hackathon = hackathons.find(h => h.id === hackathonId);
    if (hackathon) {
      setSelectedHackathon(hackathon);
      setShowRegistrationModal(true);
    }
  };

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    if (!selectedHackathon || !user) return;

    // Add registration data to hackathon
    const updatedHackathon = {
      ...selectedHackathon,
      registeredStudents: [
        ...(selectedHackathon.registeredStudents || []),
        {
          userId: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          description: data.description
        }
      ]
    };

    // Update hackathon in backend
    const res = await fetch('/api/hackathons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        hackathonId: selectedHackathon.id, 
        registrationData: {
          userId: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          description: data.description
        }
      })
    });

    if (res.ok) {
      // Update local state
      setHackathons(prev => prev.map(h => 
        h.id === selectedHackathon.id ? updatedHackathon : h
      ));
      setShowRegistrationModal(false);
      setSelectedHackathon(null);
      
      // Refresh hackathons to ensure we have the latest data
      const refreshRes = await fetch('/api/hackathons');
      const updatedHackathons = await refreshRes.json();
      setHackathons(updatedHackathons);
    } else {
      const error = await res.json();
      if (error.error === 'Already registered') {
        alert('Already registered');
      } else {
        console.error('Failed to register:', error);
        alert('Failed to register for the hackathon. Please try again.');
      }
    }
  };

  const handleAddFilter = (university?: string) => {
    const filterToAdd = university || filterInput.trim();
    if (filterToAdd && !activeFilters.some(f => f.toLowerCase() === filterToAdd.toLowerCase())) {
      setActiveFilters([...activeFilters, filterToAdd]);
      setFilterInput("");
    }
  };

  // Search handler
  const handleSearch = () => {
    if (!search.trim()) return;
    const searchLower = search.toLowerCase();
    
    // Find a university by name
    const foundUniversity = universities.find(u => 
      u.name.toLowerCase().includes(searchLower)
    );

    if (foundUniversity) {
      if (mapRef.current) {
        mapRef.current.setView(foundUniversity.position, 8);
      }
      handleAddFilter(foundUniversity.name);
    }
  };

  const handleUniversityChange = async (university: string) => {
    if (!user) return;
    
    // Update user's university in the backend
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        university,
        email: user.email // Include email to identify user
      })
    });

    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      // Refresh users list
      const usersRes = await fetch('/api/users');
      setAllUsers(await usersRes.json());
    } else {
      const error = await res.json();
      console.error('Failed to update university:', error);
    }
  };

  const handleAddFilterFromInput = () => {
    handleAddFilter();
  };

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFilter();
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setIsLoggedIn(false);
    setEmail("");
    setShowMap(false);
    setSelectedCollege(null);
    setActiveFilters([]);
    localStorage.removeItem('user'); // Clear stored user data
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Auth Form - Fixed Sidebar */}
      <div className="w-full md:w-1/4 bg-white dark:bg-gray-900 shadow-lg z-10">
        <div className="sticky top-0 h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-xs">
            <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">HackConnect</h1>
            <p className="text-sm text-gray-600 mb-6 text-center">by Nishanth Chidambaram and Jayanthi Lahoti</p>
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
                <div className="flex flex-col gap-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors w-full"
                    onClick={() => setShowModal(true)}
                  >
                    Create New Post
                  </button>
                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition-colors w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with Show/Hide Map button after login */}
        {isLoggedIn && (
          <div className="w-full flex justify-center items-center py-4 bg-white dark:bg-gray-900 shadow z-30">
            <div className="flex gap-4 items-center">
              <select
                value={user?.university || ''}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select University</option>
                {collegeNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors"
                onClick={() => setShowMap(v => !v)}
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>
        )}

        {/* Map and Events Container */}
        <div className="flex-1 flex flex-col">
          {/* Map Section */}
          {(!isLoggedIn || showMap) && (
            <div className="h-[66vh] relative bg-gradient-to-br from-blue-100 to-blue-300">
              <MapView
                universities={universityStats}
                posts={posts}
                setSelectedCollege={setSelectedCollege}
                selectedCollege={selectedCollege}
                mapRef={mapRef}
                handleSearch={handleSearch}
                search={search}
                setSearch={setSearch}
                isLoggedIn={isLoggedIn}
                onClose={() => setShowMap(false)}
                onAddFilter={handleAddFilter}
              />
              {/* Posts Section for selected college */}
              {selectedCollege && (
                <div className="w-[80%] bg-white/90 rounded-lg shadow p-6 mt-6 mb-8 mx-auto">
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
                              {user && hackathon.registeredStudents.includes(user.id)
                                ? 'Registered'
                                : 'Register'}
                            </button>
                            <button
                              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                              onClick={() => {
                                setSelectedHackathonForStudents(hackathon);
                                setShowRegisteredStudentsModal(true);
                              }}
                            >
                              View Students ({hackathon.registeredStudents.length})
                            </button>
                            {user && hackathon.creatorEmail === user.email && (
                              <button
                                className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200 ml-2"
                                onClick={() => handleDeleteHackathon(hackathon.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Events Section */}
          <div className={`w-full max-w-4xl mx-auto ${isLoggedIn && !showMap ? 'mt-0' : 'mt-8'} mb-12 bg-white/95 rounded-xl shadow p-8`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">
                {selectedCollege ? `Hackathons at ${selectedCollege}` : 'All Hackathon Events'}
              </h2>
              {selectedCollege && (
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type university name to filter..."
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <button
                  onClick={handleAddFilterFromInput}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Filter
                </button>
              </div>
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <div
                      key={filter}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      <span>{filter}</span>
                      <button
                        onClick={() => handleRemoveFilter(filter)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="text-gray-500 text-sm">No hackathons found.</div>
            ) : (
              filteredHackathons.map((hackathon: any, i: number) => (
                <div key={i} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="font-semibold text-lg text-black">{hackathon.name}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {hackathon.location} • {new Date(hackathon.date).toLocaleString()}
                  </div>
                  <div className="text-sm mb-1 text-black">{hackathon.info}</div>
                  <a
                    href={hackathon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    {hackathon.website}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    Registered Students: {hackathon.registeredStudents.length}
                  </div>
                  {isLoggedIn ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => handleRegister(hackathon.id)}
                        disabled={user && hackathon.registeredStudents.includes(user.id)}
                      >
                        {user && hackathon.registeredStudents.includes(user.id)
                          ? 'Registered'
                          : 'Register'}
                      </button>
                      <button
                        className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                        onClick={() => {
                          setSelectedHackathonForStudents(hackathon);
                          setShowRegisteredStudentsModal(true);
                        }}
                      >
                        View Students ({hackathon.registeredStudents.length})
                      </button>
                      {user && hackathon.creatorEmail === user.email && (
                        <button
                          className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200 ml-2"
                          onClick={() => handleDeleteHackathon(hackathon.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal at root level for proper overlay */}
      <PostCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreatePost}
        colleges={collegeNames}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => {
          setShowRegistrationModal(false);
          setSelectedHackathon(null);
        }}
        onSubmit={handleRegistrationSubmit}
        hackathonName={selectedHackathon?.name || ''}
      />

      {/* Registered Students Modal */}
      <RegisteredStudentsModal
        isOpen={showRegisteredStudentsModal}
        onClose={() => {
          setShowRegisteredStudentsModal(false);
          setSelectedHackathonForStudents(null);
        }}
        hackathonName={selectedHackathonForStudents?.name || ''}
        registeredStudents={selectedHackathonForStudents?.registeredStudents || []}
      />
    </div>
  );
}
