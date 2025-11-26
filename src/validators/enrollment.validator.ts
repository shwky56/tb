import { body } from 'express-validator';

export const enrollValidator = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Invalid course ID format'),
];

export const updateEnrollmentStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Active', 'Completed', 'Dropped', 'Suspended'])
    .withMessage('Invalid enrollment status'),
];

export const updateProgressValidator = [
  body('progress')
    .notEmpty()
    .withMessage('Progress is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
];
