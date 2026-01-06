import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.js";
import University from "./src/models/University.js";

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check all users
    const users = await User.find({}).populate("university");
    console.log(`📊 Total Users in Database: ${users.length}\n`);

    if (users.length === 0) {
      console.log("❌ NO USERS FOUND IN DATABASE!");
      console.log("\n💡 You need to register at least one user first.");
      console.log("   Go to your signup page and create an account.\n");
    } else {
      console.log("👥 Users:");
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   LeetCode: ${user.leetcodeUsername}`);
        console.log(`   University: ${user.university?.name || "NOT SET"}`);
        console.log(`   Country: ${user.country || "NOT SET"}`);
        console.log(`   Total Solved: ${user.stats?.totalSolved || 0}`);
      });

      // Check universities
      console.log("\n\n🏫 Universities in Database:");
      const universities = await University.find({});
      universities.forEach((uni, index) => {
        const userCount = users.filter(u => u.university?._id.toString() === uni._id.toString()).length;
        console.log(`\n${index + 1}. ${uni.name}`);
        console.log(`   Users: ${userCount}`);
      });

      // Group by university
      console.log("\n\n📍 Users by University:");
      const byUni = {};
      users.forEach(user => {
        const uniName = user.university?.name || "NO UNIVERSITY";
        if (!byUni[uniName]) byUni[uniName] = [];
        byUni[uniName].push(user.name);
      });
      Object.keys(byUni).forEach(uni => {
        console.log(`\n${uni}: ${byUni[uni].length} users`);
        console.log(`   ${byUni[uni].join(", ")}`);
      });
    }

    await mongoose.disconnect();
    console.log("\n\n✅ Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

checkDatabase();
