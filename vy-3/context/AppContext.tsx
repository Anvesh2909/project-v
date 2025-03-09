"use client"
import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
    enrollments: Enrollment[];
    difficulty: string;
}
interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    progress: number;
}
export interface Chapter {
    chapterId: string;
    title: string;
    courseId: string;
    content: Lecture[];
}

export interface Lecture {
    id: string;
    title: string;
    resourceType: string;
    resourceUrl: string;
    order: number;
    chapterId: string;
    lectureDuration: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    collegeID: string | null;
    role: 'INSTRUCTOR' | 'STUDENT';
    cgpa: number | null;
    phoneNo: string | null;
    address: string | null;
    dob: string | null;
    studentStatus: string | null;
    silPoints: number | null;
    image: string;
    year: number | null;
    semester: number | null;
    branch: string | null;
    createdAt: Date;
    courses: Course[];
}

interface AppContextType {
    backendUrl: string;
    setData: (data: User) => void;
    data: User | null;
    setToken: (token: string) => void;
    token: string;
    isAuthenticated: boolean;
    logout: () => void;
    refreshData: () => Promise<User | null>;
    courses: Course[];
    fetchCourses: () => void;
    getEnrollments: () => Promise<void>;
    enrollments: Enrollment[];
}

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = (props: AppContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [data, setData] = useState<User | null>(null);
    const [token, setToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const REFRESH_INTERVAL = 30000;
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            Cookies.set('token', storedToken, { expires: 7 });
        }
    }, []);

    const fetchCourses = async (currentToken: string = token) => {
        if (!currentToken) return;

        try {
            const response = await axios.get(`${backendUrl}/api/getCourses`, {
                headers: {
                    token: currentToken
                }
            });
            setCourses(response.data);
        } catch (e) {
            console.error("Error fetching courses:", e);
        }
    }

    const handleSetToken = (newToken: string) => {
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 7 });
        getData(newToken);
        router.push('/dashboard');
    };

    const logout = () => {
        setToken('');
        setIsAuthenticated(false);
        setData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        router.push('/sign-in');
    };

    const getData = async (currentToken: string = token): Promise<User | null> => {
        if (!currentToken) return null;

        try {
            const response = await axios.get(`${backendUrl}/api/getProfile`, {
                headers: {
                    token: currentToken
                }
            });
            setData(response.data);
            return response.data;
        } catch (e) {
            console.error(e);
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                logout();
            }
            return null;
        }
    };

    const refreshData = async (): Promise<User | null> => {
        return await getData();
    };

    useEffect(() => {
        if (token) {
            getData();
            fetchCourses(token);
            getEnrollments();
        }
    }, [token]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (token) {
            intervalId = setInterval(() => {
                getData();
                fetchCourses(token);
                getEnrollments();
            }, REFRESH_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [token]);

    const getEnrollments = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${backendUrl}/api/getEnrollments`, {
                headers: {
                    token
                }
            });
            console.log("Fetched enrollments:", response.data);
            setData((prevData) => {
                if (prevData) {
                    return {
                        ...prevData,
                        courses: response.data
                    };
                }
                return prevData;
            });
            setEnrollments(response.data);
        } catch (e) {
            console.error("Error fetching enrollments:", e);
        }
    }

    const value = {
        backendUrl,
        data,
        setData,
        setToken: handleSetToken,
        token,
        isAuthenticated,
        logout,
        refreshData,
        courses,
        fetchCourses,
        getEnrollments,
        enrollments
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;