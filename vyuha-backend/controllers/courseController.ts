import {
    addChapter,
    addLecture,
    createCourse,
    getChapters,
    getCourse,
    getInstructorCourses, getLectures
} from "../services/courseService";
import { Request, Response } from "express";
export const createCourseController = async (req: Request, res: Response): Promise<void> => {
    const { title, description, id, courseType, duration, difficulty } = req.body;
    const image = req.file?.buffer;
    const mimetype = req.file?.mimetype;
    const instructorId = id;

    if (!image || !mimetype) {
        res.status(400).json({ error: "No image uploaded or invalid file type" });
        return;
    }

    try {
        const response = await createCourse({
            title,
            description,
            image,
            instructorId,
            mimetype,
            courseType,
            duration,
            difficulty
        });
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
export const getInstructorCoursesController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;
    try {
        const response = await getInstructorCourses(id);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const getCourseController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const response = await getCourse(id);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const addChapterController = async (req: Request, res: Response): Promise<void> => {
    const {courseId, title, chapterOrder} = req.body;
    try {
        const response = await addChapter(courseId, title, chapterOrder);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const getChaptersController = async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.body;
    try {
        const response = await getChapters(courseId);
        res.status(200).json(response);
    } catch (error:any) {
        res.status(400).json({ error: error.message });
    }
}
export const addLectureController = async (req: Request, res: Response): Promise<void> => {
    console.log("📥 Request Received:");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { title, lectureDuration, order, chapterId, resourceType, resourceUrl, requiresSubmission } = req.body;
    const resource = req.file?.buffer;
    const mimetype = req.file?.mimetype;

    if (!title || !lectureDuration || !chapterId || !resourceType) {
        console.log("❌ Missing required fields");
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    try {
        const response = await addLecture({
            title,
            lectureDuration: parseInt(lectureDuration, 10),
            chapterId,
            resourceType,
            resource,
            mimetype,
            resourceUrl,
            requiresSubmission: requiresSubmission === 'true'
        });
        res.status(201).json(response);
    } catch (error: any) {
        console.error("❌ Error in addLectureController:", error.message);
        res.status(500).json({ error: error.message });
    }
};
export const getLecturesController = async (req: Request, res: Response): Promise<void> => {
    const { chapterId } = req.body;
    try {
        const response = await getLectures(chapterId);
        res.status(200).json(response);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}