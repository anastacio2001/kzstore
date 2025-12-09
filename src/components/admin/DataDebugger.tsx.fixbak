/**
 * Componente auxiliar para debug de dados do admin
 * Mostra logs detalhados de quais dados foram carregados
 */

import { useEffect } from 'react';

interface DataDebuggerProps {
  label: string;
  data: any[];
  fields?: string[];
}

export function DataDebugger({ label, data, fields }: DataDebuggerProps) {
  useEffect(() => {
    console.log(`🔥 [${label}] Dados carregados:`, data);
    console.log(`🔥 [${label}] Quantidade:`, data.length);
    
    if (data.length > 0) {
      console.log(`🔥 [${label}] Primeiro item:`, data[0]);
      console.log(`🔥 [${label}] Campos disponíveis:`, Object.keys(data[0]));
      
      if (fields) {
        const missing = fields.filter(field => !(field in data[0]));
        if (missing.length > 0) {
          console.error(`❌ [${label}] Campos faltando:`, missing);
        } else {
          console.log(`✅ [${label}] Todos os campos presentes!`);
        }
      }
    } else {
      console.warn(`⚠️ [${label}] Nenhum dado encontrado`);
    }
  }, [label, data, fields]);

  return null; // Componente invisível
}
