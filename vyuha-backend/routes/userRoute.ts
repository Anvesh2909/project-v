import express from "express";
const userRouter = express.Router();
import {
    getAllEnrollments, getChapterController,
    getCoursesController,
    getEnrollementStatus, getFeedbackByIdController, getLectureController,
    getUserController, getUserFeedbackController, setEnrollmentController, submitFeedbackController,
    updateUserPhotoController
} from "../controllers/userController";
import {authMiddleware} from "../middlewares/authMiddleware";
import upload from "../config/multerConfig";
import {
    getAssignmentsController,
    getCourseController, getSubmissionsController,
    setSubmissionController
} from "../controllers/courseController";
import {getQuizSubmissionsByCourse, getQuizzesByCourse} from "../controllers/quizController";
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
userRouter.get("/getAssignments/:id",authMiddleware,getAssignmentsController);
userRouter.post("/submitAssignment",authMiddleware,upload,setSubmissionController);
userRouter.get("/submissions", authMiddleware, getSubmissionsController);
userRouter.post("/submitSubmission",authMiddleware,submitFeedbackController);
userRouter.get("/getUserFeedback/:userId", authMiddleware, getUserFeedbackController);
userRouter.get("/getQuizes/:courseId",authMiddleware,getQuizzesByCourse);
userRouter.get("/quizSubmissions/:courseId", authMiddleware, getQuizSubmissionsByCourse);
export default userRouter;