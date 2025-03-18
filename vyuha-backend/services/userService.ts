import prisma from "../config/dbConfig";
import supabase from "../config/supabase";
// Add to services/userService.ts
import {PrismaClient} from '@prisma/client';

export async function getUser(id: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    return user;
}
export async function updateUserPhoto(id: string, photoBuffer: Buffer, mimetype: string) {
    try {
        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const filePath = `public/${id}.${mimetype.split("/")[1]}`;
        const photoBlob = new Blob([photoBuffer], { type: mimetype });
        const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, photoBlob, {
                cacheControl: "3600",
                upsert: true,
            });
        console.log("Uploading to bucket:", bucketName);
        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        const publicUrl = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        if (!publicUrl) {
            throw new Error("Failed to get public URL of the uploaded image");
        }
        const user = await prisma.user.update({
            where: { id },
            data: {
                image: publicUrl,
            },
        });
        return user;
    } catch (error) {
        console.error("Error updating user photo:", error);
        throw error;
    }
}
export async function getUsers(){
    const users = prisma.user.findMany();
    return users;
}
export const checkEnrollment = async (userId: string, courseId: string) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: userId, courseId: courseId },
    });
    return !!enrollment;
};
export const allEnrollments = async (userId: string) => {
    return prisma.enrollment.findMany({
        where: {studentId: userId},
    });
}
export const setEnrollment = async (userId: string, courseId: string) => {
    return prisma.enrollment.create({
        data: {
            studentId: userId,
            courseId: courseId,
        },
    });
}
export const getChapters = async (courseId: string) => {
    return prisma.chapter.findMany({
        where: { courseId },
    });
}
export const getLectures = async (chapterId: string) => {
    return prisma.lecture.findMany({
        where: { chapterId },
    });
}
export const getCourses = async () => {
    return prisma.course.findMany({
        include: {
            courseContent: {
                orderBy: { order: 'asc' },
                include: {
                    lectures: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    });
}

export const submitAssignment = async (studentId: string, assignmentId: string, submissionUrl: string) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId: assignmentId
        }
    });
    if (!enrollment) {
        throw new Error('Enrollment not found');
    }
    return prisma.submission.upsert({
        where: {
            studentId_assignmentId: {
                studentId,
                assignmentId
            }
        },
        update: {
            submissionUrl,
            submittedAt: new Date()
        },
        create: {
            studentId,
            assignmentId,
            submissionUrl,
            enrollmentId: enrollment.id
        }
    });
};