export type CreateCustomerInput = {
  name: string;
  email: string;
  cpfCnpj?: string;
  externalReference?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export type CreatePaymentInput = {
  customerId: string;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  value: number; // em reais (ex.: 147.00)
  dueDate: string; // formato YYYY-MM-DD
  description: string;
  externalReference?: string;
  // usado apenas quando billingType = 'CREDIT_CARD'
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string; // com DDD, só dígitos
    postalCode?: string; // só dígitos
    addressNumber?: string;
  };
};

export type Payment = {
  id: string;
  status: string; // 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | ...
  value: number;
  netValue: number;
  billingType: string;
  invoiceUrl: string; // link de pagamento
  dueDate: string;
};

export type PixQrCode = {
  encodedImage: string; // base64 da imagem
  payload: string; // código copia-e-cola
  expirationDate: string;
};

export interface PaymentProvider {
  createCustomer(input: CreateCustomerInput): Promise<Customer>;
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  getPayment(id: string): Promise<Payment>;
  getPixQrCode(paymentId: string): Promise<PixQrCode>;
}
