import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateTokenAndSetCookie = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie("jwt",token,{
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true, // to prevent XSS attacks
        sameSite:"strict", // to prevent Cross site request forgery attack
        secure: process.env.NODE_ENV !== "development",//set to true if using https
    });
};

export default generateTokenAndSetCookie;