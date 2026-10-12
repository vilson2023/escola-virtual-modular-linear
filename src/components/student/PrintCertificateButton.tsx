'use client';

import { NeonButton } from '@/components/ui/NeonButton';

export function PrintCertificateButton() {
  return (
    <NeonButton type="button" variant="accent" onClick={() => window.print()}>
      🖨️ Imprimir / Salvar como PDF
    </NeonButton>
  );
}
