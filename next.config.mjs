/** @type {import('next').NextConfig} */
const nextConfig = {
  // Intentionally minimal. No production domain is configured here —
  // the site uses relative routing throughout, so a domain can be
  // attached later on Vercel with zero code changes.
  reactStrictMode: true,
};

export default nextConfig;
