/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@codetrix-studio/capacitor-google-auth": false,
    };
    return config;
  },
};
module.exports = nextConfig;
