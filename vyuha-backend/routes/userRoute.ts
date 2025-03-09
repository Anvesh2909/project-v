import express from "express";
const userRouter = express.Router();
import {
    getAllEnrollments, getChapterController,
    getCoursesController,
    getEnrollementStatus, getLectureController,
    getUserController, setEnrollmentController,
    updateUserPhotoController
} from "../controllers/userController";
import {authMiddleware} from "../middlewares/authMiddleware";
import upload from "../config/multerConfig";
import {getCourseController} from "../controllers/courseController";
userRouter.get("/getProfile",authMiddleware, getUserController);
// @ts-ignore
userRouter.post("/update",authMiddleware,upload, updateUserPhotoController);
userRouter.get("/getCourses",authMiddleware,getCoursesController);
userRouter.post("/getEnrollmentStatus",authMiddleware,getEnrollementStatus);
userRouter.get("/getEnrollments",authMiddleware,getAllEnrollments);
userRouter.get("/getCourse/:id",authMiddleware,getCourseController);
userRouter.post("/enroll",authMiddleware,setEnrollmentController);
userRouter.get("/getChapters",authMiddleware,getChapterController);
userRouter.get("/getLectures",authMiddleware,getLectureController);
export default userRouter;