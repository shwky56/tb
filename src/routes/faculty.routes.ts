import { Router, type Router as RouterType } from 'express';
import {
  createFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  listFaculties,
  getFacultiesByUniversity,
} from '../controllers/faculty.controller';
import { createFacultyValidator, updateFacultyValidator } from '../validators/faculty.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /api/faculties:
 *   post:
 *     tags:
 *       - Faculties
 *     summary: Create a new faculty
 *     description: Create a new faculty within a university (Super-admin, University-admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - universityId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Faculty of Engineering
 *               universityId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               dean:
 *                 type: string
 *                 example: Dr. Ahmed Hassan
 *               establishedYear:
 *                 type: integer
 *                 example: 1925
 *               image:
 *                 type: string
 *                 example: https://example.com/images/engineering-faculty.jpg
 *     responses:
 *       201:
 *         description: Faculty created successfully
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
 *                   example: Faculty created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     faculty:
 *                       $ref: '#/components/schemas/Faculty'
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
  authorize(['Super-admin', 'University-admin']),
  validate(createFacultyValidator),
  asyncHandler(createFaculty)
);

/**
 * @swagger
 * /api/faculties:
 *   get:
 *     tags:
 *       - Faculties
 *     summary: List all faculties
 *     description: Get a paginated list of all faculties with optional filters
 *     parameters:
 *       - in: query
 *         name: universityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by university ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by faculty name (partial match)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Faculties retrieved successfully
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
 *                   example: Faculties retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Faculty'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 */
router.get('/', asyncHandler(listFaculties));

/**
 * @swagger
 * /api/faculties/university/{universityId}:
 *   get:
 *     tags:
 *       - Faculties
 *     summary: Get faculties by university
 *     description: Get all faculties for a specific university including their academic levels
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: University ID
 *     responses:
 *       200:
 *         description: Faculties retrieved successfully
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
 *                   example: Faculties retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     faculties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Faculty'
 *       400:
 *         description: Bad request
 */
router.get('/university/:universityId', asyncHandler(getFacultiesByUniversity));

/**
 * @swagger
 * /api/faculties/{facultyId}:
 *   get:
 *     tags:
 *       - Faculties
 *     summary: Get faculty by ID
 *     description: Retrieve detailed information about a specific faculty including academic levels
 *     parameters:
 *       - in: path
 *         name: facultyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Faculty ID
 *     responses:
 *       200:
 *         description: Faculty retrieved successfully
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
 *                   example: Faculty retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     faculty:
 *                       $ref: '#/components/schemas/Faculty'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:facultyId', asyncHandler(getFacultyById));

/**
 * @swagger
 * /api/faculties/{facultyId}:
 *   put:
 *     tags:
 *       - Faculties
 *     summary: Update faculty
 *     description: Update faculty details (Super-admin, University-admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facultyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Faculty ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Faculty of Computer Science
 *               universityId:
 *                 type: string
 *                 format: uuid
 *               dean:
 *                 type: string
 *                 example: Dr. Mohamed Ali
 *               establishedYear:
 *                 type: integer
 *                 example: 1995
 *               image:
 *                 type: string
 *                 example: https://example.com/images/cs-faculty.jpg
 *     responses:
 *       200:
 *         description: Faculty updated successfully
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
 *                   example: Faculty updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     faculty:
 *                       $ref: '#/components/schemas/Faculty'
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
  '/:facultyId',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  validate(updateFacultyValidator),
  asyncHandler(updateFaculty)
);

/**
 * @swagger
 * /api/faculties/{facultyId}:
 *   delete:
 *     tags:
 *       - Faculties
 *     summary: Delete faculty
 *     description: Soft delete a faculty (Super-admin, University-admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facultyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Faculty ID
 *     responses:
 *       200:
 *         description: Faculty deleted successfully
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
 *                   example: Faculty deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:facultyId',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  asyncHandler(deleteFaculty)
);

export default router;
