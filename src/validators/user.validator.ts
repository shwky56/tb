import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  body('role')
    .optional()
    .isIn(['Super-admin', 'University-admin', 'Instructor', 'Student'])
    .withMessage('Invalid role'),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('University name must not exceed 255 characters'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('University name must not exceed 255 characters'),

  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
    .matches(/^[+]?[\d\s\-()]+$/)
    .withMessage('Phone number contains invalid characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      if (date > minAge) {
        throw new Error('You must be at least 13 years old');
      }
      return true;
    }),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
];

export const updateUserStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Active', 'Pending', 'Banned'])
    .withMessage('Invalid status'),
];

export const updateUserRoleValidator = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Super-admin', 'University-admin', 'Instructor', 'Student'])
    .withMessage('Invalid role'),
];
