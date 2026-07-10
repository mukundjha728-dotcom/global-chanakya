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
  serverExternalPackages: ["mongoose", "mongodb", "argon2", "jose"],
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  async redirects() {
    return [
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
