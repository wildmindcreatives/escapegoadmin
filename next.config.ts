import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Augmente la limite à 50MB pour les fichiers 3D
    },
  },
  // Augmente aussi la limite pour le middleware/proxy
  serverExternalPackages: [],
};

export default nextConfig;
