import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});