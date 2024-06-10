import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        required:false,
        type:String
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    any_active_req:{
        type:Boolean,
        default:false
    }
   
})

const userModel = mongoose.model("user",userSchema)
export default userModel