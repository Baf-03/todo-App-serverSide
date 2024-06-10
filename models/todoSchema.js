import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    desc:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default:0
    },
    admin_name:{
        type:String,
        required:true
    },
    is_deleted:{
        type:Boolean,
        // required:true,
        default:false
    }
})

const todoModel = mongoose.model("todos",todoSchema)

export default todoModel