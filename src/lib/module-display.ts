import type { ModuleWithState } from '@/server/services/module-state';

/**
 * Estados visuais (display) da página do curso — M12b.
 *
 * Derivados exclusivamente dos dados do backend (isPurchased + progressPercent
 * + state), sem nenhuma regra de negócio nova. A progressão linear continua
 * sendo calculada pelo backend em getCourseModulesForStudent().
 */
export type DisplayState =
  | 'DISPONIVEL' // Disponível para compra
  | 'ADQUIRIDO' // Adquirido (0%)
  | 'EM_ANDAMENTO' // Em andamento (1–99%)
  | 'CONCLUIDO' // Concluído (100%)
  | 'BLOQUEADO'; // Bloqueado por pré-requisito

export function getDisplayState(module: ModuleWithState): DisplayState {
  if (module.isPurchased) {
    if (module.progressPercent === 0) return 'ADQUIRIDO';
    if (module.progressPercent === 100) return 'CONCLUIDO';
    return 'EM_ANDAMENTO';
  }
  return module.state === 'VITRINE' ? 'DISPONIVEL' : 'BLOQUEADO';
}
