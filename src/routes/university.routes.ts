import { Router, type Router as RouterType } from 'express';
import {
  createUniversity,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
  listUniversities,
} from '../controllers/university.controller';
import { createUniversityValidator, updateUniversityValidator } from '../validators/university.validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router: RouterType = Router();

/**
 * @swagger
 * /api/universities:
 *   post:
 *     tags:
 *       - Universities
 *     summary: Create a new university
 *     description: Create a new university (Super-admin only)
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cairo University
 *               location:
 *                 type: string
 *                 example: Cairo, Egypt
 *               establishedYear:
 *                 type: integer
 *                 example: 1908
 *               description:
 *                 type: string
 *                 example: The premier public university in Egypt
 *               image:
 *                 type: string
 *                 example: https://example.com/images/cairo-university.jpg
 *     responses:
 *       201:
 *         description: University created successfully
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
 *                   example: University created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     university:
 *                       $ref: '#/components/schemas/University'
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
  authorize(['Super-admin']),
  validate(createUniversityValidator),
  asyncHandler(createUniversity)
);

/**
 * @swagger
 * /api/universities:
 *   get:
 *     tags:
 *       - Universities
 *     summary: List all universities
 *     description: Get a paginated list of all universities with optional filters
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by university name (partial match)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (partial match)
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
 *         description: Universities retrieved successfully
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
 *                   example: Universities retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/University'
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
router.get('/', asyncHandler(listUniversities));

/**
 * @swagger
 * /api/universities/{universityId}:
 *   get:
 *     tags:
 *       - Universities
 *     summary: Get university by ID
 *     description: Retrieve detailed information about a specific university including faculties and academic levels
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
 *         description: University retrieved successfully
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
 *                   example: University retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     university:
 *                       $ref: '#/components/schemas/University'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:universityId', asyncHandler(getUniversityById));

/**
 * @swagger
 * /api/universities/{universityId}:
 *   put:
 *     tags:
 *       - Universities
 *     summary: Update university
 *     description: Update university details (Super-admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: University ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cairo University
 *               location:
 *                 type: string
 *                 example: Giza, Egypt
 *               establishedYear:
 *                 type: integer
 *                 example: 1908
 *               description:
 *                 type: string
 *                 example: Updated description
 *               image:
 *                 type: string
 *                 example: https://example.com/images/updated.jpg
 *     responses:
 *       200:
 *         description: University updated successfully
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
 *                   example: University updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     university:
 *                       $ref: '#/components/schemas/University'
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
  '/:universityId',
  authenticate,
  authorize(['Super-admin']),
  validate(updateUniversityValidator),
  asyncHandler(updateUniversity)
);

/**
 * @swagger
 * /api/universities/{universityId}:
 *   delete:
 *     tags:
 *       - Universities
 *     summary: Delete university
 *     description: Soft delete a university (Super-admin only)
 *     security:
 *       - bearerAuth: []
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
 *         description: University deleted successfully
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
 *                   example: University deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:universityId',
  authenticate,
  authorize(['Super-admin']),
  asyncHandler(deleteUniversity)
);

export default router;
