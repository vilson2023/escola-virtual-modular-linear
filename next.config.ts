import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // cacheComponents desligado intencionalmente (M2b):
  // LMS tem conteúdo personalizado por aluno, cache não faz sentido.
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
