import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/session';
import { getBundleInfo } from '@/server/services/bundle';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function BundleCheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireAuth();
  const { courseId } = await params;

  const bundleInfo = await getBundleInfo(user.id, courseId);
  if (!bundleInfo || !bundleInfo.available) redirect(`/courses/${courseId}`);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });
  if (!course) notFound();

  const modules = await prisma.module.findMany({
    where: { id: { in: bundleInfo.payableModuleIds } },
    orderBy: { orderIndex: 'asc' },
    select: { title: true },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">💎 Formação completa</h2>
      <p className="mt-1 text-sm text-slate-500">
        {course.title} · {bundleInfo.payableModuleIds.length} módulos inclusos
      </p>

      <CheckoutForm
        mode="bundle"
        courseId={courseId}
        courseTitle={course.title}
        itemTitle="Formação completa"
        priceFormatted={brl.format(bundleInfo.bundleApplicableCents / 100)}
        includedItems={modules.map((m) => m.title)}
      />
    </div>
  );
}
