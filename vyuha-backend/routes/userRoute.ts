import express from "express";
const userRouter = express.Router();
import {getUserController, updateUserPhotoController} from "../controllers/userController";
import {authMiddleware} from "../middlewares/authMiddleware";
import upload from "../config/multerConfig";
userRouter.get("/getProfile",authMiddleware, getUserController);
// @ts-ignore
userRouter.post("/update",authMiddleware,upload, updateUserPhotoController);
export default userRouter;