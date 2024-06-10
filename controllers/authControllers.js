import userModel from "../models/userSchema.js";
import jwt from "jsonwebtoken"



const signupUser = async(req,res)=>{
    
    const {email,password}= req.body;
    console.log(req.body)
    if(!email || !password){
        console.log("auaon")
        res.status(400).json({
            data:null,
            status:false,
            message:"req fields are missing"
        })
        return
    }
    const checkEmail = await userModel.findOne({email:email})
    if(checkEmail){
        res.json({
            data:null,
            status:false,
            message:"email already taken"
        })
        return
    }
    const objToSend ={
       email,password
    }
    await userModel.create(objToSend)
    res.json({
        data:null,
        status:true,
        message:"user created"
    })
}

const loginUser = async(req,res)=>{
    const {email,password}=req.body
    console.log("chala",email,password)
    
    if(!email || !password){
        res.status(400).json({
            data:null,
            status:false,
            message:"required fields are missing"
        })
        return
    }
    const verifyEmail = await userModel.findOne({email});
    if(!verifyEmail){
        res.status(400).json({
            data:null,
            status:false,
            message:"either email or password is wrong"
        })
        return
    }
    if(verifyEmail.password !=password){
        res.status(400).json({
            data:null,
            status:false,
            message:"either email or password is wrong"
        })
        return
    }
    let payload = {
        email
      };

      const token = jwt.sign(payload, "todoB@f123", {
        expiresIn: '1hr',
      });

    res.json({
        data:verifyEmail,
        status:true,
        message:"user logged in",
        token
    })
}

const verify =(req,res)=>{
    res.json("verified")
}

export {signupUser,loginUser,verify}