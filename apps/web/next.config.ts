import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  // Typescript and ESLint errors will now fail the build (Phase 0 Upgrade)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ]
  },
  serverExternalPackages: ["mongoose", "mongodb", "argon2", "jose"],
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  async redirects() {
    return [
      {
        source: '/topic/strategic-intelligence',
        destination: '/',
        permanent: true,
      },
      {
        source: '/topic/:slug',
        destination: '/topics/:slug',
        permanent: true,
      },
      {
        source: '/blogs/%20australia-strategic-role-against-china-2026',
        destination: '/blogs/australia-strategic-role-against-china-2026',
        permanent: true,
      },
      {
        source: '/blogs/%20india-china-border-tensions-future-risks-2026',
        destination: '/blogs/india-china-border-tensions-future-risks-2026',
        permanent: true,
      },
      {
        source: '/blogs/%20japan-military-expansion-regional-security-2026',
        destination: '/blogs/japan-military-expansion-regional-security-2026',
        permanent: true,
      },
      {
        source: '/blogs/%20nato-future-unstable-europe-2026',
        destination: '/blogs/nato-future-unstable-europe-2026',
        permanent: true,
      },
      {
        source: '/blogs/%20recep-tayyip-erdogan-strategic-role-2026',
        destination: '/blogs/recep-tayyip-erdogan-strategic-role-2026',
        permanent: true,
      },
      {
        source: '/blogs/%20taiwan-crisis-strategic-scenarios-explained-2026',
        destination: '/blogs/taiwan-crisis-strategic-scenarios-explained-2026',
        permanent: true,
      },

      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'global-chanakya-web.vercel.app',
          },
        ],
        destination: 'https://www.globalchanakya.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'globalchanakya.in',
          },
        ],
        destination: 'https://www.globalchanakya.in/:path*',
        permanent: true,
      }
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "global-chanakya",
  project: "web",
  sentryUrl: "https://sentry.io/",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
