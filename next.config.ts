import type { NextConfig } from "next";

// Fonts are self-hosted via next/font, images are local — the CSP can stay
// tight. 'unsafe-inline' is required by Next.js hydration scripts and by the
// inline per-venue theme CSS custom properties.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Deliberately NOT "output: standalone" — the deployed start command is
  // `next start` (see package.json), and Next.js 15 explicitly warns that
  // "next start" does not work with standalone output (it requires running
  // .next/standalone/server.js instead). Keep this in sync with package.json
  // "start" and the README deployment section if that ever changes.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
