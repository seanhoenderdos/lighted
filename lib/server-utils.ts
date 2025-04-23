import { prisma, reconnectPrisma } from "./prisma";

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
  } catch (error: any) {
    // Check if it's a connection error
    if (
      retries > 0 &&
      (error.message?.includes('Connection') || 
       error.message?.includes('closed') ||
       error.code === 'P2023' || // Failed to establish connection
       error.code === 'P1001') // Can't reach database server
    ) {
      console.log(`Database connection error, attempting reconnect. Retries left: ${retries}`);
      
      // Try to reconnect
      await reconnectPrisma();
      
      // Retry the operation
      return withPrismaRetry(operation, retries - 1);
    }
    
    // Not a connection error or out of retries, rethrow
    throw error;
  }
}