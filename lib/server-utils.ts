import { prisma, reconnectPrisma } from "./prisma";
import { randomBytes } from "crypto";

/**
 * Executes a Prisma operation with automatic retry on connection errors
 * Helps handle Neon database connection timeouts
 */
export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    // Check if it's a connection error
    const err = error as { message?: string; code?: string };
    if (
      retries > 0 &&
      (err.message?.includes('Connection') || 
       err.message?.includes('closed') ||
       err.code === 'P2023' || // Failed to establish connection
       err.code === 'P1001') // Can't reach database server
    ) {
      console.info(`Database connection error, attempting reconnect. Retries left: ${retries}`);
      
      // Try to reconnect
      await reconnectPrisma();
      
      // Retry the operation
      return withPrismaRetry(operation, retries - 1);
    }
    
    // Not a connection error or out of retries, rethrow
    throw error;
  }
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create password reset token for a user
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // First, delete any existing tokens for this user
  await withPrismaRetry(() => 
    prisma.passwordResetToken.deleteMany({
      where: { userId },
    })
  );
  
  // Generate a secure token
  const token = generateResetToken();
  
  // Set expiry to 1 hour from now
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  // Store the token in the database
  await withPrismaRetry(() => 
    prisma.passwordResetToken.create({
      data: {
        token,
        userId,
        expires,
      },
    })
  );
  
  return token;
}

/**
 * Validate a password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<{ 
  isValid: boolean; 
  userId: string | null;
}> {
  try {
    const resetToken = await withPrismaRetry(() => 
      prisma.passwordResetToken.findUnique({
        where: { token },
      })
    );
    
    // Check if token exists and hasn't expired
    if (!resetToken || resetToken.expires < new Date()) {
      return { isValid: false, userId: null };
    }
    
    return { isValid: true, userId: resetToken.userId };
  } catch (error) {
    console.error("Error validating reset token:", error);
    return { isValid: false, userId: null };
  }
}