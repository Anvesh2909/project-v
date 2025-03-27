import { Request, Response } from 'express';
import * as quizService from '../services/quizService';
import { QuestionType, DifficultyLevel } from '@prisma/client';
import {getQuizByCourseId, getQuizById, getQuizes} from "../services/quizService";

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            title,
            courseId,
            chapterId,
            lectureId,
            topic,
            questionCount,
            questionType,
            difficulty
        } = req.body;

        if (!title || !topic || !questionCount || !questionType || !difficulty) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const quiz = await quizService.createQuiz({
            title,
            courseId,
            chapterId,
            lectureId,
            topic,
            questionCount: Number(questionCount),
            questionType: questionType as QuestionType,
            difficulty: difficulty as DifficultyLevel
        });

        res.status(201).json({ success: true, quiz });
    } catch (error) {
        console.error('Error in createQuiz controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error creating quiz'
        });
    }
};

// Get a quiz by ID
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            res.status(400).json({ error: 'Quiz ID is required' });
            return;
        }

        const quiz = await quizService.getQuizById(quizId);

        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }

        res.status(200).json({ success: true, quiz });
    } catch (error) {
        console.error('Error in getQuiz controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching quiz'
        });
    }
};

// Submit answers to a quiz
export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.body?.id; // Using req.user instead of req.body.id

        if (!studentId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!quizId || !answers || !Array.isArray(answers)) {
            res.status(400).json({ error: 'Quiz ID and answers array are required' });
            return;
        }

        const result = await quizService.submitQuizAttempt(quizId, studentId, answers);

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Error in submitQuizAttempt controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error submitting quiz'
        });
    }
};

// Get quiz attempts for a student
export const getStudentQuizAttempts = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = req.body?.id; // Using req.user instead of req.body.id
        const { quizId } = req.query;

        if (!studentId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const attempts = await quizService.getQuizAttempts(
            studentId,
            quizId ? String(quizId) : undefined
        );

        res.status(200).json({ success: true, attempts });
    } catch (error) {
        console.error('Error in getStudentQuizAttempts controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching attempts'
        });
    }
};

export const getPerformanceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { attemptId } = req.params;
        const studentId = req.body?.id; // Using req.user instead of req.body.id

        if (!studentId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!attemptId) {
            res.status(400).json({ error: 'Attempt ID is required' });
            return;
        }

        // First verify the attempt belongs to this student
        const attempts = await quizService.getQuizAttempts(studentId);
        const isStudentAttempt = attempts.some(attempt => attempt.id === attemptId);

        if (!isStudentAttempt) {
            res.status(403).json({ error: 'Unauthorized access to this attempt' });
            return;
        }

        const report = await quizService.generatePerformanceReport(attemptId);

        res.status(200).json({ success: true, report });
    } catch (error) {
        console.error('Error in getPerformanceReport controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching report'
        });
    }
};
export const getQuizzesByCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            res.status(400).json({ error: 'Course ID is required' });
            return;
        }
        const quizzes = await getQuizByCourseId(courseId);
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error('Error in getQuizzesByCourse controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching quizzes'
        });
    }
};
export const getQuizSubmissionsByCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params;
        const studentId = req.body?.id;

        if (!studentId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!courseId) {
            res.status(400).json({ error: 'Course ID is required' });
            return;
        }

        const submissions = await quizService.getQuizSubmissionsByCourseId(courseId, studentId);

        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error in getQuizSubmissionsByCourse controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching quiz submissions'
        });
    }
};
export const getAllQuizzes = async (req: Request, res: Response): Promise<void> => {
    try {
        const quizzes = await getQuizes();
        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error('Error in getAllQuizzes controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching quizzes'
        });
    }
}