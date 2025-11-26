import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.util';
import { CourseStatus } from '../models/course.model';

const courseService = new CourseService();

export const createCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as any;
    const courseData = {
      ...req.body,
      instructorId: user.id,
    };

    const course = await courseService.createCourse(courseData);

    return sendSuccess(res, 'Course created successfully', { course }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create course', undefined, 400);
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;

    const course = await courseService.getCourseById(courseId);

    return sendSuccess(res, 'Course retrieved successfully', { course });
  } catch (error: any) {
    return sendError(res, error.message || 'Course not found', undefined, 404);
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await courseService.updateCourse(courseId, updates);

    return sendSuccess(res, 'Course updated successfully', { course });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update course', undefined, 400);
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;

    await courseService.deleteCourse(courseId);

    return sendSuccess(res, 'Course deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete course', undefined, 400);
  }
};

export const listCourses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, instructorId, university, category, limit = '20', offset = '0' } = req.query;

    const options = {
      status: status as CourseStatus | undefined,
      instructorId: instructorId as string | undefined,
      university: university as string | undefined,
      category: category as string | undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const { courses, total } = await courseService.listCourses(options);

    return sendPaginated(
      res,
      'Courses retrieved successfully',
      courses,
      total,
      options.limit,
      options.offset
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve courses', undefined, 400);
  }
};

export const publishCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;

    const course = await courseService.publishCourse(courseId);

    return sendSuccess(res, 'Course published successfully', { course });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to publish course', undefined, 400);
  }
};

export const archiveCourse = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { courseId } = req.params;

    const course = await courseService.archiveCourse(courseId);

    return sendSuccess(res, 'Course archived successfully', { course });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to archive course', undefined, 400);
  }
};
