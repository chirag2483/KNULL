import LeaderboardEntry from "../models/leaderboardModel.js";
import User from "../models/userModel.js";
import { fetchUserInfo } from "./cfApi.js";

/**
 * Update or create a leaderboard entry for a user
 * @param {string} userId - User's MongoDB ID
 * @param {string} cfHandle - User's Codeforces handle
 * @param {number} totalSolved - Total problems solved
 * @param {number} todaySolved - Problems solved today
 * @returns {Promise<Object>} Updated leaderboard entry
 */
export const updateLeaderboardEntry = async (userId, cfHandle, totalSolved, todaySolved) => {
  try {
    // Fetch current rating from Codeforces
    const userInfo = await fetchUserInfo(cfHandle);
    const currentRating = userInfo?.rating || 0;

    // Update or create leaderboard entry
    const entry = await LeaderboardEntry.findOneAndUpdate(
      { userId },
      {
        cfHandle,
        totalSolved,
        currentRating,
        todaySolved,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return entry;
  } catch (error) {
    console.error("Error updating leaderboard entry:", error.message);
    throw error;
  }
};

/**
 * Get leaderboard by type
 * @param {string} type - Type of leaderboard ('totalSolved', 'currentRating', or 'todaySolved')
 * @param {number} limit - Number of entries to return
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export const getLeaderboard = async (type, limit = 10) => {
  try {
    const sortField = {
      totalSolved: { totalSolved: -1 },
      currentRating: { currentRating: -1 },
      todaySolved: { todaySolved: -1 }
    }[type];

    if (!sortField) {
      throw new Error("Invalid leaderboard type");
    }

    // Get all users with CF handles
    const users = await User.find({ cfHandle: { $ne: "" } });
    
    // Get existing leaderboard entries
    const existingEntries = await LeaderboardEntry.find()
      .populate('userId', 'fullName userName profilePic');

    // Create a map of existing entries
    const entryMap = new Map(
      existingEntries.map(entry => [entry.userId._id.toString(), entry])
    );

    // Process all users
    const allEntries = await Promise.all(
      users.map(async (user) => {
        let entry = entryMap.get(user._id.toString());
        
        // If no entry exists or it's too old (more than 1 hour), create/update it
        if (!entry || (new Date() - entry.lastUpdated) > 3600000) {
          try {
            // Get user info from Codeforces
            const userInfo = await fetchUserInfo(user.cfHandle);
            const currentRating = userInfo?.rating || 0;

            // Create new entry with default values
            entry = await LeaderboardEntry.findOneAndUpdate(
              { userId: user._id },
              {
                cfHandle: user.cfHandle,
                totalSolved: entry?.totalSolved || 0,
                currentRating,
                todaySolved: entry?.todaySolved || 0,
                lastUpdated: new Date()
              },
              { upsert: true, new: true }
            ).populate('userId', 'fullName userName profilePic');
          } catch (error) {
            console.error(`Error updating entry for user ${user.cfHandle}:`, error.message);
            // If API call fails, use existing entry or create with defaults
            if (!entry) {
              entry = await LeaderboardEntry.create({
                userId: user._id,
                cfHandle: user.cfHandle,
                totalSolved: 0,
                currentRating: 0,
                todaySolved: 0,
                lastUpdated: new Date()
              }).populate('userId', 'fullName userName profilePic');
            }
          }
        }
        
        return entry;
      })
    );

    // Sort entries based on the requested type
    const sortedEntries = allEntries.sort((a, b) => {
      const aValue = a[type] || 0;
      const bValue = b[type] || 0;
      return bValue - aValue;
    });

    // Return limited number of entries
    return sortedEntries.slice(0, limit);
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    throw error;
  }
}; 