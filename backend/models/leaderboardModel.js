import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cfHandle: {
    type: String,
    required: true
  },
  totalSolved: {
    type: Number,
    default: 0
  },
  currentRating: {
    type: Number,
    default: 0
  },
  todaySolved: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
leaderboardEntrySchema.index({ totalSolved: -1 });
leaderboardEntrySchema.index({ currentRating: -1 });
leaderboardEntrySchema.index({ todaySolved: -1 });

export default mongoose.model("LeaderboardEntry", leaderboardEntrySchema); 