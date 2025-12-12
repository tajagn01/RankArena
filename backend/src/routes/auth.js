import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";


const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, password, university, leetcodeUsername } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingLeetcode = await User.findOne({ leetcodeUsername });
    if (existingLeetcode) {
      return res.status(400).json({ error: "This LeetCode account is already registered" });
    }

    const stats = await fetchLeetCodeUser(leetcodeUsername);
    if (!stats) {
      return res.status(400).json({ error: "Invalid LeetCode username. Please check and try again." });
    }

    if (stats.country && stats.country !== "India") {
      return res.status(400).json({ error: "Only LeetCode accounts from India are allowed to register." });
    }

    let uni = await University.findOne({ name: university });
    if (!uni) {
      uni = await University.create({ name: university });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashed,
      university: uni._id,
      leetcodeUsername,
      country: stats.country || "India",
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

router.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findOne({ name }).populate("university");
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        if (user.leetcodeUsername && (!user.stats || !user.stats.totalSolved)) {
            const freshStats = await fetchLeetCodeUser(user.leetcodeUsername);
            if (freshStats) {
                user.stats = freshStats;
                user.lastProfileFetch = new Date();
                await user.save();
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

    const users = await User.find({ 
      university: uni._id,
      $or: [
        { country: "India" },
        { country: null },
        { country: { $exists: false } }
      ]
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;