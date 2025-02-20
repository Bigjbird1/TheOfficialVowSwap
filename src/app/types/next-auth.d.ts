import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      role: UserRole;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    role: UserRole;
  }
}
