import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("University", UniversitySchema);
