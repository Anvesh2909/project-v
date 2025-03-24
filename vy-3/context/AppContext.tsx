import {createContext, ReactNode, useState, useEffect, useCallback} from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

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

export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    progress: number;
    status: string;
}

export interface Chapter {
    id: string;
    chapterId?: string;
    title: string;
    courseId: string;
    order: number;
    content?: Lecture[];
    lectures?: Lecture[];
}

export interface Lecture {
    id: string;
    title: string;
    resourceType: string;
    resourceUrl: string;
    order: number;
    chapterId: string;
    duration?: number;
    lectureDuration: number;
    requiresSubmission: boolean;
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    courseId: string;
    chapterId?: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    submissionUrl: string;
    submittedAt: Date;
    grade: number | null;
    feedback: string | null;
}

export interface Quiz {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    questionType: string;
    questions: QuizQuestion[];
    dueDate?: string;
}

export interface QuizQuestion {
    id: string;
    quizId: string;
    text: string;
    options: string[];
    correctAnswer: string;
    order: number;
}

export interface QuizSubmission {
    id: string;
    quizId: string;
    studentId: string;
    answers: Record<string, string>;
    score: number;
    submittedAt: Date;
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
    fetchCourses: () => Promise<void>;
    refreshCourses: () => Promise<void>;
    getEnrollments: () => Promise<void>;
    enrollments: Enrollment[];
    assignments: Record<string, Assignment[]>;
    submissions: Record<string, Submission>;
    fetchAssignments: (courseId: string) => Promise<Assignment[]>;
    fetchSubmissions: () => Promise<void>;
    submitAssignment: (assignmentId: string, file: File) => Promise<Submission>;
    quizzes: Record<string, Quiz[]>;
    quizSubmissions: Record<string, QuizSubmission>;
    fetchQuizzes: (courseId: string) => Promise<Quiz[]>;
    submitQuiz: (quizId: string, answers: Record<string, string>) => Promise<QuizSubmission>;
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
    const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
    const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
    const [quizSubmissions, setQuizSubmissions] = useState<Record<string, QuizSubmission>>({});
    const REFRESH_INTERVAL = 5 * 60 * 1000;

    // Initialize token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            Cookies.set('token', storedToken, { expires: 7 });
        }
    }, []);

    // Memoize token expiration check to avoid recreating on each render
    const isTokenExpired = useCallback((token: string) => {
        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    }, []);

    // Memoize logout function
    const logout = useCallback(() => {
        setToken('');
        setIsAuthenticated(false);
        setData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        window.location.replace('/sign-in');
    }, []);

    // Memoize data fetching functions to prevent recreation on each render
    const getData = useCallback(async (currentToken: string = token): Promise<User | null> => {
        if (!currentToken || isTokenExpired(currentToken)) return null;

        try {
            const response = await axios.get(`${backendUrl}/api/getProfile`, {
                headers: { token: currentToken }
            });
            setData(response.data);
            return response.data;
        } catch (e) {
            console.error(e);
            if (axios.isAxiosError(e)) {
                logout();
            }
            return null;
        }
    }, [backendUrl, token, isTokenExpired, logout]);

    const fetchCourses = useCallback(async (currentToken: string = token) => {
        if (!currentToken || isTokenExpired(currentToken)) return;

        try {
            const response = await axios.get(`${backendUrl}/api/getCourses`, {
                headers: { token: currentToken }
            });
            setCourses(response.data);
        } catch (e) {
            console.error("Error fetching courses:", e);
        }
    }, [backendUrl, token, isTokenExpired]);

    const getEnrollments = useCallback(async (currentToken: string = token) => {
        if (!currentToken || isTokenExpired(currentToken)) return;

        try {
            const response = await axios.get(`${backendUrl}/api/getEnrollments`, {
                headers: { token: currentToken }
            });
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
    }, [backendUrl, token, isTokenExpired]);

    const fetchSubmissions = useCallback(async () => {
        if (!token || isTokenExpired(token)) return;

        try {
            const response = await axios.get(`${backendUrl}/api/submissions`, {
                headers: { token }
            });

            const submissionsMap = response.data.reduce((acc: Record<string, any>, submission: any) => {
                acc[submission.assignmentId] = submission;
                return acc;
            }, {});

            setSubmissions(submissionsMap);
        } catch (e) {
            console.error("Error fetching submissions:", e);
        }
    }, [backendUrl, token, isTokenExpired]);

    const fetchAssignments = useCallback(async (courseId: string): Promise<Assignment[]> => {
        if (!token || isTokenExpired(token)) return [];

        try {
            const response = await axios.get(`${backendUrl}/api/getAssignments/${courseId}`, {
                headers: { token }
            });

            setAssignments(prev => ({
                ...prev,
                [courseId]: response.data
            }));

            return response.data;
        } catch (e) {
            console.error("Error fetching assignments:", e);
            return [];
        }
    }, [backendUrl, token, isTokenExpired]);

    const fetchQuizzes = useCallback(async (courseId: string): Promise<Quiz[]> => {
        if (!token || isTokenExpired(token)) return [];

        try {
            const response = await axios.get(`${backendUrl}/api/getQuizzes/${courseId}`, {
                headers: { token }
            });
            setQuizzes(prev => ({
                ...prev,
                [courseId]: response.data
            }));

            return response.data;
        } catch (e) {
            console.error("Error fetching quizzes:", e);
            return [];
        }
    }, [backendUrl, token, isTokenExpired]);

    // Optimize refreshCourses to use Promise.all for parallel requests
    const refreshCourses = useCallback(async (): Promise<void> => {
        await Promise.all([
            fetchCourses(),
            getEnrollments(),
            fetchSubmissions()
        ]);

        if (data?.courses) {
            const promises = data.courses.flatMap(course => [
                fetchAssignments(course.id),
                fetchQuizzes(course.id)
            ]);
            await Promise.all(promises);
        }
    }, [fetchCourses, getEnrollments, fetchSubmissions, fetchAssignments, fetchQuizzes, data?.courses]);

    // Token-handling functions
    const handleSetToken = useCallback((newToken: string) => {
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 3 / 24 });
        getData(newToken);
        router.push('/dashboard');
    }, [getData, router]);

    const submitAssignment = useCallback(async (assignmentId: string, file: File): Promise<Submission> => {
        if (!token || isTokenExpired(token)) throw new Error("Unauthorized");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', assignmentId);
        formData.append('studentId', data?.id ?? '');

        try {
            const response = await axios.post(
                `${backendUrl}/api/submitAssignment`,
                formData,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );
            const newSubmission = response.data;
            setSubmissions(prev => ({
                ...prev,
                [assignmentId]: newSubmission
            }));

            return newSubmission;
        } catch (error) {
            console.error("Error submitting assignment:", error);
            throw error;
        }
    }, [backendUrl, token, isTokenExpired, data?.id]);

    const submitQuiz = useCallback(async (quizId: string, answers: Record<string, string>): Promise<QuizSubmission> => {
        if (!token || isTokenExpired(token)) throw new Error("Unauthorized");

        try {
            const response = await axios.post(
                `${backendUrl}/api/submitQuiz`,
                {
                    quizId,
                    studentId: data?.id,
                    answers
                },
                { headers: { token } }
            );

            const submission = response.data;
            setQuizSubmissions(prev => ({
                ...prev,
                [quizId]: submission
            }));

            return submission;
        } catch (error) {
            console.error("Error submitting quiz:", error);
            throw error;
        }
    }, [backendUrl, token, isTokenExpired, data?.id]);

    const refreshData = useCallback(async (): Promise<User | null> => {
        return await getData();
    }, [getData]);

    // Main effect for data fetching based on token
    useEffect(() => {
        if (!token) return;

        // Initial data fetch
        const initialFetch = async () => {
            await getData();
            await Promise.all([
                fetchCourses(),
                getEnrollments(),
                fetchSubmissions()
            ]);
        };
        initialFetch();

        // Set up refresh intervals
        const profileIntervalId = setInterval(() => {
            getData();
        }, REFRESH_INTERVAL);

        const resourcesIntervalId = setInterval(() => {
            refreshCourses();
        }, REFRESH_INTERVAL * 2);

        return () => {
            clearInterval(profileIntervalId);
            clearInterval(resourcesIntervalId);
        };
    }, [token, getData, fetchCourses, getEnrollments, fetchSubmissions, refreshCourses]);

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
        refreshCourses,
        getEnrollments,
        enrollments,
        assignments,
        submissions,
        fetchAssignments,
        fetchSubmissions,
        submitAssignment,
        quizzes,
        quizSubmissions,
        fetchQuizzes,
        submitQuiz
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;