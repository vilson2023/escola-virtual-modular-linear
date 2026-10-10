import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // cacheComponents desligado intencionalmente:
  // LMS tem conteúdo personalizado por aluno, cache não faz sentido.
};

export default nextConfig;
