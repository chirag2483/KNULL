import { updateLeaderboardEntry, getLeaderboard } from "../util/leaderboardUtil.js";

/**
 * Get leaderboard by type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getLeaderboardByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit } = req.query;

    const entries = await getLeaderboard(type, parseInt(limit) || 10);

    // Format the response
    const formattedEntries = entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId._id,
      fullName: entry.userId.fullName,
      userName: entry.userId.userName,
      profilePic: entry.userId.profilePic,
      cfHandle: entry.cfHandle,
      totalSolved: entry.totalSolved || 0,
      currentRating: entry.currentRating || 0,
      todaySolved: entry.todaySolved || 0,
      lastUpdated: entry.lastUpdated
    }));

    res.status(200).json({
      type,
      totalUsers: entries.length,
      entries: formattedEntries
    });
  } catch (error) {
    console.error("Error in getLeaderboardByType:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user's leaderboard entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const updateUserLeaderboard = async (req, res) => {
  try {
    const { userId, cfHandle, totalSolved, todaySolved } = req.body;

    const entry = await updateLeaderboardEntry(userId, cfHandle, totalSolved, todaySolved);

    res.status(200).json({
      message: "Leaderboard entry updated successfully",
      entry: {
        userId: entry.userId,
        cfHandle: entry.cfHandle,
        totalSolved: entry.totalSolved,
        currentRating: entry.currentRating,
        todaySolved: entry.todaySolved,
        lastUpdated: entry.lastUpdated
      }
    });
  } catch (error) {
    console.error("Error in updateUserLeaderboard:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}; 