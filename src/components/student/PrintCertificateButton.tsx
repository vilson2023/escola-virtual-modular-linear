'use client';

import { Button } from '@/components/ui/Button';

export function PrintCertificateButton() {
  return (
    <Button type="button" variant="primary" onClick={() => window.print()}>
      🖨️ Imprimir / Salvar como PDF
    </Button>
  );
}
