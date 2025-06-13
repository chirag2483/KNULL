import express from "express";
import { syncRecentSolved ,
    getUserCFStats,
    getUserRating,
    getProblemOfTheDay} from "../controllers/cfController.js";

const router = express.Router();

router.get("/sync/:userId", syncRecentSolved);//recent solved problems by user

router.get("/stats/:userId", getUserCFStats);//count of problems solved by user

// Get user's current rating
router.get("/rating/:userId", getUserRating);

// Get personalized problem of the day
router.get("/daily/:userId", getProblemOfTheDay);

export default router;
