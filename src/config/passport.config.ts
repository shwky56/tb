import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

/**
 * Local Strategy for username/password authentication
 * Used during login process
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email: string, password: string, done) => {
      try {
        // Find user by email
        const user = await userRepository.findByEmail(email);

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if user is active and not deleted
        if (user.isDeleted) {
          return done(null, false, { message: 'Account has been deleted' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is not active. Please contact support.' });
        }

        if (user.status === 'Banned') {
          return done(null, false, { message: 'Account has been banned. Please contact support.' });
        }

        if (user.status === 'Pending') {
          return done(null, false, { message: 'Account is pending approval' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Return user object (without password hash)
        const { password_hash, ...userWithoutPassword } = user;
        return done(null, { ...userWithoutPassword, sessionId: user.currentSessionId || '' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * JWT Strategy for protected route authentication
 * Validates JWT tokens and retrieves user information
 */
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  ignoreExpiration: false,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Extract user ID and session ID from JWT payload
      const { userId, sessionId } = jwtPayload;

      // Find user by ID
      const user = await userRepository.findById(userId);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // Check if user is active and not deleted
      if (user.isDeleted || !user.isActive) {
        return done(null, false, { message: 'Account is not active' });
      }

      // CRITICAL: Validate session exists and is active
      // This ensures multi-device login enforcement (max 2 devices)
      const session = await sessionRepository.findBySessionId(sessionId);

      if (!session) {
        return done(null, false, {
          message: 'Session is invalid. You may have been logged out.'
        });
      }

      if (!session.isActive) {
        return done(null, false, {
          message: 'Session has been terminated. Please log in again.'
        });
      }

      // Check session timeout
      const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10);

      if (session.lastActivity) {
        const sessionAge = Date.now() - new Date(session.lastActivity).getTime();
        const sessionAgeMinutes = sessionAge / (1000 * 60);

        if (sessionAgeMinutes > sessionTimeout) {
          // Session has expired, deactivate it
          await sessionRepository.deactivateSession(sessionId);
          return done(null, false, { message: 'Session has expired. Please log in again.' });
        }
      }

      // Update last activity timestamp
      await sessionRepository.updateLastActivity(sessionId);

      // Return user object (without password hash)
      const { password_hash, ...userWithoutPassword } = user;
      return done(null, { ...userWithoutPassword, sessionId: sessionId });
    } catch (error) {
      return done(error);
    }
  })
);

export default passport;
