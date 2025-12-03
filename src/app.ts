import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import passport from './config/passport.config';
import routes from './routes';
import swaggerSpec from './config/swagger.config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { securityHeaders, apiRateLimiter, sanitizeInput } from './middleware/security.middleware';
import logger from './config/logger.config';

const app: Application = express();

// Security middleware
app.use(securityHeaders);
app.use(helmet());
app.use(sanitizeInput);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Passport initialization
app.use(passport.initialize());

// Rate limiting
app.use('/api', apiRateLimiter);

// Swagger documentation
app.use('/api/docs', ...swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LMS API Documentation',
}));

// API routes
app.use('/api', routes);

// Health check endpoint (for CI/CD monitoring)
//@ts-ignore
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
//@ts-ignore
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LMS API',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api/docs',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
