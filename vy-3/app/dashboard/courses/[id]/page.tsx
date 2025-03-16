"use client";
import React, { useState, useContext, useEffect } from 'react';
import { Clock, Calendar, Users, PlayCircle, FileText, Download, X, Verified, Lock, Upload, File, BookOpen, FileCode, Video, Image } from 'lucide-react';
import VideoPlayer from "@/components/VideoPlayer";
import { AppContext, Chapter, Lecture } from "@/context/AppContext";
import { useParams } from 'next/navigation';
import axios from "axios";
import { useNotification } from '@/context/NotificationContext';
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

const AssignmentCard = ({ resource, uploading, selectedFile, handleFileChange, handleSubmission }: any) => (
    <div className="flex items-center justify-between p-3 bg-[#F8F9FE]/50 rounded-xl hover:bg-[#F1F5F9]/70 transition-colors border border-[#E2E8F0]/50">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-1.5 bg-[#F0FDF4] rounded-lg">
                <FileText size={16} className="text-[#10B981] shrink-0" />
            </div>
            <div className="truncate">
                <p className="text-sm font-medium text-[#1E293B] truncate">{resource.title}</p>
                <p className="text-xs text-[#64748B]">DOCUMENT</p>
            </div>
        </div>
        {resource.requiresSubmission ? (
            <div className="ml-2 flex items-center">
                <label className="bg-[#F0FDF4] p-2 rounded-lg hover:bg-[#DCFCE7] transition-colors cursor-pointer">
                    <Upload size={16} className="text-[#10B981]" />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                {selectedFile && (
                    <button
                        onClick={() => handleSubmission(resource.id)}
                        disabled={uploading === resource.id}
                        className="ml-2 bg-[#10B981] text-white p-2 rounded-lg flex items-center justify-center"
                    >
                        {uploading === resource.id ? <span className="animate-spin">⏳</span> : "Submit"}
                    </button>
                )}
            </div>
        ) : resource.resourceUrl && (
            <a
                href={resource.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F1F5F9] p-2 rounded-lg hover:bg-[#E2E8F0] transition-colors"
            >
                <Download size={16} className="text-[#64748B]" />
            </a>
        )}
    </div>
);

const LessonItem = ({ lesson, onClick }: any) => (
    <div
        className="flex items-center justify-between p-3.5 bg-[#F8F9FE]/50 rounded-xl hover:bg-[#F1F5F9]/70 cursor-pointer transition-colors border border-[#E2E8F0]/50"
        onClick={() => onClick(lesson)}
    >
        <div className="flex items-center space-x-3 flex-1">
            {lesson.resourceType.toLowerCase() === 'video' ?
                <PlayCircle size={18} className="text-[#2563EB] shrink-0" /> :
                resourceUtils.getIcon(lesson.resourceType)
            }
            <span className="text-sm md:text-base text-[#1E293B] font-medium truncate">
        {lesson.title}
      </span>
        </div>
        <div className="flex items-center">
      <span className="text-xs md:text-sm text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full flex items-center">
        <Clock size={12} className="mr-1" />
          {lesson.lectureDuration} min
      </span>
        </div>
    </div>
);

const VideoModal = ({ isOpen, lesson, onClose }: any) => {
    if (!isOpen || !lesson) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl border border-white/20 shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
                    <h3 className="text-lg font-semibold text-[#1E293B]">{lesson.title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#64748B] hover:text-[#1E293B] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">
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
    const [videoModal, setVideoModal] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lecture | null>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { showNotification } = useNotification();
    useEffect(() => {
        if (token) {
            fetchCourses?.();
        }
    }, [token]);

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
            fetchCourses?.();
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

    const handleSubmission = async (lectureId: string) => {
        if (!selectedFile || !token || !backendUrl) return;
        setUploading(lectureId);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('lectureId', lectureId);
            await axios.post(`${backendUrl}/api/submitAssignment`, formData, {
                headers: { token, 'Content-Type': 'multipart/form-data' }
            });
            setSelectedFile(null);
            showNotification("Assignment submitted successfully", "success");
        } catch (error) {
            console.error("Error submitting assignment:", error);
            showNotification("Failed to submit assignment", "error");
        } finally {
            setUploading(null);
        }
    };

    if (!data || !courses || courses.length === 0) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const courseDetails = courses.find(course => course.id === courseId);
    if (!courseDetails) {
        return <div className="flex justify-center items-center h-screen">Course not found</div>;
    }
    console.log(courseDetails);
    const studentId = data?.id;
    const isEnrolled = enrollments?.some(e => e.studentId === studentId && e.courseId === courseId) || false;
    const enrollment = data.courses?.find(c => c.id === courseId)?.enrollments?.find(e => e.studentId === data.id);
    const progress = enrollment?.progress || 0;

    const chapters = courseDetails.courseContent || [];

    // Get all document resources from all chapters
    const documentResources = chapters.flatMap(chapter => {
        const lecturesList = chapter.lectures || chapter.content || [];
        return lecturesList.filter(lecture =>
            (lecture.resourceUrl || lecture.requiresSubmission) &&
            lecture.resourceType.toLowerCase() === 'document'
        );
    });

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Top Section - Course Header */}
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Course Header Card - Full width when not enrolled */}
                <div className={`${isEnrolled ? 'lg:w-3/5' : 'w-full'} bg-glass-white backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-white/20`}>
                    <div className="relative">
                        <img
                            src={courseDetails.image || "/api/placeholder/800/400"}
                            alt={courseDetails.title}
                            className="w-full h-48 md:h-72 object-cover"
                        />
                        {!isEnrolled && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Not Enrolled
                            </div>
                        )}
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="flex-1">
                            <h1 className="text-xl md:text-3xl font-bold mb-2 text-[#1E293B]">{courseDetails.title}</h1>
                            <p className="text-[#64748B] mb-3 md:mb-4">Instructor: {courseDetails.instructorId}</p>
                            <p className="text-[#475569] leading-relaxed">{courseDetails.description}</p>
                        </div>

                        {/* Course Stats Section */}
                        <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#EFF6FF] rounded-lg">
                                    <Users size={20} className="text-[#2563EB]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Students</p>
                                    <p className="font-medium text-[#1E293B]">{courseDetails.enrollments?.length || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#FCE7F3] rounded-lg">
                                    <Clock size={20} className="text-[#EC4899]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Duration</p>
                                    <p className="font-medium text-[#1E293B]">{courseDetails.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#F5F3FF] rounded-lg">
                                    <Calendar size={20} className="text-[#8B5CF6]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#64748B]">Difficulty</p>
                                    <p className="font-medium text-[#1E293B]">{courseDetails.difficulty}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Only show when enrolled */}
                {isEnrolled && (
                    <div className="lg:w-2/5 flex flex-col h-full">
                        {/* Progress Card */}
                        <div className="bg-glass-white backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm mb-6">
                            <h2 className="text-lg font-bold mb-4 text-[#1E293B] flex items-center">
                                <Verified size={20} className="text-[#2563EB] mr-2" />
                                Your Progress
                            </h2>
                            <div className="mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-[#64748B]">Course Completion</span>
                                    <span className="text-sm font-medium text-[#2563EB]">{progress}%</span>
                                </div>
                                <div className="w-full bg-[#F1F5F9] rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-full h-2.5 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            {progress >= 80 && (
                                <button className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white py-2.5 px-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center font-medium">
                                    <Verified className="h-4 w-4 mr-2" />
                                    View Certificate
                                </button>
                            )}
                        </div>

                        {/* Assignments */}
                        <div className="bg-glass-white backdrop-blur-sm rounded-2xl shadow-sm p-4 border border-white/20 flex-1">
                            <h2 className="text-lg font-bold mb-4 text-[#1E293B] flex items-center">
                                <FileText size={20} className="text-[#8B5CF6] mr-2" />
                                Assignments
                            </h2>
                            <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100% - 56px)' }}>
                                {documentResources.length > 0 ? (
                                    documentResources.map((resource, index) => (
                                        <AssignmentCard
                                            key={index}
                                            resource={resource}
                                            uploading={uploading}
                                            selectedFile={selectedFile}
                                            handleFileChange={handleFileChange}
                                            handleSubmission={handleSubmission}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]/50">
                                        <FileText size={24} className="text-[#CBD5E1] mx-auto mb-2" />
                                        <p className="text-sm text-[#64748B]">No assignments available</p>
                                        <p className="text-xs text-[#94A3B8] mt-1">Assignment documents will be added soon</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Course Content - Full width */}
            <div className="w-full">
                {isEnrolled ? (
                    <div className="bg-glass-white backdrop-blur-sm rounded-2xl shadow-sm p-4 md:p-6 border border-white/20">
                        <h2 className="text-lg md:text-xl font-bold mb-5 text-[#1E293B] flex items-center">
                            <PlayCircle size={22} className="text-[#2563EB] mr-2" />
                            Course Content
                        </h2>

                        {chapters?.length > 0 ? (
                            chapters.map((chapter, index) => (
                                <div key={index} className="mb-8 last:mb-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-md md:text-lg text-[#1E293B] flex items-center">
                    <span className="bg-[#EFF6FF] text-[#2563EB] w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                        {index + 1}
                    </span>
                                            {chapter.title}
                                        </h3>
                                        <div className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full">
                                            {chapter.lectures?.length || 0} lessons
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 border-l-2 border-[#E2E8F0] pl-4 ml-3">
                                        {(chapter.lectures || chapter.content || []).map((lesson, lessonIndex) => (
                                            <LessonItem key={lessonIndex} lesson={lesson} onClick={handleLessonClick} />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]/50">
                                <PlayCircle size={32} className="text-[#CBD5E1] mx-auto mb-3" />
                                <p className="text-[#64748B] font-medium">No lessons available yet</p>
                                <p className="text-sm text-[#94A3B8] mt-1">Check back soon for updates</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-glass-white backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/20 text-center">
                        <div className="max-w-md mx-auto py-6">
                            <div className="bg-[#EFF6FF] p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Lock size={24} className="text-[#2563EB]" />
                            </div>
                            <h2 className="text-xl font-bold mb-3 text-[#1E293B]">Enroll to Get Access</h2>
                            <p className="text-[#475569] mb-6">Enroll in this course to access all the lessons and resources.</p>
                            <button
                                className="w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white py-3 px-4 rounded-xl hover:opacity-90 transition-opacity font-medium"
                                onClick={handleEnrollment}
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? (
                                    <span className="flex items-center justify-center">
                                        <span className="animate-spin mr-2">⏳</span> Enrolling...
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
        </div>
    );
};

export default CourseDetailsPage;