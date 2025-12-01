/**
 * Clear Data Button
 * Botão para limpar manualmente dados antigos do localStorage
 * Útil para desenvolvimento e troubleshooting
 */

import { AlertTriangle } from 'lucide-react';
import { useForceClearOldData } from './DataMigration';

export function ClearDataButton() {
  const { clearOldData } = useForceClearOldData();

  return (
    <button
      onClick={clearOldData}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
      title="Limpar dados antigos do sistema"
    >
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">Limpar Dados Antigos</span>
    </button>
  );
}
