import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GridBackground from "../components/GridBackground";
import API_URL from "../config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log("Login response:", data);
      
      // Check if email verification is required
      if (data.requiresVerification) {
        navigate("/verify-email", { state: { email } });
        return;
      }
      
      if (!res.ok) throw new Error(data.error || "Login failed");
      console.log("User data to store:", data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/dashboard");
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
          <h2 className="text-2xl font-bold text-white text-center">Login</h2>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:border-white/30 placeholder:text-white/40"
            placeholder="Email"
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