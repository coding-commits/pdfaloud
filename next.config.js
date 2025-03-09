/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    
    // Add fallbacks for PDF.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      zlib: false,
    }

    // Handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]'
      }
    })

    return config
  }
}

module.exports = nextConfig 