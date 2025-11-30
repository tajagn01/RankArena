import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [universityUsers, setUniversityUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user from localStorage:", storedUser);
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    console.log("Parsed user:", parsedUser);
    console.log("User stats:", parsedUser.stats);
    setUser(parsedUser);

    const fetchUniversityUsers = async () => {
      try {
        console.log("Fetching university users for:", parsedUser.university);
        const res = await fetch(`${API_URL}/api/auth/university-users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ university: parsedUser.university })
        });
        const data = await res.json();
        console.log("University users response:", data);
        if (res.ok) {
          const sorted = (data.users || []).sort(
            (a, b) => (b.stats?.totalSolved || 0) - (a.stats?.totalSolved || 0)
          );
          console.log("Sorted users:", sorted);
          setUniversityUsers(sorted);
        } else {
          console.error("Error response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch university users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityUsers();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  const stats = user?.stats || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
  const maxSolved = Math.max(stats.totalSolved, stats.easySolved, stats.mediumSolved, stats.hardSolved, 1);

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-12 relative">
      {/* Grid Background */}
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
      
      {/* Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)'
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
            <p className="text-white/60 mt-1">{user?.email} || {user?.university}</p>
          </div>

          {/* Stats Graph */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white mb-6">Your Progress</h2>
            <div className="flex flex-col gap-4">
              {/* Total Solved Bar */}
              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>Total Solved</span>
                  <span className="group-hover:text-white transition">{stats.totalSolved}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out group-hover:bg-white/80"
                    style={{ width: `${(stats.totalSolved / maxSolved) * 100}%` }}
                  />
                </div>
              </div>

              {/* Easy Solved Bar */}
              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-green-400/80 mb-1">
                  <span>Easy</span>
                  <span className="group-hover:text-green-300 transition">{stats.easySolved}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out delay-100 group-hover:bg-green-400"
                    style={{ width: `${(stats.easySolved / maxSolved) * 100}%` }}
                  />
                </div>
              </div>

              {/* Medium Solved Bar */}
              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-yellow-400/80 mb-1">
                  <span>Medium</span>
                  <span className="group-hover:text-yellow-300 transition">{stats.mediumSolved}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out delay-200 group-hover:bg-yellow-400"
                    style={{ width: `${(stats.mediumSolved / maxSolved) * 100}%` }}
                  />
                </div>
              </div>

              {/* Hard Solved Bar */}
              <div className="group cursor-pointer">
                <div className="flex justify-between text-sm text-red-400/80 mb-1">
                  <span>Hard</span>
                  <span className="group-hover:text-red-300 transition">{stats.hardSolved}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out delay-300 group-hover:bg-red-400"
                    style={{ width: `${(stats.hardSolved / maxSolved) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md hover:border-white/30 transition cursor-pointer">
              <p className="text-white/60 text-sm">Total Solved</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalSolved}</p>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-xl p-4 backdrop-blur-md hover:border-green-500/50 transition cursor-pointer">
              <p className="text-green-400/60 text-sm">Easy</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.easySolved}</p>
            </div>
            <div className="bg-black/40 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-md hover:border-yellow-500/50 transition cursor-pointer">
              <p className="text-yellow-400/60 text-sm">Medium</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.mediumSolved}</p>
            </div>
            <div className="bg-black/40 border border-red-500/20 rounded-xl p-4 backdrop-blur-md hover:border-red-500/50 transition cursor-pointer">
              <p className="text-red-400/60 text-sm">Hard</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.hardSolved}</p>
            </div>
          </div>

          {/* University Leaderboard */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-md">
           
            <h2 className="text-xl font-semibold text-white mb-6">
              {user?.university}  University Leaderboard
            </h2>
          
            
            {/* Desktop Table View */}
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
                  {universityUsers.map((u, index) => (
                    <tr
                      key={u._id || index}
                      className={`border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${
                        u.email === user?.email ? "bg-white/10" : ""
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <span className={`font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white/60"}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white">
                        {u.name}
                        {u.email === user?.email && <span className="text-xs text-white/40 ml-2">(You)</span>}
                      </td>
                      <td className="py-3 pr-4 text-white/60">{u.leetcodeUsername}</td>
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {universityUsers.map((u, index) => (
                <div
                  key={u._id || index}
                  className={`border border-white/10 rounded-lg p-4 ${
                    u.email === user?.email ? "bg-white/10 border-white/20" : "bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white/60"}`}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">
                          {u.name}
                          {u.email === user?.email && <span className="text-xs text-white/40 ml-1">(You)</span>}
                        </p>
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
            </div>
          </div>
        </div>
      </div>
  );
}
