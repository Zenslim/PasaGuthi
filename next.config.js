// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev mode
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['pasaguthi.org'], // allow optimized use of remote images
  },
  // Optional: redirects or rewrites can be added here
  async rewrites() {
    return [
      {
        source: '/__/auth/handler',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/handler',
      },
      {
        source: '/__/auth/iframe',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/iframe',
      },
      {
        source: '/__/auth/iframe.js',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/iframe.js',
      }
    ];
  },
});
