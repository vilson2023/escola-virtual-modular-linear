import { asaasProvider } from './asaas';
import type { PaymentProvider } from './types';

export function getPaymentProvider(): PaymentProvider {
  // Único provider por enquanto. Se adicionarmos Stripe no futuro,
  // aqui é o lugar de escolher baseado em env.
  return asaasProvider;
}

export type * from './types';
