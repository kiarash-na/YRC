import type { NextConfig } from "next";

// Baseline protections for every response. HSTS is production-only: browsers
// key it per-host, so emitting it from https://localhost:3001 would force
// HTTPS for every other local dev server on the `localhost` hostname.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No part of the app is framed (the Tally popup frames tally.so FROM us —
  // outbound framing is unaffected by our response headers).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
