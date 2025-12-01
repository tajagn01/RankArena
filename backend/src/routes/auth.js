import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";


const router = express.Router();

// Signup - simplified without email verification
router.post("/signup", async (req, res) => {
  const { name, password, university, leetcodeUsername } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if LeetCode username is already registered
    const existingLeetcode = await User.findOne({ leetcodeUsername });
    if (existingLeetcode) {
      return res.status(400).json({ error: "This LeetCode account is already registered" });
    }

    let uni = await University.findOne({ name: university });
    if (!uni) {
      uni = await University.create({ name: university });
    }

    // Fetch REAL LeetCode stats
    let stats = await fetchLeetCodeUser(leetcodeUsername);
    if (!stats) {
      stats = {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        lastUpdated: new Date()
      };
    }
    console.log("Fetched LeetCode stats:", stats);

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashed,
      university: uni._id,
      leetcodeUsername,
      stats,
      lastProfileFetch: new Date()
    });

    res.status(201).json({
      message: "Signup successful! You can now login.",
      user: {
        name: user.name,
        leetcodeUsername: user.leetcodeUsername
      }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login - uses name instead of email
router.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findOne({ name }).populate("university");
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // If user has leetcodeUsername but no stats, fetch them now
        if (user.leetcodeUsername && (!user.stats || !user.stats.totalSolved)) {
            const freshStats = await fetchLeetCodeUser(user.leetcodeUsername);
            if (freshStats) {
                user.stats = freshStats;
                user.lastProfileFetch = new Date();
                await user.save();
                console.log("Updated stats on login for:", user.leetcodeUsername);
            }
        }

        res.json({
            message: "Login successful",
            user: {
                name: user.name,
                leetcodeUsername: user.leetcodeUsername,
                stats: user.stats,
                university: user.university?.name || "Unknown"
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post("/university-users", async (req, res) => {
  const { university } = req.body;
  try {
    const uni = await University.findOne({ name: university });
    if (!uni) return res.status(404).json({ error: "University not found" });

    const users = await User.find({ university: uni._id });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;