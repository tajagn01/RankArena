import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
  totalSolved: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  lastUpdated: { type: Date }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
  leetcodeUsername: { type: String, index: true },
  country: { type: String, default: null },
  stats: { type: StatsSchema, default: () => ({}) },
  lastProfileFetch: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
