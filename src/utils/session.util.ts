import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

/**
 * Generate a unique session ID
 * Used for single-device login enforcement
 */
export const generateSessionId = (): string => {
  return uuidv4();
};

/**
 * Extract device information from request
 * Used to track which device the user is logged in from
 */
export const extractDeviceInfo = (req: Request): string => {
  const userAgent = req.headers['user-agent'] || 'Unknown';
  return userAgent.substring(0, 500); // Limit to 500 characters
};

/**
 * Extract IP address from request
 */
export const extractIpAddress = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'Unknown';
};
