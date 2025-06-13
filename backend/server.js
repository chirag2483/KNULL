import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";


import authRoutes from "./routes/authRoutes.js"
import cfRoutes from "./routes/cfRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import leaderboardRoutes from "./routes/leaderboardRoutes.js"

import connectDB from "./Db/connect.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json()); // from req.body
app.use(cookieParser()); // for cookies


app.use("/api/auth",authRoutes);

app.use("/api/users",userRoutes);

app.use("/api/cf",cfRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});




app.listen(PORT, ()=>{
    connectDB()
    console.log(`Server is running on port ${PORT}`);
});    
