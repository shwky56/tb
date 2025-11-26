import { Router } from 'express';
import {
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  listCourses,
  publishCourse,
  archiveCourse,
} from '../controllers/course.controller';
import { createCourseValidator, updateCourseValidator } from '../validators/course.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Instructor, University-admin, Super-admin)
 */
router.post(
  '/',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  validate(createCourseValidator),
  asyncHandler(createCourse)
);

/**
 * @route   GET /api/courses
 * @desc    List all courses
 * @access  Public (but different results for authenticated users)
 */
router.get('/', optionalAuthenticate, asyncHandler(listCourses));

/**
 * @route   GET /api/courses/:courseId
 * @desc    Get course by ID
 * @access  Public
 */
router.get('/:courseId', optionalAuthenticate, asyncHandler(getCourseById));

/**
 * @route   PUT /api/courses/:courseId
 * @desc    Update course
 * @access  Private (Course instructor or Admin)
 */
router.put(
  '/:courseId',
  authenticate,
  validate(updateCourseValidator),
  asyncHandler(updateCourse)
);

/**
 * @route   DELETE /api/courses/:courseId
 * @desc    Delete course
 * @access  Private (Course instructor or Admin)
 */
router.delete('/:courseId', authenticate, asyncHandler(deleteCourse));

/**
 * @route   POST /api/courses/:courseId/publish
 * @desc    Publish a course
 * @access  Private (Course instructor or Admin)
 */
router.post('/:courseId/publish', authenticate, asyncHandler(publishCourse));

/**
 * @route   POST /api/courses/:courseId/archive
 * @desc    Archive a course
 * @access  Private (Course instructor or Admin)
 */
router.post('/:courseId/archive', authenticate, asyncHandler(archiveCourse));

export default router;
