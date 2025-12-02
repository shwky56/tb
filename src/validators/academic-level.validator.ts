import { body } from 'express-validator';

export const createAcademicLevelValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),

  body('universityId')
    .notEmpty()
    .withMessage('University ID is required')
    .isUUID()
    .withMessage('University ID must be a valid UUID'),

  body('facultyId')
    .notEmpty()
    .withMessage('Faculty ID is required')
    .isUUID()
    .withMessage('Faculty ID must be a valid UUID'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('requiredCredits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Required credits must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
];

export const updateAcademicLevelValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),

  body('universityId')
    .optional()
    .isUUID()
    .withMessage('University ID must be a valid UUID'),

  body('facultyId')
    .optional()
    .isUUID()
    .withMessage('Faculty ID must be a valid UUID'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('requiredCredits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Required credits must be a non-negative integer'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
];
