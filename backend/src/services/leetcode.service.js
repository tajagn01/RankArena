import axios from "axios";
import { createRedisConnection } from "../config/redis.js";

const redis = createRedisConnection(process.env.REDIS_URL || "redis://localhost:6379");

// Helper to safely use Redis (returns null if Redis unavailable)
async function safeRedisGet(key) {
  if (redis.status !== 'ready') return null;
  try {
    return await redis.get(key);
  } catch (err) {
    return null;
  }
}

async function safeRedisSet(key, value, ttl) {
  if (redis.status !== 'ready') return;
  try {
    await redis.setex(key, ttl, value);
  } catch (err) {
    // Silent fail - caching is optional
  }
}

export async function fetchLeetCodeUser(username) {
  const cacheKey = `leetcode:${username}`;

  try {
    // Check cache first (cache lasts 4 hours)
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      console.log(`📦 Cache hit for user: ${username}`);
      return data;
    }
  } catch (err) {
    // Continue if cache fails
  }

  const QUERY = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          countryName
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: QUERY,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://leetcode.com/",
          "Origin": "https://leetcode.com"
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const user = response.data?.data?.matchedUser;
    if (!user) return null;

    const statsArr = user.submitStats.acSubmissionNum;
    const country = user.profile?.countryName || null;

    const data = {
      username: user.username,
      ranking: user.profile?.ranking ?? null,
      country: country,
      totalSolved: statsArr.find(x => x.difficulty === "All")?.count || 0,
      easySolved: statsArr.find(x => x.difficulty === "Easy")?.count || 0,
      mediumSolved: statsArr.find(x => x.difficulty === "Medium")?.count || 0,
      hardSolved: statsArr.find(x => x.difficulty === "Hard")?.count || 0,
      lastUpdated: new Date()
    };

    console.log(`✅ Fetched LeetCode user: ${username} - Solved: ${data.totalSolved}`);

    // Cache the result for 4 hours (14400 seconds)
    try {
      await safeRedisSet(cacheKey, JSON.stringify(data), 14400);
    } catch (err) {
      // Continue if caching fails
    }

    return data;

  } catch (err) {
    console.error("❌ LeetCode fetch failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
      throw new Error(`LeetCode Blocked or Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

export async function fetchLeetCodeTotals() {
  const cacheKey = "leetcode:totals";

  try {
    // Check cache first (cache lasts 24 hours)
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      console.log(`📦 Cache hit for LeetCode totals`);
      return data;
    }
  } catch (err) {
    // Continue if cache fails
  }

  const QUERY = `
    query globalData {
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query: QUERY },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 RankArena"
        }
      }
    );

    const allQuestionsCount = response.data?.data?.allQuestionsCount || [];

    // Extract counts for each difficulty
    const easyCount = allQuestionsCount.find(c => c.difficulty === "Easy")?.count || 0;
    const mediumCount = allQuestionsCount.find(c => c.difficulty === "Medium")?.count || 0;
    const hardCount = allQuestionsCount.find(c => c.difficulty === "Hard")?.count || 0;

    // Calculate total from Easy + Medium + Hard (not including "All" to avoid duplication)
    const total = easyCount + mediumCount + hardCount;

    const data = {
      total: total || 3802,
      easy: easyCount || 921,
      medium: mediumCount || 1982,
      hard: hardCount || 899,
      lastUpdated: new Date()
    };

    console.log('Fetched LeetCode totals:', data);

    // Cache the result for 24 hours (86400 seconds)
    try {
      await safeRedisSet(cacheKey, JSON.stringify(data), 86400);
    } catch (err) {
      // Continue if caching fails
    }

    return data;

  } catch (err) {
    console.warn('Failed to fetch LeetCode totals:', err.message);
    // Return default fallback (as of Jan 2026)
    return {
      total: 3802,
      easy: 921,
      medium: 1982,
      hard: 899,
      lastUpdated: new Date()
    };
  }
}
