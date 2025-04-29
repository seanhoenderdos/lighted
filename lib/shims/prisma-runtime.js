// Mock implementation of PrismaClientKnownRequestError used by @auth/prisma-adapter
class PrismaClientKnownRequestError extends Error {
  constructor(message, { code, clientVersion, meta } = {}) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code || 'P1000';
    this.clientVersion = clientVersion || 'mock';
    this.meta = meta;
  }
}

// Export the required classes and functions
module.exports = {
  PrismaClientKnownRequestError,
  // Add other required exports as needed
};