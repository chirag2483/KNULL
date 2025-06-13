import axios from "axios";

/**
 * Fetch user submissions from Codeforces.
 * @param {string} handle - Codeforces handle.
 * @returns {Promise<Array>} - Array of submission objects.
 */
export const fetchUserSubmissions = async (handle) => {
  try {
    const url = `https://codeforces.com/api/user.status?handle=${handle}`;
    const { data } = await axios.get(url);
    
    if (data.status !== "OK") {
      throw new Error("Failed to fetch Codeforces submissions");
    }
    
    return data.result;
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    throw new Error(`API call failed: ${error.message}`);
  }
};

/**
 * Process submissions to get solved problems
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Object containing solved problems data
 */
export const processSubmissions = (submissions) => {
  const solvedSet = new Set();
  const recentSolved = [];
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  submissions.forEach(sub => {
    if (sub.verdict === "OK" && sub.problem) {
      const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
      solvedSet.add(problemKey);

      const time = new Date(sub.creationTimeSeconds * 1000);
      if (time >= dayAgo) {
        if (!recentSolved.some(p => p.problemId === problemKey)) {
          recentSolved.push({
            problemId: problemKey,
            name: sub.problem.name,
            rating: sub.problem.rating || null,
            tags: sub.problem.tags || [],
            solvedAt: time
          });
        }
      }
    }
  });

  return {
    totalSolved: solvedSet.size,
    recentSolved
  };
};

/**
 * @returns {Promise<Object>} - User info object.
 * @throws {Error} - Throws an error if the API call fails.
 * @param {string} handle - Codeforces handle.
 * @returns {Promise<Object>} - User info object.
 */
export const fetchUserInfo = async (handle) => {
  const url = `https://codeforces.com/api/user.info?handles=${handle}`;
  const { data } = await axios.get(url);
  if (data.status !== "OK") throw new Error("Failed to fetch Codeforces user info");
  return data.result[0];
};

/**
 * Fetch problemset from Codeforces.
 * @returns {Promise<Array>} - Array of problem objects.
 */
export const fetchProblemSet = async () => {
  const url = `https://codeforces.com/api/problemset.problems`;
  const { data } = await axios.get(url);
  if (data.status !== "OK") throw new Error("Failed to fetch problemset");
  return data.result.problems;
};
