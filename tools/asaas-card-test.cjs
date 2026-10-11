/* Teste direto de cartão no sandbox Asaas (fora do app) para diagnosticar recusa.
   Uso: node tools/asaas-card-test.cjs */
const fs = require('fs');

function getKey() {
  const line = fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .find((l) => l.startsWith('ASAAS_API_KEY'));
  let key = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key.startsWith('\\')) key = key.slice(1);
  return key;
}

async function req(path, init = {}) {
  const r = await fetch(`https://api-sandbox.asaas.com/v3${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', access_token: getKey() },
  });
  const text = await r.text();
  return { status: r.status, body: text.slice(0, 600), raw: text };
}

async function main() {
  const email = `cardtest${Date.now()}@example.com`;
  const c = await req('/customers', {
    method: 'POST',
    body: JSON.stringify({ name: 'Carlos Eduardo Moraes', email, cpfCnpj: '99550118231' }),
  });
  console.log('customer:', c.status, c.body);
  const customerId = JSON.parse(c.raw).id;

  const p = await req('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: 5.0,
      dueDate: '2026-10-12',
      remoteIp: '191.32.142.85',
      creditCard: {
        holderName: 'Carlos Eduardo Moraes',
        number: '4971072911009625',
        expiryMonth: '12',
        expiryYear: '2028',
        ccv: '123',
      },
      creditCardHolderInfo: {
        name: 'Carlos Eduardo Moraes',
        email,
        cpfCnpj: '99550118231',
        phone: '4732224455',
        postalCode: '89223005',
        addressNumber: '100',
      },
    }),
  });
  console.log('payment:', p.status, p.body);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
