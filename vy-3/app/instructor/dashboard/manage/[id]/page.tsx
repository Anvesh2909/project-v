"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { InstructorContext } from '@/context/InstructorContext';
import { Chapter,Lecture } from '@/context/InstructorContext';

const ManageCoursePage = () => {
    const params = useParams();
    const courseId = params.id as string;
    const context = useContext(InstructorContext);
    if (!context) {
        return <div className="p-4">Loading instructor context...</div>;
    }
    const { backendUrl, instructorToken } = context;
    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [newLectureTitle, setNewLectureTitle] = useState('');
    const [newLectureContent, setNewLectureContent] = useState('');
    const [newLectureDuration, setNewLectureDuration] = useState(0);
    const [resourceType, setResourceType] = useState('link');
    const [resourceUrl, setResourceUrl] = useState('');
    const [newLectureVideo, setNewLectureVideo] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const handleViewLectureDetails = (lecture: Lecture) => {
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

                const chaptersResponse = await axios.get(`${backendUrl}/ins/getChapters`, {
                    params: { courseId },
                    headers: { token: instructorToken }
                });

                const chaptersData = chaptersResponse.data.filter((chapter: Chapter) => chapter.courseId === courseId);

                const chaptersWithLectures = await Promise.all(chaptersData.map(async (chapter: Chapter) => {
                    const lectures = await getLectures(chapter.chapterId);
                    return {
                        ...chapter,
                        content: lectures
                    };
                }));

                setChapters(chaptersWithLectures);
            } catch (error) {
                console.error("Error fetching course data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && instructorToken) {
            fetchCourseData();
        }
    }, [courseId, instructorToken, backendUrl, reloadTrigger]);

    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) return alert("Please enter a chapter title");
        try {
            const maxChapterOrder = chapters?.reduce((max, chapter) =>
                Math.max(max, chapter?.content?.length || 0), 0) || 0;
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
    const getLectures = async (chapterId: string) => {
        try {
            if (!chapterId) return [];

            const response = await axios.get(`${backendUrl}/ins/getLectures`, {
                params: { chapterId },
                headers: { token: instructorToken }
            });

            const lectures = response.data.filter((lecture: Lecture) => lecture.chapterId === chapterId);

            return lectures;
        } catch (error) {
            console.error("Error fetching lectures:", error);
            return [];
        }
    };
    const handleAddLecture = async () => {
        const isValid = newLectureTitle.trim() && newLectureContent.trim() && selectedChapter &&
            ((resourceType === 'link' && resourceUrl.trim()) ||
                (resourceType !== 'link' && newLectureVideo));

        if (!isValid) return alert("Please fill all required fields");

        const formData = new FormData();
        formData.append('title', newLectureTitle);
        formData.append('lectureDuration', newLectureDuration.toString());
        formData.append('chapterId', selectedChapter);
        formData.append('content', newLectureContent);
        formData.append('resourceType', resourceType);

        if (resourceType === 'link') {
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
            setNewLectureContent('');
            setNewLectureDuration(0);
            setResourceUrl('');
            setNewLectureVideo(null);
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
                            {chapters.map(chapter => (
                                <option key={chapter.chapterId} value={chapter.chapterId}>
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
                                onChange={(e) => setResourceType(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="link">External Link</option>
                                <option value="video">Upload Video</option>
                                <option value="document">Upload Document</option>
                            </select>
                        </div>

                        {resourceType === 'link' ? (
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
                                    Upload {resourceType === 'video' ? 'Video' : 'Document'}
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
                                                    accept={resourceType === 'video' ? 'video/*' : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {resourceType === 'video' ? 'MP4, WebM up to 100MB' : 'PDF, DOC, DOCX up to 10MB'}
                                        </p>
                                        {newLectureVideo && <p className="text-sm text-green-600">{newLectureVideo.name}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">Lecture Content</label>
                            <textarea
                                value={newLectureContent}
                                onChange={(e) => setNewLectureContent(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={7}
                                placeholder="Enter lecture description or content"
                            ></textarea>
                        </div>

                        <button
                            onClick={handleAddLecture}
                            className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
                        {chapters.map((chapter, index) => (
                            <div key={chapter.chapterId} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-800">
                                        <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm">{index + 1}</span>
                                        {chapter.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                  {chapter.content?.length || 0} lecture{chapter.content?.length !== 1 ? 's' : ''}
                </span>
                                </div>

                                {chapter.content && chapter.content.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {chapter.content.map((lecture: Lecture, lectureIndex: number) => (
                                            <li key={lecture.id}
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
            {/* Lecture Details Modal */}
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

                                            {selectedLecture.resourceType === 'link' && selectedLecture.resourceUrl && (
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
        </div>
    );
};
export default ManageCoursePage;