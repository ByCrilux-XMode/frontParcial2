import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true, // Esto ya lo tenías

  // --- AÑADE ESTO ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ejemplo.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // --- FIN DE LA ADICIÓN ---
};

export default nextConfig;