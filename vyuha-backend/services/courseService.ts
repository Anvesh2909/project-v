import prisma from "../config/dbConfig";
import { createClient } from "@supabase/supabase-js";
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
        // Upload image to Supabase
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
                        content: true,
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
        const chapterId = `${courseId}-CH${String(chapterOrder).padStart(2, '0')}`;
        const chapter = await prisma.chapter.create({
            data: {
                chapterId,
                title,
                courseId,
                chapterOrder
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
            content: true
        },
        orderBy: { chapterOrder: "asc" }
    });
}
export async function addLecture(data: {
    title: string,
    lectureDuration: number,
    chapterId: string,
    content: string,
    resourceType: string,
    resource?: Buffer,
    mimetype?: string,
    resourceUrl?: string
}) {
    console.log("🔄 Processing new lecture with data:", data);

    try {
        const chapter = await prisma.chapter.findUnique({
            where: { chapterId: data.chapterId }
        });
        if (!chapter) {
            throw new Error("Chapter not found");
        }

        const existingLectures = await prisma.lecture.findMany({
            where: { chapterId: data.chapterId }
        });
        const order = existingLectures.length + 1;
        const lectureId = `${data.chapterId}-L${order}`;
        console.log("📌 Generated Lecture ID:", lectureId);

        let resourceUrl = data.resourceUrl;

        if (!resourceUrl && data.resource && data.mimetype) {
            console.log("🚀 Uploading to Supabase...");
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
            console.log("✅ Resource uploaded. Public URL:", resourceUrl);
        }
        const lecture = await prisma.lecture.create({
            data: {
                id: lectureId,
                title: data.title,
                lectureDuration: data.lectureDuration,
                order,
                chapterId: data.chapterId,
                content: data.content,
                resourceType: data.resourceType,
                resourceUrl
            }
        });
        console.log("🎉 Lecture created successfully:", lecture);
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
export async function getCourses() {
    return prisma.course.findMany({
        include: {
            courseContent: {
                select: {
                    chapterId: true,
                },
            },
        },
    });
}