import express from "express";
import { loginUser, signupUser, verify } from "../controllers/authControllers.js";
import { changeStatus, createTodo, deleteAllTemp, getTodos, tmpDeleteTodo, updateDesc } from "../controllers/todoController.js";
import  { verifyTokenMiddleware } from "../middlewares/index.js";
const router = express.Router();

router.post("/api/signup",signupUser)
router.post("/api/login",loginUser)
router.get("/api/verify",verifyTokenMiddleware,verify)

router.get("/api/getTodos/:adminName",verifyTokenMiddleware,getTodos)
router.post("/api/createtodo/:id",verifyTokenMiddleware,createTodo)

router.put("/api/:id/status",changeStatus)
router.put("/api/:id/updatedesc",updateDesc)

router.put("/api/:id/tmpdeltodo",verifyTokenMiddleware,tmpDeleteTodo)
router.delete("/api/:id/deleteAllTemp",verifyTokenMiddleware,deleteAllTemp)





export default router