import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import GridBackground from "../components/GridBackground";
import API_URL from "../config";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setMessage("You are already logged in!");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
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
          <div className="flex flex-col gap-4 p-6 md:p-8 w-full max-w-sm bg-black/40 border border-white/10 rounded-xl backdrop-blur-md text-center">
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
                setMessage("");
              }}
              className="w-full py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition"
            >
              Login with Different Account
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GridBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 p-6 md:p-8 w-full max-w-sm bg-black/40 border border-white/10 rounded-xl backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-white text-center">Login</h2>
          {message && (
            <div className="bg-white text-black text-sm text-center py-2 px-4 rounded-lg font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-white text-red-600 text-sm text-center py-2 px-4 rounded-lg font-medium">
              {error}
            </div>
          )}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-white/60 text-sm text-center mt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-white underline hover:text-white/80">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}