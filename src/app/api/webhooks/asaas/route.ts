import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

type AsaasWebhookPayload = {
  event: string;
  payment?: {
    id: string;
    status: string;
    externalReference?: string;
  };
};

export async function POST(req: Request) {
  const token = req.headers.get('asaas-access-token');
  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: AsaasWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event, payment } = payload;
  if (!payment?.id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Todas as compras que compartilham este externalId são atualizadas de uma
  // vez (compra em bundle: 1 pagamento = N módulos, todos com o mesmo
  // externalId no StudentPurchase).
  const purchases = await prisma.studentPurchase.findMany({
    where: { externalId: payment.id },
    select: { id: true, statusPayment: true },
  });

  if (purchases.length === 0) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const now = new Date();
  let newStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | null = null;

  switch (event) {
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_CONFIRMED':
      newStatus = 'PAID';
      break;
    case 'PAYMENT_OVERDUE':
      newStatus = 'FAILED';
      break;
    case 'PAYMENT_REFUNDED':
    case 'PAYMENT_CHARGEBACK_REQUESTED':
      newStatus = 'REFUNDED';
      break;
    default:
      return NextResponse.json({ ok: true, ignored: true });
  }

  const needsUpdate = purchases.some((p) => p.statusPayment !== newStatus);
  if (!needsUpdate) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  await prisma.studentPurchase.updateMany({
    where: { externalId: payment.id, statusPayment: { not: newStatus } },
    data: {
      statusPayment: newStatus,
      purchasedAt: newStatus === 'PAID' ? now : null,
    },
  });

  return NextResponse.json({ ok: true, updated: true });
}
