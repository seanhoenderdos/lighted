import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignInSchema } from "./lib/validations";
import { withPrismaRetry } from "./lib/server-utils";
import type { Adapter } from "@auth/core/adapters";

// Create a modified Prisma adapter that handles connection issues
const prismaAdapterWithRetry = PrismaAdapter(prisma);

// Use proper types from the adapter interface
type AdapterUser = Parameters<NonNullable<Adapter["createUser"]>>[0];
type AdapterSession = Parameters<NonNullable<Adapter["createSession"]>>[0];

// Override functions that commonly encounter connection issues
const reliablePrismaAdapter = {
  ...prismaAdapterWithRetry,
  // Override user methods with retry functionality
  getUser: async (id: string) => 
    withPrismaRetry(async () => {
      if (!prismaAdapterWithRetry.getUser) return null;
      return Promise.resolve(await prismaAdapterWithRetry.getUser(id));
    }),
  getUserByEmail: async (email: string) => 
    withPrismaRetry(async () => {
      if (!prismaAdapterWithRetry.getUserByEmail) return null;
      return Promise.resolve(await prismaAdapterWithRetry.getUserByEmail(email));
    }),
  createUser: async (data: AdapterUser) => 
    withPrismaRetry(async () => {
      if (!prismaAdapterWithRetry.createUser) 
        throw new Error("createUser not implemented");
      return Promise.resolve(await prismaAdapterWithRetry.createUser(data));
    }),
  createSession: async (data: AdapterSession) => 
    withPrismaRetry(async () => {
      if (!prismaAdapterWithRetry.createSession) 
        throw new Error("createSession not implemented");
      return Promise.resolve(await prismaAdapterWithRetry.createSession(data));
    }),
  getSessionAndUser: async (sessionToken: string) => 
    withPrismaRetry(async () => {
      if (!prismaAdapterWithRetry.getSessionAndUser) return null;
      return Promise.resolve(await prismaAdapterWithRetry.getSessionAndUser(sessionToken));
    }),
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: reliablePrismaAdapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate with zod schema
        const validatedFields = SignInSchema.safeParse(credentials);
        
        if (!validatedFields.success) {
          return null;
        }
        
        const { email, password } = validatedFields.data;
        
        // Find the user by email with retry capability
        const user = await withPrismaRetry(() => 
          prisma.user.findUnique({ where: { email } })
        );
        
        if (!user || !user.password) {
          return null;
        }
        
        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
          return null;
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Map token.id to session.user.id
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },  session: {
    strategy: "jwt"
  },
  secret: process.env.AUTH_SECRET,
  jwt: {
    secret: process.env.AUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
