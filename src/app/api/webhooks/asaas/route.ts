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

  const purchase = await prisma.studentPurchase.findFirst({
    where: { externalId: payment.id },
    select: { id: true, statusPayment: true },
  });

  if (!purchase) {
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

  if (purchase.statusPayment === newStatus) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  await prisma.studentPurchase.update({
    where: { id: purchase.id },
    data: {
      statusPayment: newStatus,
      purchasedAt: newStatus === 'PAID' ? now : null,
    },
  });

  return NextResponse.json({ ok: true, updated: true });
}
