import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      sessionId: string;
    }

    interface Request {
      user?: User | any;
    }
  }
}

export {};
