import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const dbUrl = process.env.DATABASE_URL ?? '';
  const authSecret = process.env.AUTH_SECRET ?? '';
  const asaasKey = process.env.ASAAS_API_KEY ?? '';
  const asaasUrl = process.env.ASAAS_API_URL ?? '';

  // Nunca retornar os valores. Só metadados.
  return NextResponse.json({
    DATABASE_URL: {
      present: dbUrl.length > 0,
      length: dbUrl.length,
      startsWith: dbUrl.slice(0, 15), // "postgresql://ne"
    },
    AUTH_SECRET: {
      present: authSecret.length > 0,
      length: authSecret.length,
    },
    ASAAS_API_KEY: {
      present: asaasKey.length > 0,
      length: asaasKey.length,
      startsWith: asaasKey.slice(0, 12), // esperado: "$aact_hmlg_0"
      hasBackslashAtStart: asaasKey.startsWith('\\'),
      expectedPrefix: '$aact_hmlg_',
      prefixMatches: asaasKey.startsWith('$aact_hmlg_'),
    },
    ASAAS_API_URL: {
      present: asaasUrl.length > 0,
      value: asaasUrl, // URL não é secreta
    },
  });
}
