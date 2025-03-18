"use client";
import React, { useContext, useEffect, useState } from 'react';
import {
    Mail,
    Book,
    Calendar,
    Activity,
    Target,
    BookOpen,
    LineChart,
    BadgeCheck,
    Globe,
    Medal,
    Users,
    Clock
} from 'lucide-react';
import Image from "next/image";
import { AppContext } from "@/context/AppContext";
import Link from "next/link";

const ProfilePage = () => {
    const { data, courses, enrollments, fetchCourses } = useContext(AppContext) || {};
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (fetchCourses) {
            fetchCourses().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [fetchCourses]);
    const year = data?.createdAt ? new Date(data.createdAt).getFullYear().toString() : "N/A";

    const enrolledCourses = courses?.filter(course =>
        enrollments?.some(e => e.courseId === course.id && e.studentId === data?.id)
    ) || [];
    const currentCourses = enrolledCourses.map(course => {
        return {
            name: course.title,
            deadline: "Ongoing",
            id: course.id
        };
    });
    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800">My Profile</h1>
                        <p className="text-gray-500 mt-1">Club Points: {data?.silPoints || 0}/1000</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-blue-200">
                                    <Image
                                        src={data?.image || '/assets/profile_img2.png'}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="rounded-full object-cover"
                                        unoptimized
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-800">{data?.name || "Student"}</h2>
                                <p className="text-gray-500">{data?.role || "Student"}</p>

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Mail className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{data?.email}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Book className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{data?.branch?.toUpperCase() || "Not specified"}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">Joined {year}</span>
                                    </div>
                                </div>
                                <Link href="/dashboard/profile/update" className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                                    Update Profile
                                </Link>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex items-center mb-4">
                                <Target className="w-5 h-5 mr-2 text-blue-500" />
                                <h3 className="text-lg font-semibold text-blue-800">Club Engagement</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-800">{data?.silPoints || 0} Points</span>
                                    <span className="text-gray-500">1000 Target</span>
                                </div>
                                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${((data?.silPoints || 0) / 1000) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events - Coming Soon */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex items-center mb-4">
                                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                                <h3 className="text-lg font-semibold text-blue-800">Upcoming Events</h3>
                            </div>
                            <div className="text-center py-6">
                                <p className="text-gray-500">Club events coming soon!</p>
                                <Link href="/dashboard/clubs" className="text-blue-600 hover:text-blue-700 mt-2 inline-block text-sm">
                                    Check Clubs Page →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Courses */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
                                    <h2 className="text-xl font-bold text-blue-800">Enrolled Courses</h2>
                                </div>
                                <span className="text-gray-500">Current Term</span>
                            </div>
                            {currentCourses.length > 0 ? (
                                <div className="space-y-4">
                                    {currentCourses.map((course, index) => (
                                        <Link key={index} href={`/dashboard/courses/${course.id}`}>
                                            <div className="bg-blue-50 rounded-lg p-4 group hover:bg-blue-100 transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-blue-800 font-medium">{course.name}</h3>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {course.deadline}
                        </span>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-600">
                                                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                                                    <span>Click to view course details</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                                    <Link href="/dashboard/courses" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Rating</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{data?.cgpa || "N/A"}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Total Points</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{data?.silPoints || 0}</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <BadgeCheck className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Courses</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{currentCourses.length}</div>
                            </div>
                        </div>

                        {/* Club Engagements - Coming Soon */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <Globe className="w-6 h-6 mr-2 text-blue-500" />
                                    <h2 className="text-xl font-bold text-blue-800">My Clubs</h2>
                                </div>
                            </div>
                            <div className="text-center py-10 bg-blue-50 rounded-lg">
                                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-blue-800 mb-2">Clubs Coming Soon</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-4">
                                    Soon you'll be able to join interest groups and participate in club activities.
                                </p>
                                <Link
                                    href="/dashboard/clubs"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 bg-white rounded-xl p-6 shadow-md border border-blue-100">
                    <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                        <Medal className="w-6 h-6 mr-2 text-blue-500" />
                        Club Badges
                    </h2>
                    <div className="text-center py-8 bg-blue-50 rounded-lg">
                        <p className="text-gray-600">Earn badges by participating in club activities and events.</p>
                        <p className="text-blue-600 mt-2">Coming Soon!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;