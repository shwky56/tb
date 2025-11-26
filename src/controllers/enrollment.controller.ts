import { Request, Response } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { EnrollmentStatus } from '../models/enrollment.model';

const enrollmentService = new EnrollmentService();

export const enrollInCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;
    const { courseId } = req.body;

    const enrollment = await enrollmentService.enrollStudent(user.id, courseId);

    return sendSuccess(res, 'Successfully enrolled in course', { enrollment }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to enroll in course', undefined, 400);
  }
};

export const getMyEnrollments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;

    const enrollments = await enrollmentService.getUserEnrollments(user.id);

    return sendSuccess(res, 'Enrollments retrieved successfully', { enrollments });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve enrollments', undefined, 400);
  }
};

export const getCourseEnrollments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;

    const enrollments = await enrollmentService.getCourseEnrollments(courseId);

    return sendSuccess(res, 'Course enrollments retrieved successfully', { enrollments });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve enrollments', undefined, 400);
  }
};

export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.body;

    const enrollment = await enrollmentService.updateEnrollmentStatus(
      enrollmentId,
      status as EnrollmentStatus
    );

    return sendSuccess(res, 'Enrollment status updated successfully', { enrollment });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update enrollment status', undefined, 400);
  }
};

export const updateProgress = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;

    const enrollment = await enrollmentService.updateProgress(enrollmentId, progress);

    return sendSuccess(res, 'Progress updated successfully', { enrollment });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update progress', undefined, 400);
  }
};
