import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  // Allow aws-sdk v3 packages to be bundled for server routes
  serverExternalPackages: ["@aws-sdk/client-s3", "@aws-sdk/s3-request-presigner"],

  // Proxy API requests to the dual backends
  async rewrites() {
    return [
      // 1. Mutational API logic hits Django (Port 8000)
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/founder-auth/:path*', destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/institution-auth/:path*', destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/investor-auth/:path*', destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/admin/login', destination: 'http://localhost:8000/api/auth/login/',
      },
      {
        source: '/api/founder/startups/:path*',
        destination: 'http://localhost:8000/api/founder/startups/:path*',
      },
      {
        source: '/api/institution/:path*',
        destination: 'http://localhost:8000/api/institution/:path*',
      },
      {
        source: '/api/institutions/:path*',
        destination: 'http://localhost:8000/api/institution/institutions/:path*',
      },
      {
        source: '/api/institution-applications/:path*',
        destination: 'http://localhost:8000/api/institution/applications/:path*',
      },
      {
        source: '/api/projects/:path*',
        destination: 'http://localhost:8000/api/institution/projects/:path*',
      },
      {
        source: '/api/programs/:path*',
        destination: 'http://localhost:8000/api/institution/programs/:path*',
      },
      {
        source: '/api/mentors/:path*',
        destination: 'http://localhost:8000/api/mentor/profiles/:path*',
      },
      {
        source: '/api/investors/:path*',
        destination: 'http://localhost:8000/api/investor/profiles/:path*',
      },
      {
        source: '/api/mentor-slots/:path*',
        destination: 'http://localhost:8000/api/mentor/slots/:path*',
      },
      {
        source: '/api/mentor-bookings/:path*',
        destination: 'http://localhost:8000/api/mentor/bookings/:path*',
      },
      {
        source: '/api/approvals/mentors',
        destination: 'http://localhost:8000/api/mentor/profiles/approve/',
      },
      {
        source: '/api/approvals/investors',
        destination: 'http://localhost:8000/api/investor/profiles/approve/',
      },
      {
        source: '/api/forms/:path*',
        destination: 'http://localhost:8000/api/forms/:path*',
      },
      {
        source: '/api/admin/forms/:path*',
        destination: 'http://localhost:8000/api/forms/:path*',
      },
      // 2. All other generic /api/ read routes hit Go Fiber (Port 8080)
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
