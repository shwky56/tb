import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import enrollmentRoutes from './enrollment.routes';
import universityRoutes from './university.routes';
import facultyRoutes from './faculty.routes';
import academicLevelRoutes from './academic-level.routes';

const router: Router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/universities', universityRoutes);
router.use('/faculties', facultyRoutes);
router.use('/academic-levels', academicLevelRoutes);

export default router;
