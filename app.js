import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes/index.js";

const app = express();
const PORT = process.env.port|| 3000;
const DB_URI = process.env.DBURI

mongoose.connect(DB_URI);
mongoose.connection.on("connected",()=>console.log("DB CONNECTED"));
mongoose.connection.on("err",(error)=>console.log(error))

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(router)


// app.use(middleware)


app.listen(PORT,()=>{
    console.log("server is running at http://localhost:3000")
})