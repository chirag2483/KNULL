import CFUserStats from "../models/cfStats.js";
import { fetchUserSubmissions, fetchUserInfo, fetchProblemSet, processSubmissions } from "../util/cfApi.js";
import { updateLeaderboardEntry } from "../util/leaderboardUtil.js";
import User from "../models/userModel.js";
import ProblemOfTheDay from "../models/potd.js";
import axios from "axios";

export const syncRecentSolved = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || !user.cfHandle) {
      return res.status(404).json({ error: "User or CF handle not found" });
    }

    // Fetch and process submissions
    const submissions = await fetchUserSubmissions(user.cfHandle);
    const { totalSolved, recentSolved } = processSubmissions(submissions);

    // Update or create stats
    let stats = await CFUserStats.findOne({ userId });
    if (!stats) {
      stats = new CFUserStats({
        userId,
        handle: user.cfHandle,
        recentProblemsSolved: recentSolved,
        totalProblemsSolved: totalSolved,
        lastSynced: new Date()
      });
    } else {
      stats.recentProblemsSolved = recentSolved;
      stats.totalProblemsSolved = totalSolved;
      stats.lastSynced = new Date();
    }

    await stats.save();

    // Update leaderboard entry
    const todaySolved = recentSolved.length;
    await updateLeaderboardEntry(userId, user.cfHandle, totalSolved, todaySolved);

    return res.status(200).json({
      message: "Successfully synced Codeforces data",
      recentSolved,
      totalProblemsSolved: totalSolved,
      lastSynced: stats.lastSynced
    });
  } catch (error) {
    console.error("Error syncing recent solved problems:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserCFStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await CFUserStats.findOne({ userId });
    if (!stats) return res.status(404).json({ error: "CF stats not found" });

    // Get start of today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Count problems solved today
    const countToday = stats.recentProblemsSolved.filter(p => {
      const solvedDate = new Date(p.solvedAt);
      solvedDate.setUTCHours(0, 0, 0, 0);
      return solvedDate.getTime() === today.getTime();
    }).length;

    res.status(200).json({
      totalSolved: stats.totalProblemsSolved,
      todaySolved: countToday,
      lastSynced: stats.lastSynced
    });
  } catch (error) {
    console.error("Error getting CF stats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.cfHandle) return res.status(404).json({ error: "User or CF handle not found" });

    const userInfo = await fetchUserInfo(user.cfHandle);
    const rating = userInfo?.rating || 0;

    res.status(200).json({ rating });
  } catch (error) {
    console.error("Error fetching user rating:", error.message);
    res.status(500).json({ error: "Failed to fetch rating" });
  }
};

export const getProblemOfTheDay = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.cfHandle) return res.status(404).json({ error: "User or CF handle not found" });

    const existing = await ProblemOfTheDay.findOne({ userId, date: new Date().toDateString() });
    if (existing) return res.status(200).json({ problem: existing.problem });

    const userInfo = await fetchUserInfo(user.cfHandle);
    const rating = userInfo?.rating || 1200;

    const problems = await fetchProblemSet();
    const eligible = problems.filter(p => p.rating >= rating && p.rating <= rating + 200);

    const randomProblem = eligible[Math.floor(Math.random() * eligible.length)];
    if (!randomProblem) return res.status(404).json({ error: "No suitable problem found" });

    const saved = new ProblemOfTheDay({
      userId,
      date: new Date().toDateString(),
      problem: randomProblem
    });
    await saved.save();

    res.status(200).json({ problem: randomProblem });
  } catch (error) {
    console.error("Error getting Problem of the Day:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
