import bcrypt from "bcryptjs"
import User from "../models/userModel.js"
import generateTokenAndSetCookie from "../util/generateToken.js";



export const signup = async (req, res) => {
    try {
        const {
            fullName,
            userName,
            password,
            confirmPassword,
            cfHandle,
            lcHandle,
            gender
        } = req.body;

        if (!fullName || !userName || !password || !confirmPassword || !gender) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate profilePic based on gender
        let profilePic;
        if (gender === "male") {
            profilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
        } else if (gender === "female") {
            profilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;
        } else {
            // "LGTV" or other
            profilePic = `https://avatar.iran.liara.run/username?username=L+G+${userName}`;
        }

        const newUser = new User({
            fullName,
            userName,
            password: hashedPassword,
            cfHandle,
            lcHandle,
            gender,
            profilePic
        });

        await newUser.save();
        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            userName: newUser.userName,
            cfHandle: newUser.cfHandle,
            lcHandle: newUser.lcHandle,
            gender: newUser.gender,
            profilePic: newUser.profilePic
        });

    } catch (error) {
        console.log("Error in signup:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const login = async (req,res)=>{
    try{
        const {userName,password} = req.body;

        if(!userName || !password){
            return res.status(400).json({error:"please fill all fields"})
        }
        const user = await User.findOne({userName});
        const isPasswordCorrect = await bcrypt.compare(password,user?.password||" ");//gives "" in password in case password not found
        
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid credentials"})
        }

        generateTokenAndSetCookie(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            userName:user.userName,
            profilePic:user.profilePic
        })
    }
    catch(error){
        console.log("Error in login",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
export const logout = (req,res)=>{  
  try{
       res.cookie("jwt","",{maxAge:0});
         res.status(200).json({message:"logged out successfully"})
    }
    catch(error){
            console.log("Error in logout",error.message);
            res.status(500).json({error: "Internal server error"});
        }
};
