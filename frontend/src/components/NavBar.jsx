import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className="fixed z-50 w-full top-0 left-0 backdrop-blur-2xl">
      <nav className="w-full py-3 px-6 bg-transparent backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <img src="/logo.svg" alt="RankArena Logo" className="h-6 w-6" />
            </div>
            <span className="text-white text-lg font-semibold">RankArena</span>

          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleDashboard}
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition transform active:scale-95 hover:cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium transition transform active:scale-95 hover:cursor-pointer hover:bg-white/90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition transform active:scale-95 hover:cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={handleSignup}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-medium transition transform active:scale-95 hover:cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* MOBILE: hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10"
            >
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE PANEL */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide Panel */}
        <aside
          className={`absolute top-0 right-0 h-dvh w-64 bg-[#21242bc5] border-l border-white/10 p-5 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-white font-semibold text-lg">
              RankArena
            </span>

            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-white/10"
            >
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleDashboard();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition active:scale-95"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium transition active:scale-95 hover:bg-white/90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogin();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition active:scale-95"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignup();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 text-sm font-medium transition active:scale-95"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-5 left-5 text-xs text-white/60">
            © RankArena builded by tajagn
          </div>
        </aside>
      </div>
    </header>
  );
}
