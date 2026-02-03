import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import University from "../models/University.js";
import { fetchLeetCodeUser } from "../services/leetcode.service.js";
import { generateToken, verifyToken } from "../middleware/auth.js";

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
    let stats;
    try {
      stats = await fetchLeetCodeUser(leetcodeUsername);
    } catch (err) {
      console.error(`LeetCode fetch error for '${leetcodeUsername}':`, err.message);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        console.log(`⚠️ LeetCode timeout - using default stats`);
        stats = { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, country: null, lastUpdated: new Date() };
      } else {
        // Re-throw other errors to be handled below
        throw err;
      }
    }

    // fetchLeetCodeUser now throws on network error, so if we get here and it's null, 
    // it simply means the user was not found or the GraphQL query returned no match.
    if (!stats) {
      console.log(`Validation failed: LeetCode user '${leetcodeUsername}' not found`);
      return res.status(400).json({ error: "LeetCode username not found. Please check spelling." });
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
    // 1. First find the user normally
    const user = await User.findOne({ name }).populate("university");
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 2. Resolve University Name (Handle Legacy Data)
    let universityName = "Unknown";
    let universityUpdated = false;

    if (user.university && user.university.name) {
      // Normal case: Correctly populated
      universityName = user.university.name;
    } else {
      // Abnormal case: Populate failed (null) or schema mismatch.
      // Fetch raw doc to check for legacy string data
      const rawUser = await User.findById(user._id).lean();

      if (rawUser.university) {
        if (typeof rawUser.university === 'string' && !mongoose.Types.ObjectId.isValid(rawUser.university)) {
          // It's a legacy string name (e.g. "IIT Bombay")
          universityName = rawUser.university;

          // AUTO-FIX: Try to link to real University doc
          const realUni = await University.findOne({ name: universityName });
          if (realUni) {
            console.log(`🔄 Migrating legacy user '${user.name}' from string '${universityName}' to ID ${realUni._id}`);
            user.university = realUni._id;
            universityUpdated = true;
          }
        }
      }
    }

    // 3. Update LeetCode Stats if needed
    if (user.leetcodeUsername && (!user.stats || !user.stats.totalSolved)) {
      const freshStats = await fetchLeetCodeUser(user.leetcodeUsername);
      if (freshStats) {
        user.stats = freshStats;
        user.lastProfileFetch = new Date();
        universityUpdated = true; // Mark for save
      }
    }

    if (universityUpdated) {
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        name: user.name,
        leetcodeUsername: user.leetcodeUsername,
        stats: user.stats,
        university: universityName
      }
    });
  } catch (err) {
    console.error("Login error:", err);
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

    // Query 1: Find users with ObjectId reference (new schema)
    let usersWithId = [];
    try {
      console.log(`🔍 Query 1: Searching for users with university ObjectId: ${uni._id}`);
      usersWithId = await User.find({
        university: uni._id,
        $or: [
          { country: "India" },
          { country: null },
          { country: { $exists: false } }
        ]
      });
      console.log(`✅ Query 1 found ${usersWithId.length} users with ObjectId`);
    } catch (err) {
      console.error(`❌ Query 1 failed:`, err.message);
    }

    // Query 2: Find users with string reference (legacy schema)
    let legacyUsers = [];
    try {
      console.log(`🔍 Query 2: Searching for users with university string: "${university}"`);
      legacyUsers = await User.collection.find({
        university: university,  // String match
        $or: [
          { country: "India" },
          { country: null },
          { country: { $exists: false } }
        ]
      }).toArray();
      console.log(`✅ Query 2 found ${legacyUsers.length} legacy users with string`);
    } catch (err) {
      console.error(`❌ Query 2 failed:`, err.message);
    }

    // Combine results and remove duplicates by _id
    const userMap = new Map();

    // Add ObjectId users
    usersWithId.forEach(u => {
      try {
        userMap.set(u._id.toString(), u.toObject());
      } catch (err) {
        console.error(`Error converting user ${u._id}:`, err.message);
      }
    });

    // Add legacy users (already plain objects from collection.find)
    legacyUsers.forEach(u => {
      const id = u._id.toString();
      if (!userMap.has(id)) {
        userMap.set(id, u);
      }
    });

    const users = Array.from(userMap.values());
    console.log(`📊 Total unique users after merge: ${users.length}`);

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

// Logout endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// Verify session and get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("university");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let universityName = "Unknown";
    if (user.university && user.university.name) {
      universityName = user.university.name;
    } else {
      const rawUser = await User.findById(user._id).lean();
      if (rawUser.university && typeof rawUser.university === 'string') {
        universityName = rawUser.university;
      }
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername,
        stats: user.stats,
        university: universityName
      }
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;