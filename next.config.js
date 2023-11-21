const { i18n } = require("./next-i18next.config");

/** @type {import("next").NextConfig} */
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
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "t3.gstatic.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "mylinks.app" },
    ],
    formats: ["image/webp"],
  },
  reactStrictMode: false,
  output: "standalone",
};

module.exports = config;
