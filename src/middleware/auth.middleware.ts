import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '../models/user.model';

/**
 * Middleware to authenticate requests using Passport JWT strategy
 * Validates JWT token and ensures single-device session enforcement
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication',
        error: err.message,
      });
    }

    if (!user) {
      const message = info?.message || 'Unauthorized access';
      return res.status(401).json({
        success: false,
        message,
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Role-based access control middleware
 * Restricts access to specific user roles
 *
 * @param roles - Array of allowed roles
 * @returns Middleware function
 *
 * @example
 * router.get('/admin/users', authenticate, authorize(['Super-admin']), listUsers);
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.',
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is an admin
 * Used for operations where users can only modify their own data
 *
 * @param userIdParam - The parameter name in req.params that contains the user ID
 * @returns Middleware function
 */
export const authorizeOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const targetUserId = req.params[userIdParam];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    // Allow if user is Super-admin or University-admin
    const isAdmin = ['Super-admin', 'University-admin'].includes(user.role);

    // Allow if user is accessing their own resource
    const isOwner = user.id === targetUserId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only access your own resources.',
      });
    }

    next();
  };
};

/**
 * Optional authentication - attaches user to request if token is valid
 * But doesn't reject if no token or invalid token
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: any) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
