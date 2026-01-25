import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";


import { sendOtpEmail } from "../services/email.service.js";
import { generateOtp, storeOtp, verifyOtp } from "../services/otp.service.js";

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  const { name, email, password, university, leetcodeUsername } = req.body;

  try {
    if (!password || password.length < 6) {
      console.log("Validation failed: Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      console.log(`Validation failed: Username '${name}' already taken`);
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`Validation failed: Email '${email}' already registered`);
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingLeetcode = await User.findOne({ leetcodeUsername });
    if (existingLeetcode) {
      console.log(`Validation failed: LeetCode '${leetcodeUsername}' already registered`);
      return res.status(400).json({ error: "This LeetCode account is already registered" });
    }

    console.log(`Fetching LeetCode stats for: ${leetcodeUsername}`);
    const stats = await fetchLeetCodeUser(leetcodeUsername);
    if (!stats) {
      console.log(`Validation failed: Invalid LeetCode username '${leetcodeUsername}' or fetch failed`);
      return res.status(400).json({ error: "Invalid LeetCode username. Please check and try again." });
    }

    if (stats.country && stats.country !== "India") {
      console.log(`Validation failed: Country '${stats.country}' is not India`);
      return res.status(400).json({ error: "Only LeetCode accounts from India are allowed to register." });
    }

    // Prepare user data to be stored temporarily
    const userData = {
      name,
      email,
      password: await bcrypt.hash(password, 10), // Hash early before storing? yes.
      university,
      leetcodeUsername,
      country: stats.country || "India",
      stats
    };

    const otp = generateOtp();
    const stored = await storeOtp(email, otp, userData);

    if (!stored) {
      console.error("Redis storage failed");
      return res.status(500).json({ error: "Failed to process OTP request (Redis unavailable)" });
    }

    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      console.error("Email sending failed");
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

    res.json({ message: "OTP sent to your email", email });

  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(400).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await verifyOtp(email, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    const { userData } = result;

    // Create University if needed
    let uni = await University.findOne({ name: userData.university });
    if (!uni) {
      uni = await University.create({ name: userData.university });
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      university: uni._id,
      leetcodeUsername: userData.leetcodeUsername,
      country: userData.country,
      stats: userData.stats,
      lastProfileFetch: new Date()
    });

    res.status(201).json({
      message: "Signup successful! You can now login.",
      user: {
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        stats: user.stats,
        university: userData.university // We know the name from userData
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
    console.log(`📍 Searching for university: "${university}"`);

    const uni = await University.findOne({ name: university });
    if (!uni) {
      console.log(`❌ University not found: "${university}"`);
      console.log(`Available universities:`);
      const allUnis = await University.find({});
      allUnis.forEach(u => console.log(`   - "${u.name}"`));
      return res.status(404).json({ error: "University not found" });
    }

    console.log(`✅ Found university: ${uni.name} (ID: ${uni._id})`);

    const users = await User.find({
      university: uni._id,
      $or: [
        { country: "India" },
        { country: null },
        { country: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${users.length} users from ${university}`);
    if (users.length === 0) {
      console.log("⚠️ No users found. Checking if current user exists in this uni...");
      const anyUser = await User.findOne({ university: uni._id });
      console.log("DEBUG: Any user with this uni ID?", anyUser ? "Yes" : "No");
    }
    res.json({ users });
  } catch (err) {
    console.error(`❌ Error fetching university users:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;