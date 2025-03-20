'use client';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { InstructorContext } from "@/context/InstructorContext";
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Submission = {
    id: string;
    student: {
        id: string;
        name: string;
        email: string;
        image: string;
    };
    assignment: {
        id: string;
        title: string;
        courseId: string;
        maxMarks: number;
        course: {
            id: string;
            title: string;
        }
    };
    submissionUrl: string;
    grade?: number;
    feedback?: string;
    submittedAt: string;
};

type PaginationMetadata = {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [marks, setMarks] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMetadata>({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20
    });
    const context = useContext(InstructorContext);
    const backendUrl = context?.backendUrl || '';
    const instructorToken = context?.instructorToken;
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                setLoading(true);
                const response = await axios.get(`${backendUrl}/ins/getInstructorSubmissions`, {
                    headers: {
                        token: instructorToken
                    },
                    params: {
                        page: currentPage,
                        limit: pagination.pageSize
                    }
                });

                setSubmissions(response.data.data);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError('Failed to load submissions');
            } finally {
                setLoading(false);
            }
        }

        if (instructorToken) {
            fetchSubmissions();
        }
    }, [backendUrl, instructorToken, currentPage, pagination.pageSize]);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission || !backendUrl) return;
        if (marks > selectedSubmission.assignment.maxMarks) {
            alert(`Marks cannot exceed maximum marks (${selectedSubmission.assignment.maxMarks})`);
            return;
        }
        try {
            await axios.put(`${backendUrl}/ins/setGrade`, {
                submissionId: selectedSubmission.id,
                marks,
                feedback
            }, {
                headers: {
                    token: instructorToken
                }
            });

            // Update the submission in the current list
            setSubmissions(prev =>
                prev.map(sub =>
                    sub.id === selectedSubmission.id
                        ? { ...sub, grade: marks, feedback }
                        : sub
                )
            );

            // Reset form
            setMarks(0);
            setFeedback('');
            setSelectedSubmission(null);

            alert('Grade submitted successfully');
        } catch (error) {
            console.error('Error submitting grade:', error);
            alert('Failed to submit grade');
        }
    };

    if (loading && submissions.length === 0) {
        return <div className="flex justify-center items-center h-screen">Loading submissions...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Student Submissions</h1>

            {submissions.length === 0 ? (
                <div className="p-8 rounded-lg text-center">
                    <p className="text-gray-600">No submissions found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left border-b">Student</th>
                                <th className="px-6 py-3 text-left border-b">Assignment</th>
                                <th className="px-6 py-3 text-left border-b">Course</th>
                                <th className="px-6 py-3 text-left border-b">Status</th>
                                <th className="px-6 py-3 text-left border-b">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b">
                                        <div className="flex items-center">
                                            {submission.student.image && (
                                                <img
                                                    className="h-8 w-8 rounded-full mr-3"
                                                    src={submission.student.image}
                                                    alt={submission.student.name}
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{submission.student.name}</div>
                                                <div className="text-sm text-gray-500">{submission.student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b">{submission.assignment.title}</td>
                                    <td className="px-6 py-4 border-b">{submission.assignment.course.title}</td>
                                    <td className="px-6 py-4 border-b">
                                        {submission.grade !== undefined ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                Graded: {submission.grade}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <a
                                            href={submission.submissionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline mr-4"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setMarks(submission.grade || 0);
                                                setFeedback(submission.feedback || '');
                                            }}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {submission.grade !== undefined ? 'Update Grade' : 'Grade'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Previous
                                </button>
                                <div className="px-4 py-2 border-l border-r border-gray-300 bg-gray-50">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <ChevronRight className="h-5 w-5 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedSubmission.grade !== undefined ? 'Update Grade' : 'Grade Submission'}
                        </h2>
                        <p className="mb-4">
                            <strong>Assignment:</strong> {selectedSubmission.assignment.title}<br/>
                            <strong>Student:</strong> {selectedSubmission.student.name}<br/>
                            <a
                                href={selectedSubmission.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Open Submission
                            </a>
                        </p>

                        <form onSubmit={handleGradeSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">
                                    Marks (max: {selectedSubmission.assignment.maxMarks}):
                                </label>
                                <input
                                    type="number"
                                    value={marks}
                                    onChange={(e) => setMarks(Number(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    min="0"
                                    max={selectedSubmission.assignment.maxMarks}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">
                                    Feedback:
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSubmission(null)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {selectedSubmission.grade !== undefined ? 'Update' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionsPage;