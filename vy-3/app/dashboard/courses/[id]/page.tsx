"use client";
import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
    Clock,
    Calendar,
    Users,
    PlayCircle,
    FileText,
    Download,
    X,
    Verified,
    Lock,
    Upload,
    File,
    BookOpen,
    FileCode,
    Video,
    Image,
    Book
} from 'lucide-react';
import VideoPlayer from "@/components/VideoPlayer";
import { AppContext, Chapter, Lecture } from "@/context/AppContext";
import { useParams } from 'next/navigation';
import axios from "axios";
import { useNotification } from '@/context/NotificationContext';
import Link from "next/link";
const resourceUtils = {
    getIcon: (type: string) => {
        const icons = {
            pdf: <File size={16} className="text-[#EF4444] shrink-0" />,
            document: <FileText size={16} className="text-[#10B981] shrink-0" />,
            video: <Video size={16} className="text-[#2563EB] shrink-0" />,
            image: <Image size={16} className="text-[#8B5CF6] shrink-0" />,
            code: <FileCode size={16} className="text-[#F59E0B] shrink-0" />
        };
        return icons[type.toLowerCase() as keyof typeof icons] || <BookOpen size={16} className="text-[#6B7280] shrink-0" />;
    }
};

const AssignmentCard = ({ assignment, uploading, selectedFile, handleFileChange, handleSubmission, submission }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/70 rounded-xl hover:bg-white/90 transition-all duration-200 border border-[#E2E8F0]/80 shadow-sm">
        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
            <div className="p-2 bg-[#F0FDF4] rounded-lg shadow-sm">
                <FileText size={16} className="text-[#10B981] shrink-0" />
            </div>
            <div className="truncate">
                <p className="text-sm font-semibold text-[#1E293B] truncate">{assignment.title}</p>
                <p className="text-xs text-[#64748B] tracking-wide">ASSIGNMENT</p>
                {submission && (
                    <div className="mt-1.5">
                        {submission.grade !== null ? (
                            <div className="flex flex-col space-y-1.5">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full inline-block w-fit font-medium">
                                    Grade: {submission.grade}
                                </span>
                                {submission.feedback && (
                                    <span className="text-xs text-gray-600 italic">
                                        "{submission.feedback}"
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full inline-block w-fit font-medium">
                                Submitted - Awaiting grade
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
        <div className="ml-2 flex items-center space-x-2">
            {!submission && (
                <>
                    <label className="bg-[#F0FDF4] p-2.5 rounded-lg hover:bg-[#DCFCE7] transition-all duration-200 cursor-pointer shadow-sm">
                        <Upload size={16} className="text-[#10B981]" />
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    {selectedFile && (
                        <button
                            onClick={() => handleSubmission(assignment.id)}
                            disabled={uploading === assignment.id}
                            className="ml-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white p-2.5 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            {uploading === assignment.id ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Submit"}
                        </button>
                    )}
                </>
            )}
            {submission && submission.submissionUrl && (
                <a
                    href={submission.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#EFF6FF] p-2.5 rounded-lg hover:bg-[#DBEAFE] transition-all duration-200 shadow-sm"
                >
                    <Download size={16} className="text-[#2563EB]" />
                </a>
            )}
        </div>
    </div>
);
const LessonItem = ({ lesson, onClick }: any) => (
    <div
        className="flex items-center justify-between p-3.5 bg-white/70 rounded-xl hover:bg-white/90 cursor-pointer transition-all duration-200 border border-[#E2E8F0]/80 shadow-sm hover:shadow-md group"
        onClick={() => onClick(lesson)}
    >
        <div className="flex items-center space-x-3.5 flex-1">
            <div className="p-1.5 bg-[#F8FAFC] rounded-lg group-hover:bg-[#EFF6FF] transition-all duration-200">
                {lesson.resourceType.toLowerCase() === 'video' ?
                    <PlayCircle size={18} className="text-[#2563EB] shrink-0" /> :
                    resourceUtils.getIcon(lesson.resourceType)
                }
            </div>
            <span className="text-sm md:text-base text-[#1E293B] font-medium truncate">
                {lesson.title}
            </span>
        </div>
        <div className="flex items-center">
            <span className="text-xs md:text-sm text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full flex items-center group-hover:bg-[#E2E8F0] transition-all duration-200">
                <Clock size={12} className="mr-1.5" />
                {lesson.duration} min
            </span>
        </div>
    </div>
);

const VideoModal = ({ isOpen, lesson, onClose }: any) => {
    if (!isOpen || !lesson) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl border border-white/20 shadow-2xl animate-scaleIn">
                <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
                    <h3 className="text-lg font-semibold text-[#1E293B]">{lesson.title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#64748B] hover:text-[#1E293B] transition-all duration-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-5">
                    <VideoPlayer
                        videoUrl={lesson.resourceUrl || ""}
                        isOpen={isOpen}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

const CourseDetailsPage = () => {
    const params = useParams();
    const courseId = params.id as string;
    const { data, token, backendUrl, fetchCourses, courses, enrollments } = useContext(AppContext) || {};
    const { showNotification } = useNotification();
    const [videoModal, setVideoModal] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lecture | null>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submissions, setSubmissions] = useState<Record<string, any>>({});
    const [assignments, setAssignments] = useState<any[]>([]);
    const [localIsEnrolled, setLocalIsEnrolled] = useState(false);
    const [loadingResources, setLoadingResources] = useState(false);
    const studentId = data?.id;
    const courseDetails = courses?.find(course => course.id === courseId);
    const enrollmentStatus = useMemo(() => {
        const fromEnrollments = enrollments?.some(e => e.studentId === studentId && e.courseId === courseId) || false;
        const enrollment = data?.courses?.find(c => c.id === courseId)?.enrollments?.find(e => e.studentId === data?.id);
        return {
            isEnrolled: fromEnrollments || localIsEnrolled,
            progress: enrollment?.progress || 0,
            status:  'IN_PROGRESS'
        };
    }, [enrollments, data?.courses, courseId, studentId, data?.id, localIsEnrolled]);
    const allAssignmentsGraded = useMemo(() => {
        if (assignments.length === 0) return false;
        return assignments.every(assignment =>
            submissions[assignment.id] !== undefined &&
            submissions[assignment.id]?.grade !== null
        );
    }, [assignments, submissions]);

// Now create a displayProgress value that shows 100% when all assignments are graded
    const displayProgress = useMemo(() => {
        return allAssignmentsGraded ? 100 : enrollmentStatus.progress;
    }, [allAssignmentsGraded, enrollmentStatus.progress]);
    // Always call this useMemo hook
    const chapters = useMemo(() => courseDetails?.courseContent || [], [courseDetails]);

    useEffect(() => {
        if (token) {
            fetchCourses?.();
        }
    }, [token, fetchCourses]);

    useEffect(() => {
        if (token && backendUrl && courseId) {
            setLoadingResources(true);
            fetchAssignmentsAndSubmissions();
        }
    }, [token, courseId, backendUrl]);

    const fetchAssignmentsAndSubmissions = async () => {
        if (!token || !backendUrl || !courseId) return;

        setLoadingResources(true);

        try {
            // Use Promise.all to fetch both resources in parallel
            const [assignmentsData, submissionsData] = await Promise.all([
                axios.get(`${backendUrl}/api/getAssignments/${courseId}`, {
                    headers: { token }
                }),
                axios.get(`${backendUrl}/api/submissions`, {
                    headers: { token }
                })
            ]);

            // Process both results at once
            const submissionsMap = submissionsData.data.reduce((acc: Record<string, any>, submission: any) => {
                acc[submission.assignmentId] = {
                    ...submission,
                    graded: submission.grade !== null
                };
                return acc;
            }, {});

            // Update both states at once (in a single render cycle)
            setAssignments(assignmentsData.data);
            setSubmissions(submissionsMap);

            return { assignments: assignmentsData.data, submissions: submissionsMap };
        } catch (error) {
            console.error("Error fetching course data:", error);
            showNotification("Failed to load course materials", "error");
            throw error;
        } finally {
            setLoadingResources(false);
        }
    };

    useEffect(() => {
        if (token && backendUrl && courseId) {
            fetchAssignmentsAndSubmissions();
        }
    }, [token, courseId, backendUrl]);

    const handleLessonClick = (lesson: Lecture) => {
        if (lesson.resourceType.toLowerCase() === 'video') {
            setActiveLesson(lesson);
            setVideoModal(true);
        } else if (lesson.resourceUrl) {
            window.open(lesson.resourceUrl, '_blank');
        }
    };

    const handleEnrollment = async () => {
        if (!token || !backendUrl || isEnrolling) return;
        try {
            setIsEnrolling(true);
            await axios.post(`${backendUrl}/api/enroll`, { courseId }, { headers: { token } });

            // Update local enrollment state immediately
            setLocalIsEnrolled(true);

            // Fetch updated data
            await fetchCourses?.();


            showNotification("Successfully enrolled in the course", "success");
        } catch (error) {
            console.error("Error enrolling in course:", error);
            showNotification("Failed to enroll in the course", "error");
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
    };

    const handleSubmission = async (assignmentId: string) => {
        if (!selectedFile || !token || !backendUrl) return;
        setUploading(assignmentId);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('assignmentId', assignmentId);
            formData.append('studentId', data?.id ?? '');

            await axios.post(`${backendUrl}/api/submitAssignment`, formData, {
                headers: { token, 'Content-Type': 'multipart/form-data' }
            });

            setSelectedFile(null);
            showNotification("Assignment submitted successfully", "success");
            fetchAssignmentsAndSubmissions();
        } catch (error) {
            console.error("Error submitting assignment:", error);
            showNotification("Failed to submit assignment", "error");
        } finally {
            setUploading(null);
        }
    };
    const handleCompleteButton = async () => {
        if (!token || !backendUrl) return;

        try {
            // Send completion request to backend
            await axios.put(`${backendUrl}/api/completeEnrollment`,
                { courseId },
                { headers: { token } }
            );
            await fetchCourses?.();
            showNotification("Course completed successfully!", "success");
        } catch (error) {
            console.error("Error completing course:", error);
            showNotification("Failed to complete course", "error");
        }
    };
    if (!data || !courses || courses.length === 0) {
        return (
            <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md">
                    <div className="flex flex-col items-center">
                        <div className="flex space-x-2 mb-4">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-blue-800 font-medium">Loading course content...</p>
                    </div>
                </div>
            </div>
        );
    }
    if (!courseDetails) {
        return (
            <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md text-center">
                    <div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Book className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-gray-800">Course Not Found</h2>
                    <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or may have been removed.</p>
                    <Link href="/dashboard/courses" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 inline-block font-medium">
                        Browse Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Course Header Card */}
                <div className={`${enrollmentStatus.isEnrolled ? 'lg:w-3/5' : 'w-full'} bg-white/70 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden border border-white/30`}>
                    <div className="relative">
                        <img
                            src={courseDetails.image || "/api/placeholder/800/400"}
                            alt={courseDetails.title}
                            className="w-full h-48 md:h-72 object-cover"
                        />
                        {!enrollmentStatus.isEnrolled && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                                Not Enrolled
                            </div>
                        )}
                        {enrollmentStatus.isEnrolled && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                                Enrolled
                            </div>
                        )}
                    </div>

                    <div className="p-5 md:p-7">
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-bold mb-3 text-[#1E293B] tracking-tight">{courseDetails.title}</h1>
                            <p className="text-[#64748B] mb-4 md:mb-5 flex items-center">
                                <Users size={16} className="mr-2 text-blue-500" />
                                Instructor: <span className="font-medium ml-1">{courseDetails.instructorId}</span>
                            </p>
                            <p className="text-[#475569] leading-relaxed">{courseDetails.description}</p>
                        </div>

                        {/* Course Stats Section */}
                        <div className="grid grid-cols-3 gap-4 mt-7 border-t border-gray-100 pt-6">
                            <div className="flex items-center space-x-3.5">
                                <div className="p-2.5 bg-[#EFF6FF] rounded-lg shadow-sm">
                                    <Users size={20} className="text-[#2563EB]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Students</p>
                                    <p className="font-semibold text-[#1E293B]">{courseDetails.enrollments?.length || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3.5">
                                <div className="p-2.5 bg-[#FCE7F3] rounded-lg shadow-sm">
                                    <Clock size={20} className="text-[#EC4899]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Duration</p>
                                    <p className="font-semibold text-[#1E293B]">{courseDetails.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3.5">
                                <div className="p-2.5 bg-[#F5F3FF] rounded-lg shadow-sm">
                                    <Calendar size={20} className="text-[#8B5CF6]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Difficulty</p>
                                    <p className="font-semibold text-[#1E293B]">{courseDetails.difficulty}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Only show when enrolled */}
                {enrollmentStatus.isEnrolled && (
                    <div className="lg:w-2/5 flex flex-col h-full">
                        {/* Progress Card */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow-md mb-6">
                            <h2 className="text-lg font-bold mb-4 text-[#1E293B] flex items-center">
                                <Verified size={20} className="text-[#2563EB] mr-2.5" />
                                Your Progress
                            </h2>
                            <div className="mb-5">
                                <div className="flex justify-between mb-2.5">
        <span className="text-sm font-medium text-[#334155]">
            Course Completion
        </span>
                                    <span className="text-sm font-semibold text-[#2563EB]">
            {displayProgress}%
        </span>
                                </div>
                                <div className="w-full bg-[#F1F5F9] rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-full"
                                        style={{ width: `${displayProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Show Complete Course button if progress is sufficient but course isn't completed yet */}
                            {displayProgress >= 80 && enrollmentStatus.status !== 'COMPLETED' && (
                                <button
                                    onClick={() => handleCompleteButton()}
                                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white py-2.5 px-4 rounded-xl hover:shadow-lg hover:opacity-95 transition-all duration-300 flex items-center justify-center font-medium"
                                >
                                    Complete Course
                                </button>
                            )}

                            {/* Only show View Certificate button if course is actually completed */}
                            {enrollmentStatus.status === 'COMPLETED' && (
                                <button className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white py-2.5 px-4 rounded-xl hover:shadow-lg hover:opacity-95 transition-all duration-300 flex items-center justify-center font-medium">
                                    <Verified className="h-4 w-4 mr-2.5" />
                                    View Certificate
                                </button>
                            )}
                        </div>

                        {/* Assignments */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow-md flex-grow">
                            <h2 className="text-lg font-bold mb-4 text-[#1E293B] flex items-center">
                                <FileText size={20} className="text-[#10B981] mr-2.5" />
                                Assignments
                                {loadingResources && <span className="ml-2 text-xs text-blue-500">(Loading...)</span>}
                            </h2>
                            <div className="space-y-3.5 overflow-y-auto pr-1.5" style={{ maxHeight: 'calc(100% - 56px)' }}>
                                {assignments.length > 0 ? (
                                    assignments.map((assignment, index) => (
                                        <AssignmentCard
                                            key={index}
                                            assignment={assignment}
                                            uploading={uploading}
                                            selectedFile={selectedFile}
                                            handleFileChange={handleFileChange}
                                            handleSubmission={handleSubmission}
                                            submission={submissions[assignment.id]}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-[#E2E8F0] rounded-xl bg-white/40">
                                        <FileText size={28} className="text-[#CBD5E1] mx-auto mb-3" />
                                        <p className="text-sm text-[#64748B] font-medium">No assignments available</p>
                                        <p className="text-xs text-[#94A3B8] mt-2">Assignment documents will be added soon</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full">
                {enrollmentStatus.isEnrolled ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-5 md:p-7 border border-white/30">
                        <h2 className="text-lg md:text-xl font-bold mb-6 text-[#1E293B] flex items-center">
                            <PlayCircle size={22} className="text-[#2563EB] mr-2.5" />
                            Course Content
                        </h2>

                        {chapters?.length > 0 ? (
                            chapters.map((chapter, index) => (
                                <div key={index} className="mb-9 last:mb-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-md md:text-lg text-[#1E293B] flex items-center">
                                            <span className="bg-[#EFF6FF] text-[#2563EB] w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2.5 shadow-sm">
                                                {index + 1}
                                            </span>
                                            {chapter.title}
                                        </h3>
                                        <div className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-3.5 py-1.5 rounded-full shadow-sm">
                                            {chapter.lectures?.length || 0} lessons
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-l-2 border-[#E2E8F0] pl-5 ml-3.5">
                                        {(chapter.lectures || chapter.content || []).map((lesson, lessonIndex) => (
                                            <LessonItem key={lessonIndex} lesson={lesson} onClick={handleLessonClick} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border border-dashed border-[#E2E8F0] rounded-xl bg-white/40">
                                <PlayCircle size={36} className="text-[#CBD5E1] mx-auto mb-4" />
                                <p className="text-[#64748B] font-medium">No lessons available yet</p>
                                <p className="text-sm text-[#94A3B8] mt-2">Check back soon for updates</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-7 border border-white/30 text-center">
                        <div className="max-w-md mx-auto py-8">
                            <div className="bg-gradient-to-r from-[#EFF6FF] to-[#E0F2FE] p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-md">
                                <Lock size={28} className="text-[#2563EB]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3.5 text-[#1E293B]">Enroll to Get Access</h2>
                            <p className="text-[#475569] mb-7 leading-relaxed">Enroll in this course to access all lessons, assignments, and resources.</p>
                            <button
                                className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white py-3.5 px-5 rounded-xl hover:shadow-lg hover:opacity-95 transition-all duration-300 font-medium text-base"
                                onClick={handleEnrollment}
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? (
                                    <span className="flex items-center justify-center">
                                        <span className="animate-spin mr-2.5">⏳</span> Enrolling...
                                    </span>
                                ) : (
                                    "Enroll Now"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <VideoModal isOpen={videoModal} lesson={activeLesson} onClose={() => setVideoModal(false)} />

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s
                }
            `}</style>
        </div>
    );
};
export default CourseDetailsPage;