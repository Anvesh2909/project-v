import express from "express";
import { getInstructorController } from "../controllers/instructorController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
    addChapterController, addLectureController,
    createCourseController, getChaptersController, getCourseController,
    getInstructorCoursesController, getLecturesController
} from "../controllers/courseController";
import upload from "../config/multerConfig";
const instructorRoute = express.Router();
instructorRoute.get("/getInstructorProfile", authMiddleware, getInstructorController);
instructorRoute.post("/createCourse",authMiddleware,upload,createCourseController);
instructorRoute.get("/getInstructorCourses",authMiddleware, getInstructorCoursesController);
instructorRoute.get("/getCourse/:id",authMiddleware,getCourseController);
instructorRoute.post("/createChapter",authMiddleware,addChapterController);
instructorRoute.get("/getChapters",authMiddleware,getChaptersController);
instructorRoute.post("/addLecture",upload,authMiddleware,addLectureController);
instructorRoute.get("/getLectures",authMiddleware,getLecturesController);
export default instructorRoute;