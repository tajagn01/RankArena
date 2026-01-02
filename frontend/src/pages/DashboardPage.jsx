import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

const CACHE_KEY = "universityUsersCache";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [universityUsers, setUniversityUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mounted || loading) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setVisibleCount(prev => {
          if (prev < universityUsers.length) {
            return Math.min(prev + 10, universityUsers.length);
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, loading, universityUsers.length]);

  const getCachedData = (university) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp, uni } = JSON.parse(cached);
        if (uni === university && Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
    } catch (e) {}
    return null;
  };

  const setCachedData = (university, data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
        uni: university
      }));
    } catch (e) {}
  };

  const fetchUniversityUsers = async (university, currentUserName, isBackground = false) => {
    try {
      if (isBackground) setIsFetchingBackground(true);
      
      const res = await fetch(`${API_URL}/api/auth/university-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university })
      });
      const data = await res.json();
      if (res.ok) {
        const sorted = (data.users || []).sort(
          (a, b) => (b.stats?.totalSolved || 0) - (a.stats?.totalSolved || 0)
        );
        setUniversityUsers(sorted);
        setCachedData(university, sorted);
        
        const foundUser = sorted.find(u => u.name === currentUserName);
        if (foundUser) {
          setUser(prevUser => {
            const updatedUser = { ...prevUser, stats: foundUser.stats };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      }
    } catch (err) {
    } finally {
      if (isBackground) setIsFetchingBackground(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    
    try {
      const res = await fetch(`${API_URL}/api/refresh-university`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: user?.university })
      });
      
      if (res.ok) {
        await fetchUniversityUsers(user?.university, user?.name, false);
        setLastRefresh(new Date());
      }
    } catch (err) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const cachedData = getCachedData(parsedUser.university);
    if (cachedData) {
      setUniversityUsers(cachedData);
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
      fetchUniversityUsers(parsedUser.university, parsedUser.name, true);
    } else {
      const loadData = async () => {
        await fetchUniversityUsers(parsedUser.university, parsedUser.name, false);
        setLoading(false);
        setTimeout(() => setMounted(true), 50);
      };
      loadData();
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <span 
            className="w-3 h-3 bg-white rounded-full animate-bounce" 
            style={{ animationDelay: '0ms', animationDuration: '600ms' }}
          />
          <span 
            className="w-3 h-3 bg-white rounded-full animate-bounce" 
            style={{ animationDelay: '150ms', animationDuration: '600ms' }}
          />
          <span 
            className="w-3 h-3 bg-white rounded-full animate-bounce" 
            style={{ animationDelay: '300ms', animationDuration: '600ms' }}
          />
        </div>
        <p className="text-white/60 text-sm">Loading dashboard</p>
      </div>
    );
  }

  const stats = user?.stats || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
  const TOTAL_LEETCODE_QUESTIONS = 3768;
  const TOTAL_EASY = 915;
  const TOTAL_MEDIUM = 1960;
  const TOTAL_HARD = 888;
  const maxSolved = Math.max(stats.totalSolved, stats.easySolved, stats.mediumSolved, stats.hardSolved, 1);

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-12 relative">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)'
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
          <div className={`mb-8 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
            <p className="text-white/60 mt-1">@{user?.leetcodeUsername} | {user?.university}</p>
          </div>

          <div className={`bg-black/40 border border-white/10 rounded-xl p-6 mb-6 backdrop-blur-md transition-all duration-700 ease-out delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-xl font-semibold text-white mb-6">Your Progress</h2>
            <div className="flex flex-col gap-4">
              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Total Solved</span>
                  <span className="group-hover:text-white transition">{stats.totalSolved} / {TOTAL_LEETCODE_QUESTIONS}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out group-hover:bg-white/80"
                    style={{ width: `${(stats.totalSolved / TOTAL_LEETCODE_QUESTIONS) * 100}%` }}
                  />
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-green-400/80 mb-1">
                  <span>Easy</span>
                  <span className="group-hover:text-green-300 transition">{stats.easySolved} / {TOTAL_EASY}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out delay-100 group-hover:bg-green-400"
                    style={{ width: `${(stats.easySolved / TOTAL_EASY) * 100}%` }}
                  />
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-yellow-400/80 mb-1">
                  <span>Medium</span>
                  <span className="group-hover:text-yellow-300 transition">{stats.mediumSolved} / {TOTAL_MEDIUM}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out delay-200 group-hover:bg-yellow-400"
                    style={{ width: `${(stats.mediumSolved / TOTAL_MEDIUM) * 100}%` }}
                  />
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-red-400/80 mb-1">
                  <span>Hard</span>
                  <span className="group-hover:text-red-300 transition">{stats.hardSolved} / {TOTAL_HARD}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out delay-300 group-hover:bg-red-400"
                    style={{ width: `${(stats.hardSolved / TOTAL_HARD) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md hover:border-white/30 transition cursor-pointer">
              <p className="text-white/60 text-sm">Total Solved</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalSolved}<span className="text-sm font-normal text-white/50"> / {TOTAL_LEETCODE_QUESTIONS}</span></p>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-4 backdrop-blur-md hover:border-green-500/50 transition cursor-pointer">
              <p className="text-green-400/60 text-sm">Easy</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.easySolved}<span className="text-sm font-normal text-green-400/50"> / {TOTAL_EASY}</span></p>
            </div>
            <div className="bg-black/40 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-md hover:border-yellow-500/50 transition cursor-pointer">
              <p className="text-yellow-400/60 text-sm">Medium</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.mediumSolved}<span className="text-sm font-normal text-yellow-400/50"> / {TOTAL_MEDIUM}</span></p>
            </div>
            <div className="bg-black/40 border border-red-500/20 rounded-xl p-4 backdrop-blur-md hover:border-red-500/50 transition cursor-pointer">
              <p className="text-red-400/60 text-sm">Hard</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.hardSolved}<span className="text-sm font-normal text-red-400/50"> / {TOTAL_HARD}</span></p>
            </div>
          </div>

          <div className={`bg-black/40 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md hover:border-white/30 transition-all duration-700 ease-out delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-white/60 text-sm">Your Rank in {user?.university}</p>
                <p className="text-4xl font-bold text-white mt-2">
                  #{universityUsers.findIndex(u => u.name === user?.name) + 1 || '-'}
                  <span className="text-lg font-normal text-white/50"> / {universityUsers.length}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {universityUsers.findIndex(u => u.name === user?.name) === 0 && (
                  <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20">🏆 Top Performer</span>
                )}
                {universityUsers.findIndex(u => u.name === user?.name) > 0 && universityUsers.findIndex(u => u.name === user?.name) <= 2 && (
                  <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20">🎯 Top 3</span>
                )}
                {universityUsers.findIndex(u => u.name === user?.name) > 2 && (
                  <span className="px-3 py-1 bg-white/10 text-blue-400 text-sm rounded-full border border-white/20">📈 Keep Going!</span>
                )}
              </div>
            </div>
          </div>

          <div className={`bg-black/40 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-md transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
           
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-base md:text-xl font-semibold text-white">
                {user?.university} Leaderboard
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition disabled:opacity-50"
                title="Refresh Stats"
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden md:inline">{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
              </button>
            </div>
            
            {lastRefresh && (
              <p className="text-white/40 text-xs mb-4">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>
            )}

            {isFetchingBackground && (
              <p className="text-blue-400/60 text-xs mb-4 flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Updating data...
              </p>
            )}
            
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/60 text-sm border-b border-white/10">
                    <th className="pb-3 pr-4">Rank</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">LeetCode</th>
                    <th className="pb-3 pr-4 text-center">Total</th>
                    <th className="pb-3 pr-4 text-center text-green-400">Easy</th>
                    <th className="pb-3 pr-4 text-center text-yellow-400">Medium</th>
                    <th className="pb-3 text-center text-red-400">Hard</th>
                  </tr>
                </thead>
                <tbody>
                  {universityUsers.slice(0, visibleCount).map((u, index) => (
                    <tr
                      key={u._id || index}
                      className={`border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${
                        u.name === user?.name ? "bg-white/10" : ""
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <span className={`font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white/60"}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white">
                        <a
                          href={`https://leetcode.com/u/${u.leetcodeUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 hover:underline transition"
                        >
                          {u.name}
                        </a>
                        {u.name === user?.name && <span className="text-xs text-white/40 ml-2">(You)</span>}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        <a
                          href={`https://leetcode.com/u/${u.leetcodeUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 hover:underline transition"
                        >
                          {u.leetcodeUsername}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-center text-white font-semibold">{u.stats?.totalSolved || 0}</td>
                      <td className="py-3 pr-4 text-center text-green-400">{u.stats?.easySolved || 0}</td>
                      <td className="py-3 pr-4 text-center text-yellow-400">{u.stats?.mediumSolved || 0}</td>
                      <td className="py-3 text-center text-red-400">{u.stats?.hardSolved || 0}</td>
                    </tr>
                  ))}
                  {universityUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-white/40">
                        No users found from your university.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {visibleCount < universityUsers.length && (
                <div className="py-4 text-center">
                  <p className="text-white/40 text-sm">Scroll for more...</p>
                </div>
              )}
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {universityUsers.slice(0, visibleCount).map((u, index) => (
                <div
                  key={u._id || index}
                  className={`border border-white/10 rounded-lg p-4 ${
                    u.name === user?.name ? "bg-white/10 border-white/20" : "bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white/60"}`}>
                        #{index + 1}
                      </span>
                      <div>
                        <a
                          href={`https://leetcode.com/u/${u.leetcodeUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-blue-400 hover:underline transition"
                        >
                          {u.name}
                        </a>
                        {u.name === user?.name && <span className="text-xs text-white/40 ml-1">(You)</span>}
                        <p className="text-white/40 text-xs">@{u.leetcodeUsername}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{u.stats?.totalSolved || 0}</p>
                      <p className="text-white/40 text-xs">solved</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">E: {u.stats?.easySolved || 0}</span>
                    <span className="text-yellow-400">M: {u.stats?.mediumSolved || 0}</span>
                    <span className="text-red-400">H: {u.stats?.hardSolved || 0}</span>
                  </div>
                </div>
              ))}
              {universityUsers.length === 0 && (
                <p className="py-6 text-center text-white/40">
                  No users found from your university.
                </p>
              )}
              {visibleCount < universityUsers.length && (
                <div className="py-4 text-center">
                  <p className="text-white/40 text-sm">Scroll for more...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
