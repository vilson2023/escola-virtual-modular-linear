import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // cacheComponents desligado intencionalmente (M2b):
  // LMS tem conteúdo personalizado por aluno, cache não faz sentido.
  // Tailwind v4 roda via PostCSS (postcss.config.mjs) em webpack e Turbopack.
};

export default nextConfig;
