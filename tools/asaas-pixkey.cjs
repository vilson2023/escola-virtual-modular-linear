/* Script utilitário: cadastra uma chave Pix EVP na conta sandbox do Asaas.
   Uso: node tools/asaas-pixkey.cjs  */
const fs = require('fs');

async function main() {
  const line = fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .find((l) => l.startsWith('ASAAS_API_KEY'));
  if (!line) throw new Error('ASAAS_API_KEY não encontrada em .env.local');
  let key = line
    .split('=')
    .slice(1)
    .join('=')
    .trim()
    .replace(/^["']|["']$/g, '');
  // O .env guarda a chave como \$aact_... por causa do dotenv-expand:
  // o \$ escapado vira $ literal no processo. Removemos só a contrabarra.
  if (key.startsWith('\\')) key = key.slice(1);
  console.log('prefixo:', key.slice(0, 7), 'len', key.length);

  const r = await fetch('https://api-sandbox.asaas.com/v3/pix/addressKeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', access_token: key },
    body: JSON.stringify({ type: 'EVP' }),
  });
  console.log(r.status, (await r.text()).slice(0, 400));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
