import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },


  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://js.stripe.com https://*.stripe.com",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.cloudinary.com https://o*.ingest.sentry.io",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ]
  },
}


export default withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    silent: true,

    widenClientFileUpload: true,

    tunnelRoute: "/monitoring",

    sourcemaps: {
      disable: true,
    },

    telemetry: false,
  }
)