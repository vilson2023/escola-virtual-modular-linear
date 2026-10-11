import type {
  PaymentProvider,
  CreateCustomerInput,
  Customer,
  CreatePaymentInput,
  Payment,
} from './types';

const BASE_URL = process.env.ASAAS_API_URL ?? 'https://api-sandbox.asaas.com/v3';
const API_KEY = process.env.ASAAS_API_KEY;

if (!API_KEY) {
  console.warn('[asaas] ASAAS_API_KEY não configurada — provider não funcionará');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      access_token: API_KEY ?? '',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // Nunca logar API_KEY
    throw new Error(`Asaas ${res.status}: ${body.slice(0, 300)}`);
  }

  return (await res.json()) as T;
}

export const asaasProvider: PaymentProvider = {
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const data = await request<{ id: string; name: string; email: string }>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          cpfCnpj: input.cpfCnpj,
          externalReference: input.externalReference,
        }),
      },
    );
    return { id: data.id, name: data.name, email: data.email };
  },

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const data = await request<{
      id: string;
      status: string;
      value: number;
      netValue: number;
      billingType: string;
      invoiceUrl: string;
      dueDate: string;
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: input.customerId,
        billingType: input.billingType,
        value: input.value,
        dueDate: input.dueDate,
        description: input.description,
        externalReference: input.externalReference,
      }),
    });
    return {
      id: data.id,
      status: data.status,
      value: data.value,
      netValue: data.netValue,
      billingType: data.billingType,
      invoiceUrl: data.invoiceUrl,
      dueDate: data.dueDate,
    };
  },

  async getPayment(id: string): Promise<Payment> {
    const data = await request<{
      id: string;
      status: string;
      value: number;
      netValue: number;
      billingType: string;
      invoiceUrl: string;
      dueDate: string;
    }>(`/payments/${id}`);
    return {
      id: data.id,
      status: data.status,
      value: data.value,
      netValue: data.netValue,
      billingType: data.billingType,
      invoiceUrl: data.invoiceUrl,
      dueDate: data.dueDate,
    };
  },
};
