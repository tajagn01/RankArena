import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";
import { generateVerificationCode, sendVerificationEmail } from "../services/email.service.js";


const router = express.Router();

// Signup - now sends verification code
router.post("/signup", async (req, res) => {
  const { name, email, password, university, leetcodeUsername } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashed,
      university: uni._id,
      leetcodeUsername,
      stats,
      lastProfileFetch: new Date(),
      isVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, name);
    
    if (!emailSent) {
      console.log("Email sending failed, but user created");
    }

    res.status(201).json({
      message: "User created. Please check your email for verification code.",
      requiresVerification: true,
      email: user.email
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verify email with code
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ error: "Verification code expired. Please request a new one." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification code
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    res.json({ message: "Verification code sent to your email" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login - now checks if email is verified
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).populate("university");
        if (!user) return res.status(400).json({ error: "User not found" });

        // Check if email is verified
        if (!user.isVerified) {
          return res.status(403).json({ 
            error: "Please verify your email before logging in",
            requiresVerification: true,
            email: user.email
          });
        }

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
                email: user.email,
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