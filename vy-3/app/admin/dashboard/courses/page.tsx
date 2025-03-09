"use client"
import React, { useContext, useState } from 'react'
import { AdminContext } from '@/context/AdminContext'
import axios from 'axios'
import Image from 'next/image'
import { Check, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react'

const CoursesPage = () => {
    const adminContext = useContext(AdminContext)
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        visible: boolean;
    }>({ message: '', type: 'success', visible: false })
    const [searchQuery, setSearchQuery] = useState<string>('')
    const courses = adminContext?.courses || []

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type, visible: true })
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }))
        }, 3000)
    }

    const handleVerify = async (courseId: string) => {
        try {
            setIsProcessing(courseId)
            await axios.put(`${adminContext?.backendUrl}/admin/verifyCourse`,
                { courseId },
                {
                    headers: {
                        token: adminContext?.adminToken || ''
                    }
                }
            )

            const updatedCourses = courses.map(course =>
                course.id === courseId ? {...course, isApproved: true} : course
            )
            adminContext?.setCourses(updatedCourses)

            showNotification("Course verified successfully", "success")
        } catch (error) {
            console.error("Failed to verify course:", error)
            showNotification("Failed to verify course", "error")
        } finally {
            setIsProcessing(null)
        }
    }

    const handleDelete = async (courseId: string) => {
        try {
            setIsProcessing(courseId)
            await axios.delete(`${adminContext?.backendUrl}/admin/deleteCourse`, {
                headers: {
                    token: adminContext?.adminToken || ''
                },
                data: { courseId }
            })

            const updatedCourses = courses.filter(course => course.id !== courseId)
            adminContext?.setCourses(updatedCourses)

            showNotification("Course deleted successfully", "success")
        } catch (error) {
            console.error("Failed to delete course:", error)
            showNotification("Failed to delete course", "error")
        } finally {
            setIsProcessing(null)
        }
    }

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!adminContext) {
        return <div className="p-4">Loading admin context...</div>
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {notification.visible && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {notification.type === 'success' ?
                        <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <span className="flex-1">{notification.message}</span>
                    <button
                        onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                        className="ml-2 p-1 hover:bg-gray-200 rounded-full flex items-center justify-center"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6">Course Management</h1>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="rounded-xl overflow-hidden shadow-md flex flex-col bg-white border border-gray-200 h-full">
                        <div className="w-full aspect-video relative">
                            <Image
                                src={course.image || '/placeholder-course.jpg'}
                                alt={course.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover w-full"
                            />
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                    course.isApproved ? "bg-green-500 text-white" : "bg-yellow-400 text-gray-800"
                                }`}>
                                    {course.isApproved ? "Verified" : "Pending"}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h2>

                            <p className="text-gray-600 mb-5 line-clamp-3 flex-grow">
                                {course.description}
                            </p>

                            <div className="flex gap-3 mt-auto">
                                {!course.isApproved ? (
                                    <>
                                        <button
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 flex-1 font-medium"
                                            onClick={() => handleVerify(course.id)}
                                            disabled={isProcessing === course.id}
                                        >
                                            {isProcessing === course.id ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-green-700 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5 flex-shrink-0" />
                                                    <span>Verify</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex-1 font-medium"
                                            onClick={() => handleDelete(course.id)}
                                            disabled={isProcessing === course.id}
                                        >
                                            {isProcessing === course.id ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                                                    <span>Delete</span>
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 w-full font-medium"
                                        onClick={() => handleDelete(course.id)}
                                        disabled={isProcessing === course.id}
                                    >
                                        {isProcessing === course.id ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5 flex-shrink-0" />
                                                <span>Delete Course</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border col-span-full">
                        <p className="text-gray-500 font-medium">No courses found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
export default CoursesPage