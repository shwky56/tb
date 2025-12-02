import { Router, type Router as RouterType } from 'express';
import {
  createAcademicLevel,
  getAcademicLevelById,
  updateAcademicLevel,
  deleteAcademicLevel,
  listAcademicLevels,
  getAcademicLevelsByFaculty,
  getAcademicLevelsByUniversity,
} from '../controllers/academic-level.controller';
import { createAcademicLevelValidator, updateAcademicLevelValidator } from '../validators/academic-level.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /api/academic-levels:
 *   post:
 *     tags:
 *       - Academic Levels
 *     summary: Create a new academic level
 *     description: Create a new academic level within a faculty (Super-admin, University-admin)
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
 *               - order
 *               - universityId
 *               - facultyId
 *             properties:
 *               name:
 *                 type: string
 *                 example: First Year
 *               order:
 *                 type: integer
 *                 example: 1
 *               universityId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               facultyId:
 *                 type: string
 *                 format: uuid
 *                 example: 987e6543-e21b-12d3-a456-426614174000
 *               duration:
 *                 type: integer
 *                 example: 2
 *                 description: Duration in semesters or years
 *               requiredCredits:
 *                 type: integer
 *                 example: 36
 *               description:
 *                 type: string
 *                 example: Foundation year covering basic subjects
 *     responses:
 *       201:
 *         description: Academic level created successfully
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
 *                   example: Academic level created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     level:
 *                       $ref: '#/components/schemas/AcademicLevel'
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
  validate(createAcademicLevelValidator),
  asyncHandler(createAcademicLevel)
);

/**
 * @swagger
 * /api/academic-levels:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: List all academic levels
 *     description: Get a paginated list of all academic levels with optional filters
 *     parameters:
 *       - in: query
 *         name: universityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by university ID
 *       - in: query
 *         name: facultyId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by faculty ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by level name (partial match)
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
 *         description: Academic levels retrieved successfully
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
 *                   example: Academic levels retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcademicLevel'
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
router.get('/', asyncHandler(listAcademicLevels));

/**
 * @swagger
 * /api/academic-levels/faculty/{facultyId}:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: Get academic levels by faculty
 *     description: Get all academic levels for a specific faculty, ordered by level order
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
 *         description: Academic levels retrieved successfully
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
 *                   example: Academic levels retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     levels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AcademicLevel'
 *       400:
 *         description: Bad request
 */
router.get('/faculty/:facultyId', asyncHandler(getAcademicLevelsByFaculty));

/**
 * @swagger
 * /api/academic-levels/university/{universityId}:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: Get academic levels by university
 *     description: Get all academic levels for a specific university, ordered by level order
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
 *         description: Academic levels retrieved successfully
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
 *                   example: Academic levels retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     levels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AcademicLevel'
 *       400:
 *         description: Bad request
 */
router.get('/university/:universityId', asyncHandler(getAcademicLevelsByUniversity));

/**
 * @swagger
 * /api/academic-levels/{levelId}:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: Get academic level by ID
 *     description: Retrieve detailed information about a specific academic level
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic Level ID
 *     responses:
 *       200:
 *         description: Academic level retrieved successfully
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
 *                   example: Academic level retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     level:
 *                       $ref: '#/components/schemas/AcademicLevel'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:levelId', asyncHandler(getAcademicLevelById));

/**
 * @swagger
 * /api/academic-levels/{levelId}:
 *   put:
 *     tags:
 *       - Academic Levels
 *     summary: Update academic level
 *     description: Update academic level details (Super-admin, University-admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic Level ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Second Year
 *               order:
 *                 type: integer
 *                 example: 2
 *               universityId:
 *                 type: string
 *                 format: uuid
 *               facultyId:
 *                 type: string
 *                 format: uuid
 *               duration:
 *                 type: integer
 *                 example: 2
 *               requiredCredits:
 *                 type: integer
 *                 example: 40
 *               description:
 *                 type: string
 *                 example: Updated description
 *     responses:
 *       200:
 *         description: Academic level updated successfully
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
 *                   example: Academic level updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     level:
 *                       $ref: '#/components/schemas/AcademicLevel'
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
  '/:levelId',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  validate(updateAcademicLevelValidator),
  asyncHandler(updateAcademicLevel)
);

/**
 * @swagger
 * /api/academic-levels/{levelId}:
 *   delete:
 *     tags:
 *       - Academic Levels
 *     summary: Delete academic level
 *     description: Soft delete an academic level (Super-admin, University-admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic Level ID
 *     responses:
 *       200:
 *         description: Academic level deleted successfully
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
 *                   example: Academic level deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:levelId',
  authenticate,
  authorize(['Super-admin', 'University-admin']),
  asyncHandler(deleteAcademicLevel)
);

export default router;
