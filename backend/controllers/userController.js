import User from "../models/userModel.js";

const getAllUsers = async (req, res) => {
    try {
      // Fetch all users and exclude password field
      const allUsers = await User.find().select("-password");
  
      res.status(200).json(allUsers);
    } catch (error) {
      console.error("Error in getAllUsers:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

export default getAllUsers;