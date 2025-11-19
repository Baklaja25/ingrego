/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { isServer }) => {
    // Optimize webpack cache to handle large strings more efficiently
    // This reduces the warning about serializing big strings
    if (config.cache) {
      config.cache = {
        ...config.cache,
        compression: 'gzip', // Compress cache to reduce serialization overhead
        maxMemoryGenerations: 1, // Limit memory generations for better performance
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days cache age
      };
    }
    
    return config;
  },
}

module.exports = nextConfig


