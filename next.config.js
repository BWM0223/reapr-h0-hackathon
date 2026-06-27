/** @type {import("next").NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? "/reapr-h0-hackathon" : "",
  assetPrefix: isProd ? "/reapr-h0-hackathon" : "",
};
module.exports = nextConfig;
