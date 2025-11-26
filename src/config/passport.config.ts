import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

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
        return done(null, userWithoutPassword);
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

      // CRITICAL: Validate session ID matches current session
      // This ensures single-device login enforcement
      if (user.currentSessionId !== sessionId) {
        return done(null, false, {
          message: 'Session is invalid. You may have logged in from another device.'
        });
      }

      // Check session timeout
      const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10);
      
      if (user.sessionLastActivity) {
        const sessionAge = Date.now() - new Date(user.sessionLastActivity).getTime();
        const sessionAgeMinutes = sessionAge / (1000 * 60);

        if (sessionAgeMinutes > sessionTimeout) {
          // Session has expired, clear session
          await userRepository.clearSession(userId);
          return done(null, false, { message: 'Session has expired. Please log in again.' });
        }
      }

      // Update last activity timestamp
      await userRepository.updateSessionActivity(userId);

      // Return user object (without password hash)
      const { password_hash, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  })
);

export default passport;
