'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  createPixPaymentAction,
  createBoletoPaymentAction,
  createCreditCardPaymentAction,
  createBundlePixPaymentAction,
  createBundleBoletoPaymentAction,
  createBundleCreditCardPaymentAction,
  getPaymentStatusAction,
} from '@/server/actions/checkout';

type Method = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

type Props = {
  courseId: string;
  courseTitle: string;
  itemTitle: string; // título do item: nome do módulo ou "Formação completa"
  priceFormatted: string;
  mode: 'module' | 'bundle';
  moduleId?: string; // obrigatório quando mode === 'module'
  includedItems?: string[]; // bundle: módulos inclusos no pacote
};

const tabs: { id: Method; label: string }[] = [
  { id: 'PIX', label: 'PIX' },
  { id: 'BOLETO', label: 'Boleto' },
  { id: 'CREDIT_CARD', label: 'Cartão' },
];

const inputClassName =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500';

export function CheckoutForm({
  courseId,
  courseTitle,
  itemTitle,
  priceFormatted,
  mode,
  moduleId,
  includedItems,
}: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>('PIX');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const successPath =
    mode === 'module' && moduleId
      ? `/courses/${courseId}/modules/${moduleId}`
      : `/courses/${courseId}`;

  function handleCardSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res =
        mode === 'module' && moduleId
          ? await createCreditCardPaymentAction(moduleId, formData)
          : await createBundleCreditCardPaymentAction(courseId, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      stopPolling();
      setPaid(true);
      setTimeout(() => router.push(successPath), 1500);
    });
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling(id: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await getPaymentStatusAction(id);
        if ('status' in res && res.status === 'PAID') {
          stopPolling();
          setPaid(true);
          setTimeout(() => router.push(successPath), 1500);
        }
      } catch {
        // ignora erros transientes de rede; o próximo tick tenta de novo
      }
    }, 5000);
  }

  useEffect(() => stopPolling, []);

  function handlePix() {
    setError(null);
    setQrCode(null);
    setCopyPaste(null);
    setBoletoUrl(null);
    setPaid(false);
    startTransition(async () => {
      const res =
        mode === 'module' && moduleId
          ? await createPixPaymentAction(moduleId)
          : await createBundlePixPaymentAction(courseId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPurchaseId(res.purchaseId);
      setQrCode(res.qrCodeBase64);
      setCopyPaste(res.copyPaste);
      startPolling(res.purchaseId);
    });
  }

  function handleBoleto() {
    setError(null);
    setQrCode(null);
    setCopyPaste(null);
    setBoletoUrl(null);
    setPaid(false);
    startTransition(async () => {
      const res =
        mode === 'module' && moduleId
          ? await createBoletoPaymentAction(moduleId)
          : await createBundleBoletoPaymentAction(courseId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPurchaseId(res.purchaseId);
      setBoletoUrl(res.invoiceUrl);
      startPolling(res.purchaseId);
    });
  }

  async function handleCopy() {
    if (!copyPaste) return;
    try {
      await navigator.clipboard.writeText(copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar. Selecione o código manualmente.');
    }
  }

  return (
    <div className="mt-6 max-w-2xl">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMethod(tab.id)}
            aria-pressed={method === tab.id}
            className={`focus-visible:ring-brand-500 shrink-0 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition focus-visible:ring-2 focus-visible:outline-none ${
              method === tab.id
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <p className="text-sm text-slate-500">
          {courseTitle} · {itemTitle}
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{priceFormatted}</p>

        {mode === 'bundle' && includedItems && includedItems.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
            {includedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="text-emerald-600">✓</span> {item}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {paid && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            ✅ Pagamento aprovado! Redirecionando...
          </div>
        )}

        {method === 'PIX' && (
          <div className="mt-6">
            {!qrCode ? (
              <>
                <p className="text-sm text-slate-600">PIX é aprovado em segundos.</p>
                <div className="mt-4">
                  <Button type="button" variant="primary" onClick={handlePix} disabled={pending}>
                    {pending ? 'Gerando...' : 'Gerar PIX'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code PIX para pagamento"
                  className="mx-auto aspect-square w-full max-w-[224px] rounded-lg border border-slate-200"
                />
                <p className="mt-3 text-xs break-all text-slate-500">{copyPaste}</p>
                <div className="mt-3 flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    aria-label="Copiar código PIX"
                  >
                    {copied ? '✓ Copiado!' : 'Copiar código'}
                  </Button>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Aguardando pagamento... esta página atualiza sozinha.
                </p>
              </div>
            )}
          </div>
        )}

        {method === 'BOLETO' && (
          <div className="mt-6">
            {!boletoUrl ? (
              <>
                <p className="text-sm text-slate-600">Boleto vence em 1 dia útil.</p>
                <div className="mt-4">
                  <Button type="button" variant="primary" onClick={handleBoleto} disabled={pending}>
                    {pending ? 'Gerando...' : 'Gerar boleto'}
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm text-slate-600">Boleto gerado!</p>
                <div className="mt-3">
                  <a
                    href={boletoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-600 hover:bg-brand-700 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                  >
                    Abrir boleto em nova aba ↗
                  </a>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Aguardando compensação... esta página atualiza sozinha.
                </p>
              </div>
            )}
          </div>
        )}

        {method === 'CREDIT_CARD' && (
          <form onSubmit={handleCardSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="holderName">Nome do titular</Label>
              <Input id="holderName" name="holderName" type="text" required />
            </div>
            <div>
              <Label htmlFor="number">Número do cartão</Label>
              <Input id="number" name="number" type="text" inputMode="numeric" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="expiry">Validade (MM/AA)</Label>
                <Input id="expiry" name="expiry" type="text" placeholder="12/28" required />
              </div>
              <div>
                <Label htmlFor="ccv">CVV</Label>
                <Input id="ccv" name="ccv" type="text" inputMode="numeric" required />
              </div>
            </div>
            <div>
              <Label htmlFor="cpfCnpj">CPF do titular</Label>
              <Input id="cpfCnpj" name="cpfCnpj" type="text" inputMode="numeric" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Telefone (com DDD)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="47999998888"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="89223005"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="addressNumber">Número do endereço</Label>
              <Input id="addressNumber" name="addressNumber" type="text" required />
            </div>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Processando...' : `Pagar ${priceFormatted}`}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
