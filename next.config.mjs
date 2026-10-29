/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizacion de paquetes con alto volumen de exports (arbol de iconos Lucide)
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
