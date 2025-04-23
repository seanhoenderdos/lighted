// Import from the GENERATED location since we specified a custom output path
import { PrismaClient } from '../lib/generated/prisma';

// Create a more resilient PrismaClient configuration
// Especially for serverless environments with Neon database

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Connection management options for Neon
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection management to handle timeouts better
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  });
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Explicitly handle connection errors
prisma.$connect().catch((err) => {
  console.error('Failed to connect to the database:', err);
});

// Helper function for reconnection if needed
export async function reconnectPrisma() {
  try {
    await prisma.$disconnect();
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('Failed to reconnect to the database:', error);
    return false;
  }
}