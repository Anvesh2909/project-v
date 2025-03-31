"use client";
import React, { useContext, useEffect, useState } from 'react';
import { InstructorContext } from "@/context/InstructorContext";
import { QuizAttempt } from "@/context/InstructorContext";

const QuizSubmissionsPage = () => {
    const context = useContext(InstructorContext);
    const { quizAttempts, getQuizAttempts, isLoading } = context || {};
    const [selectedQuiz, setSelectedQuiz] = useState<string | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        // Prevent infinite loop by checking if we're already fetching
        if (getQuizAttempts && !fetchingData) {
            setFetchingData(true);
            getQuizAttempts().finally(() => {
                console.log("Quiz attempts fetched", quizAttempts);
            });
        }
    }, []);  // Empty dependency array to only run once

    // Get all attempts as a flat array
    const allAttempts = quizAttempts ?
        Object.values(quizAttempts).flat() :
        [];

    console.log("All attempts:", allAttempts);

    // Filter attempts based on selected quiz and status
    const filteredAttempts = allAttempts.filter(attempt => {
        const quizMatch = selectedQuiz === 'all' || attempt.quizId === selectedQuiz;
        const statusMatch = statusFilter === 'all' || attempt.status === statusFilter;
        return quizMatch && statusMatch;
    });

    // Get unique quiz IDs for the dropdown
    const quizIds = quizAttempts ? Object.keys(quizAttempts) : [];

    // Format date for display
    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString();
        } catch (e) {
            console.error("Invalid date:", date);
            return 'Invalid Date';
        }
    };

    if (isLoading && allAttempts.length === 0) {
        return <div className="flex justify-center items-center h-64">Loading quiz submissions...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quiz Submissions</h1>

            {/* Debug info */}
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                <p>Total quiz attempts: {allAttempts.length}</p>
                <p>Filtered attempts: {filteredAttempts.length}</p>
                <p>Available quiz IDs: {quizIds.join(', ') || 'None'}</p>
                <button
                    onClick={() => {
                        console.log("Raw quiz attempts data:", quizAttempts);
                        if (getQuizAttempts) getQuizAttempts();
                    }}
                    className="bg-gray-200 px-2 py-1 rounded mt-1 text-xs"
                >
                    Refresh Data
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div>
                    <label htmlFor="quizFilter" className="block text-sm font-medium mb-1">Filter by Quiz</label>
                    <select
                        id="quizFilter"
                        className="border rounded p-2 min-w-[200px]"
                        value={selectedQuiz}
                        onChange={(e) => setSelectedQuiz(e.target.value)}
                    >
                        <option value="all">All Quizzes</option>
                        {quizIds.map(id => (
                            <option key={id} value={id}>Quiz {id}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">Filter by Status</label>
                    <select
                        id="statusFilter"
                        className="border rounded p-2 min-w-[200px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ABANDONED">Abandoned</option>
                    </select>
                </div>
            </div>

            {/* Submissions table */}
            {filteredAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left border">Quiz ID</th>
                            <th className="py-3 px-4 text-left border">Student ID</th>
                            <th className="py-3 px-4 text-left border">Started</th>
                            <th className="py-3 px-4 text-left border">Completed</th>
                            <th className="py-3 px-4 text-left border">Score</th>
                            <th className="py-3 px-4 text-left border">Status</th>
                            <th className="py-3 px-4 text-left border">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAttempts.map((attempt) => (
                            <tr key={attempt.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border">{attempt.quizId}</td>
                                <td className="py-3 px-4 border">{attempt.studentId}</td>
                                <td className="py-3 px-4 border">{formatDate(attempt.startedAt)}</td>
                                <td className="py-3 px-4 border">{formatDate(attempt.completedAt)}</td>
                                <td className="py-3 px-4 border">{attempt.score !== null ? attempt.score : 'N/A'}</td>
                                <td className="py-3 px-4 border">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        attempt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            attempt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                        {attempt.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 border">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                                        onClick={() => {
                                            // View details functionality
                                            console.log(`View details for attempt ${attempt.id}`, attempt);
                                        }}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded">
                    <p className="text-gray-500">No quiz submissions found.</p>
                    {quizIds.length === 0 && (
                        <p className="mt-2 text-sm text-gray-400">
                            When students complete quizzes, their submissions will appear here.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizSubmissionsPage;