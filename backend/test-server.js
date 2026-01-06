import express from "express";
import cors from "cors";
import { fetchLeetCodeTotals } from "./src/services/leetcode.service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/leetcode/totals", async (req, res) => {
  try {
    console.log("📞 API called: /api/leetcode/totals");
    const totals = await fetchLeetCodeTotals();
    console.log("✅ Sending response:", totals);
    res.json(totals);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/leetcode/totals`);
});
