/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'pbs.twimg.com'],
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/handler',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/handler'
      },
      {
        source: '/__/auth/iframe',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/iframe'
      },
      {
        source: '/__/auth/iframe.js',
        destination: 'https://pasaguthi-fc098.firebaseapp.com/__/auth/iframe.js'
      }
    ];
  }
};

module.exports = nextConfig;
