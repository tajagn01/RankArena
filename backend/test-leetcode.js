import axios from "axios";

const QUERY = `
  query globalData {
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

async function fetchLeetCodeTotals() {
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
    
    console.log("\n=== Raw LeetCode API Response ===");
    console.log(JSON.stringify(allQuestionsCount, null, 2));
    
    // Extract counts for each difficulty
    const easyCount = allQuestionsCount.find(c => c.difficulty === "Easy")?.count || 0;
    const mediumCount = allQuestionsCount.find(c => c.difficulty === "Medium")?.count || 0;
    const hardCount = allQuestionsCount.find(c => c.difficulty === "Hard")?.count || 0;
    
    // Calculate total from Easy + Medium + Hard
    const total = easyCount + mediumCount + hardCount;
    
    console.log("\n=== Calculated Totals ===");
    console.log("Total:", total);
    console.log("Easy:", easyCount);
    console.log("Medium:", mediumCount);
    console.log("Hard:", hardCount);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

fetchLeetCodeTotals();
