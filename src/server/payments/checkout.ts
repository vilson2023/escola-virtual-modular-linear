import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/server/payments';

type CheckoutUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

/**
 * Gera um CPF fictício com dígitos verificadores válidos (algoritmo oficial).
 * O Asaas exige cpfCnpj para criar customer/cobranças e nosso schema não
 * guarda CPF de usuário. O CPF gerado é enviado apenas ao provider e NUNCA
 * é persistido no banco.
 */
export function generateCpf(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digit = (numbers: number[], weights: number[]) => {
    const sum = numbers.reduce((acc, n, i) => acc + n * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = digit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digit([...base, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...base, d1, d2].join('');
}

/**
 * Garante que o usuário tem um customer no Asaas.
 * Se já tem asaasCustomerId, retorna; senão cria e persiste.
 */
export async function ensureAsaasCustomer(user: CheckoutUser): Promise<string> {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { asaasCustomerId: true },
  });

  if (dbUser?.asaasCustomerId) {
    return dbUser.asaasCustomerId;
  }

  const provider = getPaymentProvider();
  const customer = await provider.createCustomer({
    name: user.name ?? user.email ?? 'Aluno',
    email: user.email ?? '',
    cpfCnpj: generateCpf(),
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { asaasCustomerId: customer.id },
  });

  return customer.id;
}
