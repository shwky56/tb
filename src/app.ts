import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import passport from './config/passport.config';
import routes from './routes';
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

// API routes
app.use('/api', routes);

// Root endpoint
//@ts-ignore
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LMS API',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api/health',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
