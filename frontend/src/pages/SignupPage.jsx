import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import GridBackground from "../components/GridBackground";
import Toast from "../components/Toast";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
    }
    setTimeout(() => setMounted(true), 50);
  }, []);

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

  if (isLoggedIn) {
    return (
      <>
        <GridBackground />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className={`flex flex-col gap-4 p-6 md:p-8 w-full max-w-sm bg-black/40 border border-white/10 rounded-xl backdrop-blur-md text-center transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <h2 className="text-2xl font-bold text-white">Already Logged In</h2>
            <div className="bg-white text-black text-sm py-2 px-4 rounded-lg font-medium">
              You are already logged in!
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("storage"));
                setIsLoggedIn(false);
              }}
              className="w-full py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition"
            >
              Create New Account
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GridBackground />
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" onClose={() => setError("")} />
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className={`flex flex-col gap-4 p-6 md:p-8 w-full max-w-sm bg-black/40 border border-white/10 rounded-xl backdrop-blur-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
        >
          <h2 className="text-2xl font-bold text-white text-center">Sign Up</h2>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
            placeholder="Username"
            required
          />
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
              placeholder="Password"
              minLength={6}
              required
            />
            <p className="text-white/40 text-xs mt-1">Minimum 6 characters</p>
          </div>
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