import prisma from "../config/dbConfig";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');
type CourseType = "IIE" | "TEC" | "ESO" | "LCH" | "HWB";
type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
async function generateCourseId() {
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
        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const fileExtension = data.mimetype.split("/")[1];
        const filePath = `course/${data.instructorId}/${data.title}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, data.image, { contentType: data.mimetype, cacheControl: "3600", upsert: true });

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (!urlData) throw new Error("Failed to get public URL");
        const publicUrl = urlData.publicUrl;
        function isDifficultyLevel(value: any): value is DifficultyLevel {
            const difficultyLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];
            return difficultyLevels.includes(value);
        }

        if (!isDifficultyLevel(data.difficulty)) {
            throw new Error(`Invalid difficulty level: ${data.difficulty}`);
        }
        console.log("Image uploaded successfully. Public URL:", publicUrl);
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
        console.error("Error creating course:", error);
        throw new Error("Course creation failed");
    }
}
export async function getInstructorCourses(id: string) {
    return prisma.course.findMany({
        where: { instructorId: id }
    });
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
        console.error("Error fetching course:", error);
        throw new Error("Failed to fetch course");
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
        console.log("Chapter Created:", chapter);
        return chapter;
    } catch (error) {
        console.error("Error creating chapter:", error);
        throw new Error("Chapter creation failed");
    }
}
export async function getChapters(courseId: string) {
    return prisma.chapter.findMany({
        where: { courseId },
        include: {
            lectures: true
        },
        orderBy: { order: "asc" }
    });
}
export async function addLecture(data: {
    title: any;
    lectureDuration: number;
    chapterId: any;
    resourceType: any;
    resource: Buffer<ArrayBufferLike> | undefined;
    mimetype: string | undefined;
    resourceUrl: any;
    requiresSubmission: boolean
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
            const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
            const fileExtension = data.mimetype.split("/")[1];
            const filePath = `lecture/${data.chapterId}/${lectureId}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, data.resource, {
                    contentType: data.mimetype,
                    cacheControl: "3600",
                    upsert: true
                });
            if (uploadError) {
                console.error("❌ Upload failed:", uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }
            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            if (!urlData) throw new Error("Failed to get public URL");

            resourceUrl = urlData.publicUrl;
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
        console.error("❌ Error creating lecture:", error);
        throw new Error("Lecture creation failed");
    }
}
export async function getLectures(chapterId: string) {
    return prisma.lecture.findMany({
        where: { chapterId },
        orderBy: { order: "asc" }
    });
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
                courseId: data.courseId
            }
        });
        return assignment;
    } catch (error) {
        console.error("Error setting assignment:", error);
        throw new Error("Failed to set assignment");
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
    const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
    const fileExtension = data.submission.mimetype.split("/")[1];
    const filePath = `assignment/${data.studentId}/${data.assignmentId}.${fileExtension}`;
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, data.submission.buffer, {
            contentType: data.submission.mimetype,
            cacheControl: "3600",
            upsert: true
        });
    if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    if (!urlData) throw new Error("Failed to get public URL");
    const fileUrl = urlData.publicUrl;
    try {
        const submission = await prisma.submission.create({
            data: {
                studentId: data.studentId,
                assignmentId: data.assignmentId,
                submissionUrl: fileUrl
            }
        });
        return submission;
    } catch (error) {
        console.error("Error setting submission:", error);
        throw new Error("Failed to set submission");
    }
}

export async function getAssignments(courseId: string) {
    return prisma.assignment.findMany({
        where: {courseId},
        orderBy: {dueDate: 'asc'}
    });
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
        console.error("Error fetching student submissions:", error);
        throw new Error("Failed to fetch student submissions");
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
        console.error("❌ Error fetching instructor submissions:", error);
        throw new Error("Failed to fetch instructor submissions");
    }
}
export async function setGrade(data: {
    submissionId: string;
    marks: number;
    feedback: string
}) {
    try {
        return await prisma.submission.update({
            where: {id: data.submissionId},
            data: {
                grade: data.marks,
                feedback: data.feedback
            }
        });
    } catch (error) {
        console.error("❌ Error setting grade:", error);
        throw new Error("Failed to set grade");
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
        console.error("Error fetching student submissions:", error);
        throw new Error("Failed to fetch student submissions");
    }
}