"use client";

import { useState } from "react";

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    link: string;
    type: "Hackathon Team" | "Side Project Team";
    description?: string;
    college: string;
  }) => void;
  colleges: string[];
}

export default function PostCreationModal({ isOpen, onClose, onSubmit, colleges }: PostCreationModalProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"Hackathon Team" | "Side Project Team">("Hackathon Team");
  const [description, setDescription] = useState("");
  const [college, setCollege] = useState(colleges[0] || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!validateUrl(link)) {
      setError("Please enter a valid URL");
      return;
    }
    setError("");
    onSubmit({ title, link, type, description, college });
    setTitle("");
    setLink("");
    setType("Hackathon Team");
    setDescription("");
    setCollege(colleges[0] || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Create New Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="url"
            placeholder="Link (e.g. project repo, hackathon page)"
            value={link}
            onChange={e => setLink(e.target.value)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={type}
            onChange={e => setType(e.target.value as any)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Hackathon Team">Hackathon Team</option>
            <option value="Side Project Team">Side Project Team</option>
          </select>
          <select
            value={college}
            onChange={e => setCollege(e.target.value)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors mt-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
} 