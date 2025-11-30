import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";


const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, university, leetcodeUsername } = req.body;

  try {
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
      email,
      password: hashed,
      university: uni._id,
      leetcodeUsername,
      stats,
      lastProfileFetch: new Date()
    });

    res.status(201).json({
      message: "User created",
      user: {
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        stats: user.stats,
        university: university
      }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
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