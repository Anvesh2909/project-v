import prisma from "../config/dbConfig";
import supabase from "../config/supabase";

export async function getUser(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                collegeID: true,
                branch: true
            }
        });

        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        return user;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function updateUserPhoto(id: string, photoBuffer: Buffer, mimetype: string) {
    try {
        // Validate inputs
        if (!photoBuffer || photoBuffer.length === 0) {
            throw new Error("Invalid photo data");
        }

        const bucketName = process.env.SUPABASE_BUCKET_NAME || "vyuha-uploads";
        const fileExtension = mimetype.split("/")[1];
        const filePath = `public/${id}.${fileExtension}`;

        // Upload directly using the buffer in Node.js
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, photoBuffer, {
                contentType: mimetype,
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        if (!urlData) throw new Error("Failed to get public URL");

        const user = await prisma.user.update({
            where: { id },
            data: { image: urlData.publicUrl },
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

export async function submitAssignment(studentId: string, assignmentId: string, submissionUrl: string) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            select: { courseId: true }
        });
        if (!assignment) {
            throw new Error(`Assignment with ID ${assignmentId} not found`);
        }
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId: assignment.courseId
            }
        });

        if (!enrollment) {
            throw new Error(`Student ${studentId} is not enrolled in the course for this assignment`);
        }

        // Use a transaction to ensure data consistency
        return prisma.$transaction(async (tx) => {
            // Create or update the submission
            const submission = await tx.submission.upsert({
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

            return submission;
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        throw new Error(`Failed to submit assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}