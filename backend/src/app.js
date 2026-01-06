import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import cron from "node-cron";
import User from "./models/user.js";
import { fetchLeetCodeUser, fetchLeetCodeTotals } from "./services/leetcode.service.js";


dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Update user solved questions every 4 hours
cron.schedule("0 */4 * * *", async () => {
  console.log("🔄 Cron: Starting user stats update (runs every 4 hours)");
  try {
    const users = await User.find({});
    console.log(`📊 Updating stats for ${users.length} users`);
    
    for (const user of users) {
      try {
        const stats = await fetchLeetCodeUser(user.leetcodeUsername);
        if (stats) {
          user.stats = stats;
          user.lastProfileFetch = new Date();
          await user.save();
          console.log(`✅ Updated: ${user.name} (${user.leetcodeUsername})`);
        }
      } catch (err) {
        console.error(`❌ Failed to update ${user.name}:`, err.message);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("✅ Cron: User stats update completed");
  } catch (err) {
    console.error("❌ Cron: User stats update failed:", err.message);
  }
});

// Update LeetCode total questions every 24 hours
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Cron: Updating LeetCode total questions (runs daily at midnight)");
  try {
    const totals = await fetchLeetCodeTotals();
    console.log("✅ Cron: LeetCode totals updated:", totals);
  } catch (err) {
    console.error("❌ Cron: Failed to update LeetCode totals:", err.message);
  }
});

app.post("/api/refresh-stats", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const stats = await fetchLeetCodeUser(user.leetcodeUsername);
    if (stats) {
      user.stats = stats;
      user.lastProfileFetch = new Date();
      await user.save();
      return res.json({ message: "Stats refreshed", stats });
    }
    return res.status(500).json({ error: "Failed to fetch LeetCode stats" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/refresh-university", async (req, res) => {
  const { university } = req.body;
  try {
    const University = (await import("./models/University.js")).default;
    const uni = await University.findOne({ name: university });
    if (!uni) {
      return res.status(404).json({ error: "University not found" });
    }

    const users = await User.find({ university: uni._id });
    const results = [];

    for (const user of users) {
      const stats = await fetchLeetCodeUser(user.leetcodeUsername);
      if (stats) {
        user.stats = stats;
        user.lastProfileFetch = new Date();
        await user.save();
        results.push({ name: user.name, updated: true, stats });
      } else {
        results.push({ name: user.name, updated: false });
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({ message: "University stats refreshed", results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/leetcode/totals", async (req, res) => {
  try {
    // Set cache control headers to prevent browser caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const totals = await fetchLeetCodeTotals();
    res.json(totals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});