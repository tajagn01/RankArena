import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import cron from "node-cron";
import User from "./models/user.js";
import { fetchLeetCodeUser } from "./services/leetcode.service.js";


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

cron.schedule("0 */4 * * *", async () => {
  const users = await User.find({});
  for (const user of users) {
    try {
      const stats = await fetchLeetCodeUser(user.leetcodeUsername);
      if (stats) {
        user.stats = stats;
        user.lastProfileFetch = new Date();
        await user.save();
      }
    } catch (err) {
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
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

app.listen(PORT, () => {
});