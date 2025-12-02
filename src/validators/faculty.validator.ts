import { body } from 'express-validator';

export const createFacultyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('universityId')
    .notEmpty()
    .withMessage('University ID is required')
    .isUUID()
    .withMessage('University ID must be a valid UUID'),

  body('dean')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Dean name must not exceed 255 characters'),

  body('establishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Established year must be a valid year'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Image URL must not exceed 1000 characters'),
];

export const updateFacultyValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('universityId')
    .optional()
    .isUUID()
    .withMessage('University ID must be a valid UUID'),

  body('dean')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Dean name must not exceed 255 characters'),

  body('establishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Established year must be a valid year'),

  body('image')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Image URL must not exceed 1000 characters'),
];
