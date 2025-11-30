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

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, restrict in production if needed
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

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Starting daily LeetCode stats update...");
  const users = await User.find({});
  for (const user of users) {
    const stats = await fetchLeetCodeUser(user.leetcodeUsername);
    if (stats) {
      user.stats = stats;
      user.lastProfileFetch = new Date();
      await user.save();
      console.log(`Updated stats for ${user.leetcodeUsername}`);
    }
  }
  console.log("Daily LeetCode stats update complete.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});