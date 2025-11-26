import { body } from 'express-validator';

export const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('courseCode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Course code must not exceed 50 characters'),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid course level'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Category must not exceed 255 characters'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),

  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a positive number'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('University name must not exceed 255 characters'),
];

export const updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Title must be between 3 and 500 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid course level'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),

  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a positive number'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
];
