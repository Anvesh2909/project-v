import prisma from "../config/dbConfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createStudent(name: string, uniId: string, password: string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VY${uniYear}`;
        const latestStudent = await prisma.user.findFirst({
            where: {
                id: {
                    startsWith: prefix
                },
                role: "STUDENT"
            },
            orderBy: {
                id: 'desc'
            }
        });

        let sequenceNumber = 1;

        if (latestStudent) {
            const lastSequence = parseInt(latestStudent.id.slice(-4));
            sequenceNumber = lastSequence + 1;
        }
        const formattedSequence = sequenceNumber.toString().padStart(4, '0');
        const id = `${prefix}${formattedSequence}`;

        if (id.length !== 10) {
            throw new Error(`Generated ID ${id} is not exactly 10 digits`);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const student = await prisma.user.create({
            data: {
                id,
                name,
                email: `${uniId}@kluniversity.in`,
                passwordHash,
                collegeID: uniId,
                role: "STUDENT"
            }
        });

        console.log(`Created student with ID: ${student.id}`);
        return "Student created successfully";
    } catch (error) {
        console.error("Error creating student:", error);
        throw error;
    }
}

export function generateToken(userId: string, role: string) {
    const payload = {
        id: userId,
        role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 ) * 24
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign(payload, secret);
}
export async function login(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}

export async function verifyToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    const payload = jwt.verify(token, secret);
    return payload;
}
export async function adminLogin(email: string, password: string) {
    if(email !== process.env.EMAIL || password !== process.env.PASSWORD) {
        throw new Error("Invalid admin credentials");
    }
    const token = generateToken(email, "ADMIN");
    return {token};
}
export async function createInstructor(name:string, uniId:string, password:string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VI${uniYear}`;
        const latestInstructor = await prisma.user.findFirst({
            where: { id: { startsWith: prefix }, role: "INSTRUCTOR" },
            orderBy: { id: 'desc' }
        });

        let sequenceNumber = latestInstructor ? parseInt(latestInstructor.id.slice(-4)) + 1 : 1;
        const id = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;

        if (id.length !== 10) throw new Error(`Generated ID ${id} is not exactly 10 digits`);

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { id, name, email: `${uniId}@kluniversity.in`, passwordHash, collegeID: uniId, role: "INSTRUCTOR" }
        });
        return "Instructor created successfully";
    } catch (error) {
        console.error("Error creating instructor:", error);
        throw error;
    }
}

export async function createMentor(name:string, uniId:string, password:string) {
    try {
        const year = new Date().getFullYear();
        const yy = year.toString().slice(-2);
        const uniYear = uniId.slice(0, 2);
        const prefix = `${yy}VM${uniYear}`;
        const latestMentor = await prisma.user.findFirst({
            where: { id: { startsWith: prefix }, role: "MENTOR" },
            orderBy: { id: 'desc' }
        });

        let sequenceNumber = latestMentor ? parseInt(latestMentor.id.slice(-4)) + 1 : 1;
        const id = `${prefix}${sequenceNumber.toString().padStart(4, '0')}`;

        if (id.length !== 10) throw new Error(`Generated ID ${id} is not exactly 10 digits`);

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { id, name, email: `${uniId}@kluniversity.in`, passwordHash, collegeID: uniId, role: "MENTOR" }
        });
        return "Mentor created successfully";
    } catch (error) {
        console.error("Error creating mentor:", error);
        throw error;
    }
}
export async function mentorLogin(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}
export async function instructorLogin(id: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        throw new Error("Incorrect password");
    }
    const token = generateToken(user.id, user.role);
    return {token};
}