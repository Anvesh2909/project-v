"use client";
import React, { useContext, useState } from 'react';
import { Clock, Book, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppContext, Course } from "@/context/AppContext";

const CoursesPage = () => {
    const context = useContext(AppContext);
    const courses = context?.courses || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType ? course.type === filterType : true;
        const matchesDifficulty = filterDifficulty ? course.difficulty === filterDifficulty : true;
        return matchesSearch && matchesType && matchesDifficulty;
    });
    const courseTypes = Array.from(new Set(courses.map(course => course.type)));
    const difficultyLevels = Array.from(new Set(courses.map(course => course.difficulty)));
    return (
        <div className="pl-6 pr-6 mt-5">
            <div className="max-w-9xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-blue-800">Courses Library</h1>
                    <div className="mt-4 md:mt-0 flex gap-2">
                        <Link
                            href="/dashboard/mycourses"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            My Enrollments
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                {courseTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Levels</option>
                                {difficultyLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.length === 0 ? (
                            <div className="col-span-3 text-center py-12 text-gray-500">
                                <Book className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                                <p className="text-lg">No courses available matching your criteria</p>
                                <button
                                    onClick={() => {setSearchTerm(''); setFilterDifficulty(''); setFilterType('');}}
                                    className="mt-3 text-blue-500 hover:text-blue-700"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            filteredCourses.map((course: Course) => (
                                <div key={course.id} className="border bg-white border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <Image
                                            src={course.image}
                                            alt={course.title}
                                            width={500}
                                            height={300}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">
                                            {course.type}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-blue-800">{course.title}</h3>
                                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
                                                {course.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                                            by {course.instructorId}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-blue-500">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {course.duration}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Book className="h-4 w-4 mr-1" />
                                                {course.courseContent?.length || 0} chapters
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-3 border-t border-blue-50 flex justify-between items-center">
                                        <Link
                                            href={`/dashboard/courses/${course.id}`}
                                            className="text-sm text-blue-600 font-medium hover:text-blue-800"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mb-10 text-center text-sm text-gray-500">
                    {filteredCourses.length > 0 && (
                        <p>Showing {filteredCourses.length} of {courses.length} courses</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;