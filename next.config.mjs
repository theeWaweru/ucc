/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization features for next/image
  images: {
    domains: ["i.ytimg.com", "res.cloudinary.com"],
    formats: ["image/avif", "image/webp"],
  },

  // Apply security headers
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Clean output during builds
  cleanDistDir: true,

  // Enable React strict mode for better development practices
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Ensure path aliases are properly resolved
    esmExternals: true,

    // Server Actions - updated to object format for Next.js 15.x
    serverActions: {
      bodySizeLimit: "10mb",
    },

    // Note: fontLoaders is removed as it's no longer supported in newer Next.js versions
    // Use the new font system instead: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
  },

  // Note: i18n config for Pages Router is removed as it's not compatible with App Router
  // For internationalization in App Router, use the route groups and middleware approach:
  // https://nextjs.org/docs/app/building-your-application/routing/internationalization

  // Webpack configuration for handling various file types
  webpack: (config) => {
    // Add support for SVG and other file types
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
