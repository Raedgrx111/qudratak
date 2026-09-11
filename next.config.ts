import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // راوتر المسارات النظيفة: أي مسار غير معروف (مثل /dashboard أو /leaderboard)
  // يقدَّم منه تطبيق الصفحة الواحدة، مع استثناء /api و/_next حتى تبقى استجاباتها الحقيقية (404 وأخطاء)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/((?!api/|_next/|favicon.ico).*)", destination: "/" }],
    };
  },
};

export default nextConfig;
