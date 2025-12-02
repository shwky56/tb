import { Router, type Router as RouterType } from 'express';
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

const router: RouterType = Router();

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll in a course
 *     description: Enroll the authenticated user in a course (Student role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       201:
 *         description: Enrollment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully enrolled in course
 *                 data:
 *                   $ref: '#/components/schemas/Enrollment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Already enrolled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, validate(enrollValidator), asyncHandler(enrollInCourse));

/**
 * @swagger
 * /api/enrollments/my:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get my enrollments
 *     description: Get all enrollments for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Completed, Dropped]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my', authenticate, asyncHandler(getMyEnrollments));

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get course enrollments
 *     description: Get all enrollments for a specific course (Instructor or Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Completed, Dropped]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/course/:courseId',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  asyncHandler(getCourseEnrollments)
);

/**
 * @swagger
 * /api/enrollments/{enrollmentId}/status:
 *   put:
 *     tags:
 *       - Enrollments
 *     summary: Update enrollment status
 *     description: Update the status of an enrollment (Instructor or Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Completed, Dropped]
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Enrollment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Enrollment status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Enrollment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:enrollmentId/status',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  validate(updateEnrollmentStatusValidator),
  asyncHandler(updateEnrollmentStatus)
);

/**
 * @swagger
 * /api/enrollments/{enrollmentId}/progress:
 *   put:
 *     tags:
 *       - Enrollments
 *     summary: Update enrollment progress
 *     description: Update the progress of an enrollment (Student, Instructor, or Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *               completedLessons:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ['550e8400-e29b-41d4-a716-446655440000']
 *     responses:
 *       200:
 *         description: Enrollment progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Progress updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Enrollment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:enrollmentId/progress',
  authenticate,
  validate(updateProgressValidator),
  asyncHandler(updateProgress)
);

export default router;
