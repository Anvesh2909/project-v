import { useRouter } from 'next/navigation';
import React from 'react';
import { BookOpen } from 'lucide-react';

interface QuizStartButtonProps {
    quizId: string;
    courseId: string;
    title?: string;
    className?: string;
}

const QuizStartButton = ({ quizId, courseId, title = "Start Quiz", className = "" }: QuizStartButtonProps) => {
    const router = useRouter();

    const handleStartQuiz = () => {
        // Open in a new window if it's a quiz
        const url = `/dashboard/courses/${courseId}/quiz?quizId=${quizId}`;

        // Open in a popup window with specific dimensions
        const width = 1024;
        const height = 768;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
            url,
            `quiz_${quizId}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    return (
        <button
            onClick={handleStartQuiz}
            className={`flex items-center space-x-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-4 py-2 rounded-lg font-medium ${className}`}
        >
            <BookOpen size={18} />
            <span>{title}</span>
        </button>
    );
};

export default QuizStartButton;