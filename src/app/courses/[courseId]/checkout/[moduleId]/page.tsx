import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { canPurchaseModule } from '@/server/services/module-state';
import { CheckoutForm } from './CheckoutForm';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const user = await requireAuth();
  const { courseId, moduleId } = await params;

  const allowed = await canPurchaseModule(user.id, moduleId);
  if (!allowed.ok) redirect(`/courses/${courseId}`);

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { id: true, title: true } } },
  });
  if (!module || module.courseId !== courseId) notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Checkout</h2>
      <p className="mt-1 text-sm text-slate-500">
        {module.course.title} · {module.title}
      </p>

      <CheckoutForm
        courseId={courseId}
        moduleId={moduleId}
        courseTitle={module.course.title}
        moduleTitle={module.title}
        priceFormatted={brl.format(module.priceCents / 100)}
      />
    </div>
  );
}
