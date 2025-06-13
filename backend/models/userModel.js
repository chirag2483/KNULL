import mongoose from "mongoose"
const userSchema = mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    cfHandle:{
        type:String,
        default:""
    },
    lcHandle:{
        type:String,
        default:""
    },
    gender:{
        type:String,
        enum:["male","female","LGTV"]
    },
    profilePic:{
        type:String,
        default:""
    },
    //used to show members since time ????
},{timestamps:true});

const User = mongoose.model("User",userSchema);
export default User;