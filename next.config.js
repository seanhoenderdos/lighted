/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    HUGGING_FACE_API_KEY: process.env.HUGGING_FACE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  
  reactStrictMode: true,
  
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
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;