import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vclxteruuhgxsfisvsxm.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
