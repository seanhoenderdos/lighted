'use server';

import { signOut as authSignOut, auth } from '@/auth';

export async function signOutAction() {
  await authSignOut();
  return { success: true };
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}