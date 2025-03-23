import React, { useState } from "react";
import axios from "axios";
import { Verified, X } from "lucide-react";

// Define types for quiz data structure
interface QuizQuestion {
    text: string;
    options: string[];
}

interface Quiz {
    id: string | number;
    title: string;
    questions: QuizQuestion[];
    questionType?: string;
}

interface QuizModalProps {
    isOpen: boolean;
    quiz: Quiz | null;
    onClose: () => void;
    token?: string;
    backendUrl?: string;
    courseId?: string | number;
    fetchQuizzes?: () => void;
    fetchCourses?: () => Promise<void>;
    showNotification?: (message: string, type: string) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
                                                 isOpen,
                                                 quiz,
                                                 onClose,
                                                 token,
                                                 backendUrl,
                                                 courseId,
                                                 fetchQuizzes,
                                                 fetchCourses
                                             }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: answer
        });
    };

    const showNotification = (message: string, type: string) => {
        console.error(message); // Fallback implementation
    };

    const handleSubmitQuiz = async () => {
        if (!token || !backendUrl || !quiz) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${backendUrl}/api/submitQuiz`,
                {
                    quizId: quiz.id,
                    courseId: courseId,
                    answers: selectedAnswers
                },
                { headers: { token } }
            );

            setScore(response.data.score);
            setQuizCompleted(true);

            if (fetchQuizzes) {
                fetchQuizzes(); // Refresh quiz data
            }

            // Update course progress
            await fetchCourses?.();
        } catch (error) {
            console.error("Error submitting quiz:", error);
            showNotification("Failed to submit quiz", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setQuizCompleted(false);
        setScore(null);
    };

    if (!isOpen || !quiz) return null;

    const questions = quiz.questions || [];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl border border-white/20 shadow-2xl animate-scaleIn">
                <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
                    <h3 className="text-lg font-semibold text-[#1E293B]">{quiz.title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F1F5F9] rounded-lg text-[#64748B] hover:text-[#1E293B] transition-all duration-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {quizCompleted ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Verified size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
                            <p className="text-gray-600 mb-6">Your score: {score}%</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={resetQuiz}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Retake Quiz
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {questions.length > 0 ? (
                                <div>
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">
                                              Question {currentQuestion + 1} of {questions.length}
                                            </span>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                              {quiz.questionType?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-800 mb-4">
                                            {questions[currentQuestion]?.text}
                                        </h4>
                                        <div className="space-y-3">
                                            {questions[currentQuestion]?.options?.map((option: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedAnswers[currentQuestion] === option
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                                                selectedAnswers[currentQuestion] === option
                                                                    ? 'border-blue-500 bg-blue-500'
                                                                    : 'border-gray-300'
                                                            }`}
                                                        >
                                                            {selectedAnswers[currentQuestion] === option && (
                                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-800">{option}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                            disabled={currentQuestion === 0}
                                            className={`px-4 py-2 rounded-lg ${
                                                currentQuestion === 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            } transition-colors`}
                                        >
                                            Previous
                                        </button>

                                        {currentQuestion < questions.length - 1 ? (
                                            <button
                                                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Next
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSubmitQuiz}
                                                disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
                                                className={`px-4 py-2 rounded-lg ${
                                                    isSubmitting || Object.keys(selectedAnswers).length < questions.length
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                } transition-colors`}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">This quiz has no questions yet.</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;