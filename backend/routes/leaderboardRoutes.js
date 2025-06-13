import express from "express";
import { getLeaderboardByType, updateUserLeaderboard } from "../controllers/leaderboardController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Get leaderboard by type (totalSolved, currentRating, todaySolved)
router.get("/:type", getLeaderboardByType);

// Update user's leaderboard entry (protected route)
router.post("/update", protectRoute, updateUserLeaderboard);

export default router; 