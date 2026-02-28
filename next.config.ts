import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Skip trailing slash redirects for API routes (fixes Telegram webhook 307 issue)
  skipTrailingSlashRedirect: true,
  
  env: {
    HUGGING_FACE_API_KEY: process.env.HUGGING_FACE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },

  // Enable the React strict mode
  reactStrictMode: true,
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  
  // Webpack configuration to handle problematic packages
  webpack: (config) => {
    // Handle problematic packages and binary files
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    
    return config;
  },
};

export default nextConfig;
