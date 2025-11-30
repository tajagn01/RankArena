import axios from "axios";

export async function fetchLeetCodeUser(username) {
  const QUERY = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
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

    return {
      username: user.username,
      ranking: user.profile?.ranking ?? null,
      totalSolved: statsArr.find(x => x.difficulty === "All")?.count || 0,
      easySolved: statsArr.find(x => x.difficulty === "Easy")?.count || 0,
      mediumSolved: statsArr.find(x => x.difficulty === "Medium")?.count || 0,
      hardSolved: statsArr.find(x => x.difficulty === "Hard")?.count || 0,
      lastUpdated: new Date()
    };

  } catch (err) {
    console.error("LeetCode Fetch Error:", err.message);
    return null;
  }
}
