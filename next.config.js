const { i18n } = require('./next-i18next.config');
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

/** @type {import("next").NextConfig} */
const nextConfig = {
  i18n,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 't3.gstatic.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'www.mylinks.app' },
    ],
    formats: ['image/webp'],
  },
  reactStrictMode: false,
  output: 'standalone',
};

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withPWA = require('@ducanh2912/next-pwa').default({
      dest: 'public',
    });
    return withPWA(nextConfig);
  }
  return nextConfig;
};
