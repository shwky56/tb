import dotenv from 'dotenv';
import app from './app';
import AppDataSource from './config/database.config';
import logger from './config/logger.config';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Initialize database connection
 */
const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established successfully');
    logger.info(`Database: ${process.env.DB_DATABASE}`);
  } catch (error) {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  }
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start Express server - listen on all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`Public API URL: http://91.108.121.145:${PORT}/api`);
      logger.info(`Swagger Docs: http://91.108.121.145:${PORT}/api/docs`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (): Promise<void> => {
  logger.info('Received shutdown signal, closing server gracefully...');

  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Start the server
startServer();
