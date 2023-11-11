const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const config = {
  i18n,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  images: {
    domains: ["localhost", "t3.gstatic.com", "lh3.googleusercontent.com"],
    formats: ["image/webp"],
  },
  reactStrictMode: false,
  experimental: {
    webpackBuildWorker: true,
  },
  output: "standalone",
};

module.exports = config;
