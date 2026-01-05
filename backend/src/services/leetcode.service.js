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
    // Check cache first
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
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
          "User-Agent": "Mozilla/5.0 RankArena"
        }
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

    // Cache the result for 24 hours (86400 seconds)
    try {
      await safeRedisSet(cacheKey, JSON.stringify(data), 86400);
    } catch (err) {
      // Continue if caching fails
    }

    return data;

  } catch (err) {
    return null;
  }
}

export async function fetchLeetCodeTotals() {
  const cacheKey = "leetcode:totals";
  
  try {
    // Check cache first
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
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
    
    // Calculate total from difficulty counts
    const total = allQuestionsCount.reduce((sum, c) => sum + c.count, 0);
    
    const data = {
      total: total || 3768,
      easy: allQuestionsCount.find(c => c.difficulty === "Easy")?.count || 915,
      medium: allQuestionsCount.find(c => c.difficulty === "Medium")?.count || 1960,
      hard: allQuestionsCount.find(c => c.difficulty === "Hard")?.count || 888,
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
    // Return default fallback
    return {
      total: 3768,
      easy: 915,
      medium: 1960,
      hard: 888,
      lastUpdated: new Date()
    };
  }
}
