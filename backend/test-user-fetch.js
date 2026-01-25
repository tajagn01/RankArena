import { fetchLeetCodeUser } from "./src/services/leetcode.service.js";

async function test() {
    console.log("Testing fetchLeetCodeUser...");
    // Use a known existing user, e.g. "neal_wu" or "tourist" (if they have LC) or "tajagn"?
    // Let's use "neal_wu" as he is a famous competitive programmer likely to exist.
    // Or "sachin" (checking India constraint).
    
    // Testing a user likely to be from India to pass that check, 
    // although the function itself just returns data.
    const username = "sachin_gupta"; 
    
    console.log(`Fetching for: ${username}`);
    const data = await fetchLeetCodeUser(username);
    
    if (data) {
        console.log("Success:", data);
    } else {
        console.log("Failed to fetch user (returned null)");
    }
}

test();
