import { Router } from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
  updateEnrollmentStatus,
  updateProgress,
} from '../controllers/enrollment.controller';
import {
  enrollValidator,
  updateEnrollmentStatusValidator,
  updateProgressValidator,
} from '../validators/enrollment.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   POST /api/enrollments
 * @desc    Enroll in a course
 * @access  Private (Student)
 */
router.post('/', authenticate, validate(enrollValidator), asyncHandler(enrollInCourse));

/**
 * @route   GET /api/enrollments/my
 * @desc    Get current user's enrollments
 * @access  Private
 */
router.get('/my', authenticate, asyncHandler(getMyEnrollments));

/**
 * @route   GET /api/enrollments/course/:courseId
 * @desc    Get all enrollments for a course
 * @access  Private (Instructor, Admin)
 */
router.get(
  '/course/:courseId',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  asyncHandler(getCourseEnrollments)
);

/**
 * @route   PUT /api/enrollments/:enrollmentId/status
 * @desc    Update enrollment status
 * @access  Private (Instructor, Admin)
 */
router.put(
  '/:enrollmentId/status',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  validate(updateEnrollmentStatusValidator),
  asyncHandler(updateEnrollmentStatus)
);

/**
 * @route   PUT /api/enrollments/:enrollmentId/progress
 * @desc    Update enrollment progress
 * @access  Private (Student, Instructor, Admin)
 */
router.put(
  '/:enrollmentId/progress',
  authenticate,
  validate(updateProgressValidator),
  asyncHandler(updateProgress)
);

export default router;
