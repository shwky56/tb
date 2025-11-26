import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT access token
 * Includes userId and sessionId for single-device enforcement
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn } as any);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_token_key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as any);
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_token_key';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT without verification (useful for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
