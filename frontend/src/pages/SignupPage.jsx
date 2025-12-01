import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import GridBackground from "../components/GridBackground";
import API_URL from "../config";

const universities = [
  "Parul University",
  "Nirma University, Ahmedabad",
  "Maharaja Sayajirao University of Baroda",
  "Gujarat University, Ahmedabad"
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, university, leetcodeUsername })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GridBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 md:p-8 w-full max-w-sm bg-black/40 border border-white/10 rounded-xl backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-white text-center">Sign Up</h2>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center">{success}</p>}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
            placeholder="Password"
            required
          />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-full px-4 py-2 pr-10 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 text-left cursor-pointer ${university ? 'text-white' : 'text-white/40'}`}
            >
              {university || "Select University"}
            </button>
            <svg
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            
            {/* Custom Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden z-50">
                {universities.map((uni) => (
                  <div
                    key={uni}
                    onClick={() => {
                      setUniversity(uni);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer transition hover:bg-white/10 ${university === uni ? 'bg-white/10 text-white' : 'text-white/70'}`}
                  >
                    {uni}
                  </div>
                ))}
              </div>
            )}
            
            {/* Hidden input for form validation */}
            <input
              type="text"
              value={university}
              required
              className="sr-only"
              onChange={() => {}}
            />
          </div>
          <input
            type="text"
            value={leetcodeUsername}
            onChange={e => setLeetcodeUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
            placeholder="LeetCode Username"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <p className="text-white/60 text-sm text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-white underline hover:text-white/80">
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}