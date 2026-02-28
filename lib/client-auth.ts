'use client'

/**
 * Client-safe authentication utilities
 * This file provides authentication helpers that can be safely imported in client components
 */

import { useSession, signIn, signOut } from "next-auth/react";
import { isAuthenticated as serverIsAuthenticated } from "@/app/actions/auth-actions";

// Export NextAuth client hooks
export { useSession, signIn, signOut };

// Interface for user session information
export interface UserSession {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

/**
 * Custom hook to access authentication state in client components
 */
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: status === 'authenticated' && !!session?.user,
    isLoading: status === 'loading',
    user: session?.user as UserSession | undefined,
    session,
    status
  };
}

/**
 * Client-side function to check if a user is authenticated
 * Uses server action under the hood
 */
export async function isAuthenticated(): Promise<boolean> {
  // If we're on the client and can access the session directly
  if (typeof window !== 'undefined') {
    // Don't use hooks outside of component/hook functions
    // Instead use the getSession function directly
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (session && session.user) return true;
  }
  
  // Fall back to server action
  return serverIsAuthenticated();
}