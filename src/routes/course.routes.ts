import { Router, type Router as RouterType } from 'express';
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

const router: RouterType = Router();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course
 *     description: Create a new course (Instructor, University-admin, or Super-admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to TypeScript
 *               description:
 *                 type: string
 *                 example: Learn TypeScript from basics to advanced concepts
 *               category:
 *                 type: string
 *                 example: Programming
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *                 example: Beginner
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: Course created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authenticate,
  authorize(['Instructor', 'University-admin', 'Super-admin']),
  validate(createCourseValidator),
  asyncHandler(createCourse)
);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List all courses
 *     description: Get a list of all courses. Shows published courses for public, all courses for authenticated users.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Published, Archived]
 *         description: Filter by course status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/', optionalAuthenticate, asyncHandler(listCourses));

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course by ID
 *     description: Retrieve detailed information about a specific course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:courseId', optionalAuthenticate, asyncHandler(getCourseById));

/**
 * @swagger
 * /api/courses/{courseId}:
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update course
 *     description: Update course details (Course instructor or Admin only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Advanced TypeScript
 *               description:
 *                 type: string
 *                 example: Deep dive into TypeScript advanced features
 *               category:
 *                 type: string
 *                 example: Programming
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *                 example: Advanced
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                   example: Course updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Course'
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
 * @swagger
 * /api/courses/{courseId}/publish:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Publish a course
 *     description: Change course status to Published (Course instructor or Admin only)
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
 *     responses:
 *       200:
 *         description: Course published successfully
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
 *                   example: Course published successfully
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:courseId/publish', authenticate, asyncHandler(publishCourse));

/**
 * @route   POST /api/courses/:courseId/archive
 * @desc    Archive a course
 * @access  Private (Course instructor or Admin)
 */
router.post('/:courseId/archive', authenticate, asyncHandler(archiveCourse));

export default router;
