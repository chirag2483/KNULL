import mongoose from "mongoose";

const cfUserStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  handle: { type: String, required: true },
  recentProblemsSolved: { type: Array, default: [] },
  totalProblemsSolved: { type: Number, default: 0 },
  lastSynced: { type: Date, default: Date.now }
});

export default mongoose.model("CFUserStats", cfUserStatsSchema);