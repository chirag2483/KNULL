async function getTotalSolvedProblems(username) {
    try {
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
      const data = await response.json();
  
      if (data.status !== "OK") {
        throw new Error("Invalid username or API error.");
      }
  
      const submissions = data.result;
  
      const solvedSet = new Set();
      submissions.forEach(sub => {
        if (sub.verdict === "OK" && sub.problem) {
          const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
          solvedSet.add(problemKey);
        }
      });
  
      console.log(`Total unique problems solved by ${username}: ${solvedSet.size}`);
      return solvedSet.size;
  
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return 0;
    }
  }
  
  // Example usage:
  getTotalSolvedProblems("aryxn5"); // Replace with any CF username
  