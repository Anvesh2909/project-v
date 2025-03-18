"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { InstructorContext } from '@/context/InstructorContext';
enum ResourceType {
    LINK = "LINK",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT"
}
const ManageCoursePage = () => {
    const params = useParams();
    const courseId = params.id as string;
    const context = useContext(InstructorContext);
    if (!context) {
        return <div className="p-4">Loading instructor context...</div>;
    }
    const { backendUrl, instructorToken } = context;
    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newLectureTitle, setNewLectureTitle] = useState('');
    const [newLectureDuration, setNewLectureDuration] = useState(0);
    const [resourceType, setResourceType] = useState<ResourceType>(ResourceType.LINK);
    const [resourceUrl, setResourceUrl] = useState('');
    const [newLectureVideo, setNewLectureVideo] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<any>(null);
    const [requiresSubmission, setRequiresSubmission] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
    const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');
    const [newAssignmentMaxMarks, setNewAssignmentMaxMarks] = useState(100);
    const [viewingAssignment, setViewingAssignment] = useState<any>(null);
    const [isViewAssignmentModalOpen, setIsViewAssignmentModalOpen] = useState(false);
    const handleViewLectureDetails = (lecture: any) => {
        setSelectedLecture(lecture);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLecture(null);
    };

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const courseResponse = await axios.get(`${backendUrl}/ins/getCourse/${courseId}`, {
                    headers: { token: instructorToken }
                });
                setCourse(courseResponse.data);
                if (courseResponse.data?.courseContent) {
                    setChapters(courseResponse.data.courseContent);
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && instructorToken) {
            fetchCourseData();
        }
    }, [courseId, instructorToken, reloadTrigger, backendUrl]);
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await axios.get(`${backendUrl}/ins/getCourseAssignments/${courseId}`, {
                    headers: { token: instructorToken }
                });
                setAssignments(response.data || []);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            }
        };

        if (courseId && instructorToken) {
            fetchAssignments();
        }
    }, [courseId, instructorToken, reloadTrigger, backendUrl]);
    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) return alert("Please enter a chapter title");
        try {
            const maxChapterOrder = chapters?.reduce((max, chapter) =>
                Math.max(max, chapter.order || 0), 0) || 0;
            await axios.post(`${backendUrl}/ins/createChapter`, {
                courseId,
                title: newChapterTitle,
                chapterOrder: maxChapterOrder + 1
            }, {
                headers: { token: instructorToken }
            });
            setNewChapterTitle('');
            setReloadTrigger(prev => prev + 1);
        } catch (e) {
            console.error("Error adding chapter:", e);
        }
    };

    const handleAddLecture = async () => {
        const isValid = newLectureTitle.trim() && selectedChapter &&
            ((resourceType === ResourceType.LINK && resourceUrl.trim()) ||
                (resourceType !== ResourceType.LINK && newLectureVideo));

        if (!isValid) return alert("Please fill all required fields");

        const formData = new FormData();
        formData.append('title', newLectureTitle);
        formData.append('lectureDuration', newLectureDuration.toString());
        formData.append('chapterId', selectedChapter);
        formData.append('resourceType', resourceType); // This should match backend enum
        formData.append('requiresSubmission', requiresSubmission.toString());

        if (resourceType === ResourceType.LINK) {
            formData.append('resourceUrl', resourceUrl);
        } else if (newLectureVideo) {
            formData.append('file', newLectureVideo);
        }

        try {
            await axios.post(`${backendUrl}/ins/addLecture`, formData, {
                headers: {
                    token: instructorToken,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setNewLectureTitle('');
            setNewLectureDuration(0);
            setResourceUrl('');
            setNewLectureVideo(null);
            setRequiresSubmission(false);
            setReloadTrigger(prev => prev + 1);
        } catch (e: any) {
            console.error("Error adding lecture:", e.response?.data || e.message);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewLectureVideo(e.target.files[0]);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading course data...</div>;
    }
    const handleAddAssignment = async () => {
        if (!newAssignmentTitle.trim() || !newAssignmentDescription.trim() || !newAssignmentDueDate) {
            return alert("Please fill all required fields");
        }

        try {
            await axios.post(`${backendUrl}/ins/setAssignment`, {
                courseId,
                title: newAssignmentTitle,
                description: newAssignmentDescription,
                dueDate: new Date(newAssignmentDueDate),
                maxMarks: newAssignmentMaxMarks
            }, {
                headers: { token: instructorToken }
            });

            setNewAssignmentTitle('');
            setNewAssignmentDescription('');
            setNewAssignmentDueDate('');
            setNewAssignmentMaxMarks(100);
            setIsAssignmentModalOpen(false);
            setReloadTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error creating assignment:", error);
        }
    };

    const handleViewAssignment = (assignment: any) => {
        setViewingAssignment(assignment);
        setIsViewAssignmentModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setIsViewAssignmentModalOpen(false);
        setViewingAssignment(null);
    };
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{course?.title || 'Course Management'}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${course?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {course?.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
            </div>
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Course Details</h2>
                <div className="flex flex-col md:flex-row gap-8">
                    {course?.image && (
                        <div className="w-full md:w-1/3">
                            <div className="rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={course.image}
                                    alt={course?.title || "Course image"}
                                    className="w-full h-auto object-cover"
                                    style={{ maxHeight: "250px" }}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Course+Image';
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="w-full md:w-2/3 space-y-3">
                        <p className="text-gray-700"><span className="font-medium text-gray-900">Description:</span> {course?.description}</p>
                        {course?.price !== undefined && <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> ${course.price}</p>}
                        {course?.category && <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {course.category}</p>}
                        {course?.courseType && <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {course.courseType}</p>}
                        {course?.difficulty && <p className="text-gray-700"><span className="font-medium text-gray-900">Difficulty:</span> {course.difficulty}</p>}
                        {course?.duration && <p className="text-gray-700"><span className="font-medium text-gray-900">Duration:</span> {course.duration}</p>}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Add New Chapter</h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Chapter Title"
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleAddChapter}
                            className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Add Chapter
                        </button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Quick Select</h2>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium text-gray-700">Select Chapter</label>
                        <select
                            value={selectedChapter}
                            onChange={(e) => setSelectedChapter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a chapter</option>
                            {chapters.map((chapter: any) => (
                                <option key={chapter.id} value={chapter.id}>
                                    {chapter.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Add New Lecture</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">Lecture Title</label>
                            <input
                                type="text"
                                value={newLectureTitle}
                                onChange={(e) => setNewLectureTitle(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter lecture title"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">Duration (minutes)</label>
                            <input
                                type="number"
                                value={newLectureDuration || ''}
                                onChange={(e) => setNewLectureDuration(Number(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min={0}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">Resource Type</label>
                            <select
                                value={resourceType}
                                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={ResourceType.LINK}>External Link</option>
                                <option value={ResourceType.VIDEO}>Upload Video</option>
                                <option value={ResourceType.DOCUMENT}>Upload Document</option>
                            </select>
                        </div>

                        {resourceType === ResourceType.LINK ? (
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">Resource URL</label>
                                <input
                                    type="url"
                                    value={resourceUrl}
                                    onChange={(e) => setResourceUrl(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resource URL"
                                />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block mb-2 font-medium text-gray-700">
                                    Upload {resourceType === ResourceType.VIDEO ? 'Video' : 'Document'}
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                    accept={resourceType === ResourceType.VIDEO ? 'video/*' : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {resourceType === ResourceType.VIDEO? 'MP4, WebM up to 100MB' : 'PDF, DOC, DOCX up to 10MB'}
                                        </p>
                                        {newLectureVideo && <p className="text-sm text-green-600">{newLectureVideo.name}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="flex items-center">
                                <input
                                    id="requires-submission"
                                    type="checkbox"
                                    checked={requiresSubmission}
                                    onChange={(e) => setRequiresSubmission(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="requires-submission" className="ml-2 block text-sm text-gray-700">
                                    Requires submission from students
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Enable this if students need to submit work for this lecture
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleAddLecture}
                            className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Add Lecture
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">Course Content</h2>

                {chapters.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="mt-2 text-gray-500">No chapters yet. Add your first chapter to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter: any, index: number) => (
                            <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-800">
                                        <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm">{index + 1}</span>
                                        {chapter.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {chapter.lectures?.length || 0} lecture{chapter.lectures?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {chapter.lectures && chapter.lectures.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {chapter.lectures.map((lecture: any, lectureIndex: number) => (
                                            <li key={lecture.id || `lecture-${lectureIndex}`}
                                                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleViewLectureDetails(lecture)}>
                                                <div className="mr-4 text-gray-500 flex-shrink-0">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs">
                                                        {lectureIndex + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-md font-medium">{lecture.title}</h4>
                                                    <div className="mt-1 flex items-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            lecture.resourceType === 'video' ? 'bg-red-100 text-red-800' :
                                                                lecture.resourceType === 'document' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {lecture.resourceType}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 p-4">No lectures in this chapter yet</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && selectedLecture && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 pb-2 border-b" id="modal-title">
                                            Lecture Details
                                        </h3>

                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                                                <p className="mt-1 text-base">{selectedLecture.title}</p>
                                            </div>

                                            {selectedLecture.lectureDuration && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                                                    <p className="mt-1 text-base">{selectedLecture.lectureDuration} minutes</p>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Resource Type</h4>
                                                <p className="mt-1 text-base capitalize">{selectedLecture.resourceType}</p>
                                            </div>

                                            {selectedLecture.resourceUrl && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Resource URL</h4>
                                                    <a
                                                        href={selectedLecture.resourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 text-blue-600 hover:underline block truncate"
                                                    >
                                                        {selectedLecture.resourceUrl}
                                                    </a>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Submission Required</h4>
                                                <p className="mt-1 text-base">
                                                    {selectedLecture.requiresSubmission ? "Yes" : "No"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Assignments Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold pb-2 border-b border-gray-200">Course Assignments</h2>
                    <button
                        onClick={() => setIsAssignmentModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Add Assignment
                    </button>
                </div>

                {assignments.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No assignments yet. Add your first assignment for students.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleViewAssignment(assignment)}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-800">{assignment.title}</h3>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
                                </div>
                                <p className="mt-2 text-gray-600 line-clamp-2">{assignment.description}</p>
                                <div className="mt-3 flex items-center text-sm text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Max marks: {assignment.maxMarks || 100}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Assignment Modal */}
            {isAssignmentModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsAssignmentModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 pb-2 border-b">
                                    Add New Assignment
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={newAssignmentTitle}
                                            onChange={(e) => setNewAssignmentTitle(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Assignment title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={newAssignmentDescription}
                                            onChange={(e) => setNewAssignmentDescription(e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Assignment description and instructions"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={newAssignmentDueDate}
                                            onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks</label>
                                        <input
                                            type="number"
                                            value={newAssignmentMaxMarks}
                                            onChange={(e) => setNewAssignmentMaxMarks(Number(e.target.value))}
                                            min={1}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleAddAssignment}
                                >
                                    Create Assignment
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsAssignmentModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Assignment Modal */}
            {isViewAssignmentModalOpen && viewingAssignment && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeAssignmentModal}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 pb-2 border-b" id="modal-title">
                                            Assignment Details
                                        </h3>

                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                                                <p className="mt-1 text-base">{viewingAssignment.title}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                                                <p className="mt-1 text-base whitespace-pre-line">{viewingAssignment.description}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                                                <p className="mt-1 text-base">{new Date(viewingAssignment.dueDate).toLocaleDateString()}</p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Maximum Marks</h4>
                                                <p className="mt-1 text-base">{viewingAssignment.maxMarks || 100}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={closeAssignmentModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageCoursePage;