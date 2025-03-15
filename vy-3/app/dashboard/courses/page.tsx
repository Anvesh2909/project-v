"use client";
import React, { useContext, useState } from 'react';
import { Clock, Book, Search, Users, Filter, Grid, List, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppContext, Course } from "@/context/AppContext";

const CoursesPage = () => {
    const context = useContext(AppContext);
    const courses = context?.courses || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const dailyQuote = {
        text: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson"
    };
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructorId && course.instructorId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType ? course.type === filterType : true;
        const matchesDifficulty = filterDifficulty ? course.difficulty === filterDifficulty : true;
        return matchesSearch && matchesType && matchesDifficulty;
    });

    const courseTypes = Array.from(new Set(courses.map(course => course.type)));
    const difficultyLevels = Array.from(new Set(courses.map(course => course.difficulty)));

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Hero Section with Daily Quote instead of Search */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 mb-8 text-white">
                <div className="max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Expand Your Knowledge</h1>
                    <p className="text-blue-100 mb-6 text-lg">Discover courses designed to help you develop new skills and advance your career.</p>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center">
                        <p className="text-xl italic text-white mb-2">"{dailyQuote.text}"</p>
                        <p className="text-blue-200 text-sm">— {dailyQuote.author}</p>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">All Courses</h2>
                    <p className="text-gray-600">Browse our full collection of courses</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                    <Link
                        href="/dashboard/mycourses"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center"
                    >
                        <Book className="h-4 w-4 mr-2" />
                        My Enrollments
                    </Link>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                    <div className="flex items-center text-gray-700">
                        <Filter className="h-5 w-5 mr-2" />
                        <span className="font-medium">Filters</span>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Grid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search by title, description, or instructor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            {courseTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Levels</option>
                            {difficultyLevels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        {(searchTerm || filterType || filterDifficulty) && (
                            <button
                                onClick={() => {setSearchTerm(''); setFilterDifficulty(''); setFilterType('');}}
                                className="px-4 py-2.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-md border border-gray-200 text-center">
                    <Book className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">No courses found</h3>
                    <p className="text-gray-600 mb-6">We couldn't find any courses matching your criteria.</p>
                    <button
                        onClick={() => {setSearchTerm(''); setFilterDifficulty(''); setFilterType('');}}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        View All Courses
                    </button>
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                    {filteredCourses.map((course: Course) => (
                        viewMode === 'grid' ? (
                            <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                                <div className="relative">
                                    <Image
                                        src={course.image || "/api/placeholder/500/300"}
                                        alt={course.title}
                                        width={500}
                                        height={300}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                                        {course.type}
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-md ${
                                            course.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                                                course.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                            {course.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                                        by <span className="font-medium ml-1">{course.instructorId}</span>
                                    </p>

                                    {course.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                                    )}

                                    <div className="flex items-center justify-between text-sm mt-auto">
                                        <div className="flex items-center text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {course.duration}
                                        </div>
                                        <div className="flex items-center text-gray-500">
                                            <Book className="h-4 w-4 mr-1" />
                                            {course.courseContent.length || 0} chapters
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-4 border-t border-gray-100">
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="block w-full text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="p-5 flex flex-col md:flex-row gap-5">
                                    <div className="relative md:w-48 shrink-0">
                                        <Image
                                            src={course.image || "/api/placeholder/500/300"}
                                            alt={course.title}
                                            width={500}
                                            height={300}
                                            className="w-full h-40 md:h-full object-cover rounded-lg"
                                        />
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                                            {course.type}
                                        </div>
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-md ${
                                                course.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                                                    course.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                                {course.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            by <span className="font-medium">{course.instructorId}</span>
                                        </p>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {course.duration}
                                                </div>
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <Book className="h-4 w-4 mr-1" />
                                                    {course.courseContent?.length || 0} chapters
                                                </div>
                                            </div>

                                            <Link
                                                href={`/dashboard/courses/${course.id}`}
                                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                                            >
                                                View Course
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
                {filteredCourses.length > 0 && (
                    <p>Showing {filteredCourses.length} of {courses.length} courses</p>
                )}
            </div>
        </div>
    );
};
export default CoursesPage;