import { User, Owner } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<User>;
      owner?: Partial<Owner>;
    }
  }
}
