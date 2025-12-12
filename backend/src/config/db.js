import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri); 
  } catch (error) {
    process.exit(1);
  }
};