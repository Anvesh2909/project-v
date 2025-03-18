import prisma from "../config/dbConfig";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";

// Define types
export type CourseType = "IIE" | "TEC" | "ESO" | "LCH" | "HWB";
export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type ResourceType = "VIDEO" | "PDF" | "LINK" | "TEXT";

// Utility functions
async function generateCourseId(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `VYCS`;
    const lastCourse = await prisma.course.findFirst({
        orderBy: { id: "desc" },
        select: { id: true }
    });

    let newNumber = 1;
    if (lastCourse && lastCourse.id.startsWith(`${year}${prefix}`)) {
        const lastNumber = parseInt(lastCourse.id.slice(-4));
        newNumber = lastNumber + 1;
    }

    const formattedNumber = String(newNumber).padStart(4, '0');
    return `${year}${prefix}${formattedNumber}`;
}

async function uploadFileToStorage(
    buffer: Buffer,
    mimetype: string,
    filePath: string
): Promise<string> {
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: mimetype,
            cacheControl: "3600",
            upsert: true
        });

    if (uploadError) {
        console.error("❌ Upload Error:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    if (!urlData) throw new Error("Failed to get public URL");

    return urlData.publicUrl;
}

function getFileExtension(mimetype: string): string {
    return mimetype.split("/")[1];
}

function handleServiceError(operation: string, error: unknown): never {
    console.error(`❌ Error ${operation}:`, error);
    throw new Error(`${operation} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// Service functions
export async function createCourse(data: {
    title: string,
    description: string,
    image: Buffer,
    instructorId: string,
    mimetype: string,
    courseType: CourseType,
    duration: string,
    difficulty: DifficultyLevel,
}) {
    try {
        const fileExtension = getFileExtension(data.mimetype);
        const filePath = `course/${data.instructorId}/${data.title}.${fileExtension}`;
        const publicUrl = await uploadFileToStorage(data.image, data.mimetype, filePath);

        const courseId = await generateCourseId();
        const course = await prisma.course.create({
            data: {
                id: courseId,
                title: data.title,
                description: data.description,
                image: publicUrl,
                instructorId: data.instructorId,
                type: data.courseType,
                duration: data.duration,
                difficulty: data.difficulty
            },
        });

        return course;
    } catch (error) {
        handleServiceError("course creation", error);
    }
}

export async function getInstructorCourses(id: string) {
    try {
        return await prisma.course.findMany({
            where: { instructorId: id }
        });
    } catch (error) {
        handleServiceError("fetching instructor courses", error);
    }
}

export async function getCourse(id: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                courseContent: {
                    include: {
                        lectures: true,
                    },
                },
            },
        });
        if (!course) {
            throw new Error("Course not found");
        }
        return course;
    } catch (error) {
        handleServiceError("fetching course", error);
    }
}

export async function addChapter(courseId: string, title: string, chapterOrder: number) {
    try {
        if (chapterOrder === undefined || isNaN(chapterOrder)) {
            throw new Error("Chapter order must be a valid number");
        }
        const chapterId = `${courseId}-CH${String(chapterOrder).padStart(2, '0')}`;
        const chapter = await prisma.chapter.create({
            data: {
                id: chapterId,
                title,
                courseId,
                order: chapterOrder
            }
        });
        return chapter;
    } catch (error) {
        handleServiceError("chapter creation", error);
    }
}

export async function getChapters(courseId: string) {
    try {
        return await prisma.chapter.findMany({
            where: { courseId },
            include: {
                lectures: true
            },
            orderBy: { order: "asc" }
        });
    } catch (error) {
        handleServiceError("fetching chapters", error);
    }
}

export async function addLecture(data: {
    title: string;
    lectureDuration: number;
    chapterId: string;
    resourceType: ResourceType;
    resource?: Buffer;
    mimetype?: string;
    resourceUrl?: string;
    requiresSubmission: boolean;
}) {
    try {
        const chapter = await prisma.chapter.findUnique({
            where: { id: data.chapterId }
        });
        if (!chapter) {
            throw new Error("Chapter not found");
        }

        const existingLectures = await prisma.lecture.findMany({
            where: { chapterId: data.chapterId }
        });
        const order = existingLectures.length + 1;
        const lectureId = `${data.chapterId}-L${order}`;

        let resourceUrl = data.resourceUrl;
        if (!resourceUrl && data.resource && data.mimetype) {
            const fileExtension = getFileExtension(data.mimetype);
            const filePath = `lecture/${data.chapterId}/${lectureId}.${fileExtension}`;
            resourceUrl = await uploadFileToStorage(data.resource, data.mimetype, filePath);
        }

        const lecture = await prisma.lecture.create({
            data: {
                id: lectureId,
                title: data.title,
                duration: data.lectureDuration,
                order,
                chapterId: data.chapterId,
                resourceType: data.resourceType,
                resourceUrl,
                requiresSubmission: data.requiresSubmission || false
            }
        });

        return lecture;
    } catch (error) {
        handleServiceError("lecture creation", error);
    }
}

export async function getLectures(chapterId: string) {
    try {
        return await prisma.lecture.findMany({
            where: { chapterId },
            orderBy: { order: "asc" }
        });
    } catch (error) {
        handleServiceError("fetching lectures", error);
    }
}

export async function setAssignment(data: {
    courseId: string;
    title: string;
    description: string;
    dueDate: Date;
    maxMarks: number;
}) {
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                courseId: data.courseId,
                maxMarks: data.maxMarks
            }
        });
        return assignment;
    } catch (error) {
        handleServiceError("setting assignment", error);
    }
}

export async function setSubmission(data: {
    studentId: string;
    assignmentId: string;
    submission: {
        buffer: Buffer,
        mimetype: string
    }
}) {
    try {
        const fileExtension = getFileExtension(data.submission.mimetype);
        const filePath = `assignment/${data.studentId}/${data.assignmentId}.${fileExtension}`;
        const fileUrl = await uploadFileToStorage(
            data.submission.buffer,
            data.submission.mimetype,
            filePath
        );

        const submission = await prisma.submission.create({
            data: {
                studentId: data.studentId,
                assignmentId: data.assignmentId,
                submissionUrl: fileUrl
            }
        });

        return submission;
    } catch (error) {
        handleServiceError("setting submission", error);
    }
}

export async function getAssignments(courseId: string) {
    try {
        return await prisma.assignment.findMany({
            where: { courseId },
            orderBy: { dueDate: 'asc' }
        });
    } catch (error) {
        handleServiceError("fetching assignments", error);
    }
}

export async function getStudentSubmissionsForCourse(studentId: string, courseId: string) {
    try {
        const courseAssignments = await prisma.assignment.findMany({
            where: { courseId }
        });
        const assignmentIds = courseAssignments.map(assignment => assignment.id);

        return await prisma.submission.findMany({
            where: {
                studentId,
                assignmentId: { in: assignmentIds }
            }
        });
    } catch (error) {
        handleServiceError("fetching student submissions", error);
    }
}

export async function getInstructorSubmissions(instructorId: string) {
    try {
        const instructorCourses = await prisma.course.findMany({
            where: { instructorId },
            select: { id: true }
        });

        const courseIds = instructorCourses.map(course => course.id);
        const courseAssignments = await prisma.assignment.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true }
        });

        const assignmentIds = courseAssignments.map(assignment => assignment.id);

        return await prisma.submission.findMany({
            where: { assignmentId: { in: assignmentIds } },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        handleServiceError("fetching instructor submissions", error);
    }
}

export async function setGrade(data: {
    submissionId: string;
    marks: number;
    feedback: string
}) {
    try {
        return await prisma.submission.update({
            where: { id: data.submissionId },
            data: {
                grade: data.marks,
                feedback: data.feedback
            }
        });
    } catch (error) {
        handleServiceError("setting grade", error);
    }
}

export async function getAllStudentSubmissions(studentId: string) {
    try {
        return await prisma.submission.findMany({
            where: { studentId },
            include: {
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        dueDate: true,
                        courseId: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
        });
    } catch (error) {
        handleServiceError("fetching student submissions", error);
    }
}