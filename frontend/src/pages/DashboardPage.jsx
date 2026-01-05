import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const CACHE_KEY = "universityUsersCache";
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const TOTAL_LEETCODE_QUESTIONS = 3768;
const TOTAL_EASY = 915;
const TOTAL_MEDIUM = 1960;
const TOTAL_HARD = 888;
const INITIAL_VISIBLE = 10;
const LOAD_MORE_COUNT = 10;
const SCROLL_THRESHOLD = 300;

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
const getCachedData = (university) => {
  if (!university) return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp, uni } = JSON.parse(cached);
    if (uni === university && Date.now() - timestamp < CACHE_EXPIRY && Array.isArray(data)) {
      return data;
    }
  } catch {
    // Silent fail - cache miss
  }
  return null;
};

const setCachedData = (university, data) => {
  if (!university || !Array.isArray(data)) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
      uni: university
    }));
  } catch {
    // Silent fail - cache full or disabled
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SAFE DATA ACCESSORS
// ═══════════════════════════════════════════════════════════════════════════════
const getStats = (user) => ({
  totalSolved: user?.stats?.totalSolved ?? 0,
  easySolved: user?.stats?.easySolved ?? 0,
  mediumSolved: user?.stats?.mediumSolved ?? 0,
  hardSolved: user?.stats?.hardSolved ?? 0,
});

const getUserRank = (users, userName) => {
  if (!Array.isArray(users) || !userName) return -1;
  return users.findIndex(u => u?.name === userName);
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const LoadingScreen = () => (
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

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const ProgressBar = React.memo(({ label, solved, total, colorClass, bgClass, delay = 0 }) => (
  <div className="group cursor-pointer">
    <div className={`flex justify-between text-sm ${colorClass} mb-1`}>
      <span>{label}</span>
      <span className="group-hover:brightness-125 transition">{solved} / {total}</span>
    </div>
    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full ${bgClass} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
        style={{ 
          width: `${Math.min((solved / total) * 100, 100)}%`,
          transitionDelay: `${delay}ms`
        }}
      />
    </div>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const StatCard = React.memo(({ label, solved, total, colorClass, borderClass }) => (
  <div className={`bg-black/40 border ${borderClass} rounded-xl p-4 backdrop-blur-md hover:brightness-125 transition cursor-pointer`}>
    <p className={`${colorClass} text-sm opacity-60`}>{label}</p>
    <p className={`text-2xl font-bold ${colorClass} mt-1`}>
      {solved}
      <span className="text-sm font-normal opacity-50"> / {total}</span>
    </p>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════════
// TIME AGO HELPER
// ═══════════════════════════════════════════════════════════════════════════════
const getTimeAgo = (timestamp) => {
  if (!timestamp) return null;
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD ROW COMPONENT (Desktop)
// ═══════════════════════════════════════════════════════════════════════════════
const LeaderboardRow = React.memo(({ user: u, index, isCurrentUser }) => {
  const rankColor = index === 0 ? "text-yellow-400" 
    : index === 1 ? "text-gray-300" 
    : index === 2 ? "text-orange-400" 
    : "text-white/60";

  return (
    <tr className={`border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${isCurrentUser ? "bg-white/10" : ""}`}>
      <td className="py-3 pr-2 w-16">
        <span className={`font-bold ${rankColor}`}>#{index + 1}</span>
      </td>
      <td className="py-3 pr-2 max-w-[140px]">
        <a
          href={`https://leetcode.com/u/${u.leetcodeUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-blue-400 hover:underline transition block truncate"
          title={u.name}
        >
          {u.name}
        </a>
        {isCurrentUser && <span className="text-xs text-white/40">(You)</span>}
      </td>
      <td className="py-3 pr-2 max-w-[160px]">
        <a
          href={`https://leetcode.com/u/${u.leetcodeUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-blue-400 hover:underline transition block truncate"
          title={u.leetcodeUsername}
        >
          {u.leetcodeUsername}
        </a>
      </td>
      <td className="py-3 pr-2 text-center text-white font-semibold w-16">{u.stats?.totalSolved ?? 0}</td>
      <td className="py-3 pr-2 text-center text-green-400 w-14">{u.stats?.easySolved ?? 0}</td>
      <td className="py-3 pr-2 text-center text-yellow-400 w-14">{u.stats?.mediumSolved ?? 0}</td>
      <td className="py-3 text-center text-red-400 w-14">{u.stats?.hardSolved ?? 0}</td>
    </tr>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD CARD COMPONENT (Mobile)
// ═══════════════════════════════════════════════════════════════════════════════
const LeaderboardCard = React.memo(({ user: u, index, isCurrentUser }) => {
  const rankColor = index === 0 ? "text-yellow-400" 
    : index === 1 ? "text-gray-300" 
    : index === 2 ? "text-orange-400" 
    : "text-white/60";

  return (
    <div className={`border border-white/10 rounded-lg p-3 ${isCurrentUser ? "bg-white/10 border-white/20" : "bg-black/20"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className={`text-base font-bold ${rankColor} shrink-0`}>#{index + 1}</span>
          <div className="min-w-0 flex-1">
            <a
              href={`https://leetcode.com/u/${u.leetcodeUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-blue-400 hover:underline transition block truncate text-sm"
            >
              {u.name}
              {isCurrentUser && <span className="text-white/40 ml-1">(You)</span>}
            </a>
            <p className="text-white/40 text-xs truncate">@{u.leetcodeUsername}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-bold text-base">{u.stats?.totalSolved ?? 0}</p>
          <p className="text-white/40 text-xs">solved</p>
        </div>
      </div>
      <div className="flex justify-between text-xs pt-2 border-t border-white/5">
        <span className="text-green-400">Easy: {u.stats?.easySolved ?? 0}</span>
        <span className="text-yellow-400">Med: {u.stats?.mediumSolved ?? 0}</span>
        <span className="text-red-400">Hard: {u.stats?.hardSolved ?? 0}</span>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// RANK BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const RankBadge = React.memo(({ rank }) => {
  if (rank === 0) {
    return <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20">🏆 Top Performer</span>;
  }
  if (rank > 0 && rank <= 2) {
    return <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full border border-white/20">🎯 Top 3</span>;
  }
  if (rank > 2) {
    return <span className="px-3 py-1 bg-white/10 text-blue-400 text-sm rounded-full border border-white/20">📈 Keep Going!</span>;
  }
  return null;
});

// ═══════════════════════════════════════════════════════════════════════════════
// REFRESH BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const RefreshButton = React.memo(({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    title="Refresh Stats"
  >
    <svg 
      className={`w-5 h-5 ${disabled ? 'animate-spin' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span className="hidden md:inline">{disabled ? "Refreshing..." : "Refresh Stats"}</span>
  </button>
));

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [universityUsers, setUniversityUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [dataFetchedAt, setDataFetchedAt] = useState(null);
  
  const navigate = useNavigate();
  
  // ─────────────────────────────────────────────────────────────────────────────
  // REFS (prevent stale closures and race conditions)
  // ─────────────────────────────────────────────────────────────────────────────
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);
  const leaderboardRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // MEMOIZED VALUES
  // ─────────────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => getStats(user), [user]);
  const userRank = useMemo(() => getUserRank(universityUsers, user?.name), [universityUsers, user?.name]);
  const visibleUsers = useMemo(() => universityUsers.slice(0, visibleCount), [universityUsers, visibleCount]);
  const hasMoreUsers = visibleCount < universityUsers.length;

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH UNIVERSITY USERS (stable callback)
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchUniversityUsers = useCallback(async (university, currentUserName, isBackground = false) => {
    if (!university || fetchInProgressRef.current) return;
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    fetchInProgressRef.current = true;
    
    if (isBackground) {
      setIsFetchingBackground(true);
    }
    
    try {
      const res = await fetch(`${API_URL}/api/auth/university-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!isMountedRef.current) return;
      
      // Safe array extraction
      const users = Array.isArray(data) ? data 
        : Array.isArray(data?.users) ? data.users 
        : [];
      
      // Sort by total solved
      const sorted = [...users].sort(
        (a, b) => (b?.stats?.totalSolved ?? 0) - (a?.stats?.totalSolved ?? 0)
      );
      
      setUniversityUsers(sorted);
      setCachedData(university, sorted);
      setDataFetchedAt(Date.now());
      setError(null);
      
      // Update current user stats if found
      if (currentUserName) {
        const foundUser = sorted.find(u => u?.name === currentUserName);
        if (foundUser?.stats) {
          setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, stats: foundUser.stats };
            try {
              localStorage.setItem("user", JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Intentional cancellation
      
      if (isMountedRef.current) {
        console.error('Fetch error:', err);
        if (!isBackground) {
          setError('Failed to load leaderboard. Please try again.');
        }
      }
    } finally {
      fetchInProgressRef.current = false;
      if (isMountedRef.current) {
        setIsFetchingBackground(false);
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLE REFRESH (with debounce protection)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (refreshing || !user?.university) return;
    
    setRefreshing(true);
    
    try {
      const res = await fetch(`${API_URL}/api/refresh-university`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: user.university }),
      });
      
      if (res.ok) {
        await fetchUniversityUsers(user.university, user.name, false);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [refreshing, user?.university, user?.name, fetchUniversityUsers]);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOAD MORE (for infinite scroll)
  // ─────────────────────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, universityUsers.length));
  }, [universityUsers.length]);

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIAL DATA LOAD
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    
    const initDashboard = async () => {
      // Check authentication
      let storedUser;
      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          navigate("/login");
          return;
        }
        storedUser = JSON.parse(stored);
      } catch {
        navigate("/login");
        return;
      }
      
      if (!storedUser?.university) {
        navigate("/login");
        return;
      }
      
      setUser(storedUser);
      
      // Try cache first (stale-while-revalidate)
      const cached = getCachedData(storedUser.university);
      
      // Get cache timestamp
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const { timestamp } = JSON.parse(cachedRaw);
          setDataFetchedAt(timestamp);
        }
      } catch {}
      
      if (cached && cached.length > 0) {
        setUniversityUsers(cached);
        setLoading(false);
        // Trigger animation after paint
        requestAnimationFrame(() => {
          setTimeout(() => setMounted(true), 50);
        });
        // Background revalidation
        fetchUniversityUsers(storedUser.university, storedUser.name, true);
      } else {
        // No cache - full load
        await fetchUniversityUsers(storedUser.university, storedUser.name, false);
        setLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => setMounted(true), 50);
        });
      }
    };
    
    initDashboard();
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [navigate, fetchUniversityUsers]);

  // ─────────────────────────────────────────────────────────────────────────────
  // INFINITE SCROLL HANDLER (throttled)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || loading) return;
    
    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD) {
          if (visibleCount < universityUsers.length) {
            loadMore();
          }
        }
        ticking = false;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, loading, visibleCount, universityUsers.length, loadMore]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingScreen />;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: MAIN DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-page min-h-screen bg-black pt-24 px-4 pb-12 relative">
      {/* Grid Background - GPU accelerated */}
      <div 
        className="absolute inset-0 pointer-events-none will-change-auto"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          contain: 'strict'
        }}
      />
      
      {/* Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)',
          contain: 'strict'
        }}
      />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className={`mb-8 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
          <p className="text-white/60 mt-1">@{user?.leetcodeUsername} | {user?.university}</p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROGRESS SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className={`bg-black/40 border border-white/10 rounded-xl p-6 mb-6 backdrop-blur-md transition-all duration-700 ease-out delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-xl font-semibold text-white mb-6">Your Progress</h2>
          <div className="flex flex-col gap-4">
            <ProgressBar 
              label="Total Solved" 
              solved={stats.totalSolved} 
              total={TOTAL_LEETCODE_QUESTIONS}
              colorClass="text-white/80"
              bgClass="bg-white"
              delay={0}
            />
            <ProgressBar 
              label="Easy" 
              solved={stats.easySolved} 
              total={TOTAL_EASY}
              colorClass="text-green-400/80"
              bgClass="bg-green-500"
              delay={100}
            />
            <ProgressBar 
              label="Medium" 
              solved={stats.mediumSolved} 
              total={TOTAL_MEDIUM}
              colorClass="text-yellow-400/80"
              bgClass="bg-yellow-500"
              delay={200}
            />
            <ProgressBar 
              label="Hard" 
              solved={stats.hardSolved} 
              total={TOTAL_HARD}
              colorClass="text-red-400/80"
              bgClass="bg-red-500"
              delay={300}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATS CARDS GRID */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StatCard label="Total Solved" solved={stats.totalSolved} total={TOTAL_LEETCODE_QUESTIONS} colorClass="text-white" borderClass="border-white/10 hover:border-white/30" />
          <StatCard label="Easy" solved={stats.easySolved} total={TOTAL_EASY} colorClass="text-green-400" borderClass="border-green-500/20 hover:border-green-500/50" />
          <StatCard label="Medium" solved={stats.mediumSolved} total={TOTAL_MEDIUM} colorClass="text-yellow-400" borderClass="border-yellow-500/20 hover:border-yellow-500/50" />
          <StatCard label="Hard" solved={stats.hardSolved} total={TOTAL_HARD} colorClass="text-red-400" borderClass="border-red-500/20 hover:border-red-500/50" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RANK SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className={`bg-black/40 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md hover:border-white/30 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '250ms' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/60 text-sm">Your Rank in {user?.university}</p>
              <p className="text-4xl font-bold text-white mt-2">
                #{userRank >= 0 ? userRank + 1 : '-'}
                <span className="text-lg font-normal text-white/50"> / {universityUsers.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RankBadge rank={userRank} />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEADERBOARD SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div 
          ref={leaderboardRef}
          className={`leaderboard-section bg-black/40 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-md transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-base md:text-xl font-semibold text-white">
              {user?.university} Leaderboard
            </h2>
            <RefreshButton onClick={handleRefresh} disabled={refreshing} />
          </div>
          
          {/* Status Messages */}
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

          {error && (
            <p className="text-red-400/80 text-sm mb-4">{error}</p>
          )}

          {/* Data freshness indicator */}
          {dataFetchedAt && !isFetchingBackground && (
            <p className="text-white/30 text-xs mb-4 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Data fetched {getTimeAgo(dataFetchedAt)}
            </p>
          )}
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto leaderboard-scroll">
            <table className="w-full table-fixed">
              <thead>
                <tr className="text-left text-white/60 text-sm border-b border-white/10">
                  <th className="pb-3 pr-2 w-16">Rank</th>
                  <th className="pb-3 pr-2 w-[140px]">Name</th>
                  <th className="pb-3 pr-2 w-[160px]">LeetCode</th>
                  <th className="pb-3 pr-2 text-center w-16">Total</th>
                  <th className="pb-3 pr-2 text-center text-green-400 w-14">Easy</th>
                  <th className="pb-3 pr-2 text-center text-yellow-400 w-14">Med</th>
                  <th className="pb-3 text-center text-red-400 w-14">Hard</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u, index) => (
                  <LeaderboardRow 
                    key={u._id || `user-${index}`}
                    user={u}
                    index={index}
                    isCurrentUser={u?.name === user?.name}
                  />
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
            {hasMoreUsers && (
              <div className="py-4 text-center">
                <p className="text-white/40 text-sm">Scroll for more...</p>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 leaderboard-scroll">
            {visibleUsers.map((u, index) => (
              <LeaderboardCard 
                key={u._id || `user-${index}`}
                user={u}
                index={index}
                isCurrentUser={u?.name === user?.name}
              />
            ))}
            {universityUsers.length === 0 && (
              <p className="py-6 text-center text-white/40">
                No users found from your university.
              </p>
            )}
            {hasMoreUsers && (
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
