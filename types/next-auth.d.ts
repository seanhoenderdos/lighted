// Use import type instead of import to avoid unused import warnings
import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   * This contains the user returned from your Prisma adapter
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned from Prisma adapter
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Extend the JWT with user ID */
  interface JWT extends NextAuthJWT {
    id: string;
  }
}