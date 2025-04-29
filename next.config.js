/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    HUGGING_FACE_API_KEY: process.env.HUGGING_FACE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  
  reactStrictMode: true,
  
  // Don't treat ESLint warnings as errors in production build
  eslint: {
    // Warning: only enable this when you're actively addressing ESLint issues
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  
  // Prevent Prisma from being bundled on the client side
  webpack: (config, { isServer }) => {
    // Handle problematic packages and binary files
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    
    if (!isServer) {
      // Ensure these node modules don't get bundled on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        '@prisma/client': false,
        '.prisma/client': false,
        // Add fallbacks for node: protocol imports
        'async_hooks': false,
        'events': false,
      };
      
      // Handle node: protocol URLs
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // No longer using null-loader for Prisma runtime, instead use our custom shim
      // that provides the necessary exports
      
      // Replace all node: protocol imports with our empty shim module
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use our custom prisma runtime shim that provides PrismaClientKnownRequestError
        '@prisma/client/runtime/library': require.resolve('./lib/shims/prisma-runtime.js'),
        // Continue using empty shim for node: protocol imports
        'node:async_hooks': require.resolve('./lib/shims/empty.js'),
        'node:child_process': require.resolve('./lib/shims/empty.js'),
        'node:events': require.resolve('./lib/shims/empty.js'),
        'node:fs': require.resolve('./lib/shims/empty.js'),
        'node:fs/promises': require.resolve('./lib/shims/empty.js'),
        'node:path': require.resolve('./lib/shims/empty.js'),
        'node:os': require.resolve('./lib/shims/empty.js'),
        'node:crypto': require.resolve('./lib/shims/empty.js'),
        'node:url': require.resolve('./lib/shims/empty.js'),
        'node:net': require.resolve('./lib/shims/empty.js'),
        'node:tls': require.resolve('./lib/shims/empty.js'),
        'node:stream': require.resolve('./lib/shims/empty.js'),
        'node:buffer': require.resolve('./lib/shims/empty.js'),
        'node:util': require.resolve('./lib/shims/empty.js'),
        'node:process': require.resolve('./lib/shims/empty.js'),
        'node:http': require.resolve('./lib/shims/empty.js'),
        'node:https': require.resolve('./lib/shims/empty.js'),
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;