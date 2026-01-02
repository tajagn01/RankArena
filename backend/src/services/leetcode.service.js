import axios from "axios";
import { createRedisConnection } from "../config/redis.js";

const redis = createRedisConnection(process.env.REDIS_URL || "redis://localhost:6379");

export async function fetchLeetCodeUser(username) {
  const cacheKey = `leetcode:${username}`;

  try {
    // Check cache first
    const cached = await redis.get(cacheKey);
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
      await redis.setex(cacheKey, 86400, JSON.stringify(data));
    } catch (err) {
      // Continue if caching fails
    }

    return data;

  } catch (err) {
    return null;
  }
}
