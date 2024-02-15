/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
//  swcMinify: true,
  swcMinify: false,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
//    ignoreDuringBuilds: true,
    ignoreDuringBuilds: false,
  },  
};

module.exports = nextConfig;
