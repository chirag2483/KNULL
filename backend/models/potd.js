// models/ProblemOfTheDay.js
import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  rating: Number,
  tags: [String]
});

const problemOfTheDaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },  // store date as string like "2025-06-13"
  problem: problemSchema
});

export default mongoose.model("ProblemOfTheDay", problemOfTheDaySchema);
