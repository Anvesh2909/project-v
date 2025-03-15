"use client"
import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

interface Instructor {
    id: string;
    name: string;
    email: string;
    role: 'INSTRUCTOR';
    createdAt: Date;
    branch: string;
    image: string;
    createdCourses: string[];
    courses: Course[];
    course: Course
}

interface InstructorContextType {
    backendUrl: string;
    setInstructorData: (data: Instructor) => void;
    instructorData: Instructor | null;
    setInstructorToken: (token: string) => void;
    instructorToken: string;
    isInstructorAuthenticated: boolean;
    instructorLogout: () => void;
    refreshInstructorData: () => Promise<Instructor | null>;
    courses: Course[];
    getCourses: () => void;
}

interface InstructorContextProviderProps {
    children: ReactNode;
}

export const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    instructorId: string;
    isApproved: boolean;
    courseContent: Chapter[];
    type: string;
    duration: string;
    difficulty: string;
}
export interface Chapter{
    chapterId: string;
    title: string;
    courseId: string;
    content: Lecture[]
}
export interface Lecture{
    id: string;
    title: string;
    resourceType: string;
    resourceUrl: string;
    order: number;
    chapterId: string;
    lectureDuration: number;
    requiresSubmission: boolean
}
const InstructorContextProvider = (props: InstructorContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [instructorData, setInstructorData] = useState<Instructor | null>(null);
    const [instructorToken, setInstructorToken] = useState('');
    const [isInstructorAuthenticated, setIsInstructorAuthenticated] = useState(false);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const REFRESH_INTERVAL = 30000;

    useEffect(() => {
        if (!instructorToken) {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const decodedToken: any = jwtDecode(storedToken);
                if (decodedToken.exp * 1000 < Date.now()) {
                    instructorLogout();
                } else {
                    setInstructorToken(storedToken);
                    setIsInstructorAuthenticated(true);
                    Cookies.set('token', storedToken, { expires: 7 });
                }
            }
        }
        else {
            getInstructorData(instructorToken);
            getCourses(instructorToken);
        }
    }, [instructorToken]);

    const handleSetInstructorToken = (newToken: string) => {
        setInstructorToken(newToken);
        setIsInstructorAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 7 });
        getInstructorData(newToken);
        router.push('/instructor/dashboard');
    };

    const instructorLogout = () => {
        setInstructorToken('');
        setIsInstructorAuthenticated(false);
        setInstructorData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        router.push('/instructor/sign-in');
    };

    const getInstructorData = async (currentToken: string = instructorToken): Promise<Instructor | null> => {
        if (!currentToken) return null;

        try {
            const response = await axios.get(`${backendUrl}/ins/getInstructorProfile`, {
                headers: {
                    token: currentToken
                }
            });
            setInstructorData(response.data);
            return response.data;
        } catch (e) {
            console.error(e);
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                instructorLogout();
            }
            return null;
        }
    };

    const refreshInstructorData = async (): Promise<Instructor | null> => {
        return await getInstructorData();
    };

    const getCourses = async (currentToken: string = instructorToken) => {
        if (!currentToken) return;

        try {
            const response = await axios.get(`${backendUrl}/ins/getInstructorCourses`, {
                headers: {
                    token: currentToken
                }
            });
            setCourses(response.data);
        } catch (e:any) {
            console.error("Failed to fetch instructor courses:", e);
            if (e.response && e.response.status === 401) {
                instructorLogout();
            }
            setCourses([]);
        }
    };

    useEffect(() => {
        if (instructorToken) {
            getInstructorData();
            getCourses();
        }
    }, [instructorToken]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (instructorToken) {
            intervalId = setInterval(() => {
                getInstructorData();
            }, REFRESH_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [instructorToken]);

    const value = {
        backendUrl,
        instructorData,
        setInstructorData,
        setInstructorToken: handleSetInstructorToken,
        instructorToken,
        isInstructorAuthenticated,
        instructorLogout,
        refreshInstructorData,
        courses,
        getCourses
    };

    return (
        <InstructorContext.Provider value={value}>
            {props.children}
        </InstructorContext.Provider>
    );
};

export default InstructorContextProvider;