/**
 * Formata valores em Kwanzas com espaços e vírgula
 * Exemplo: 51990 → "51 990,00 Kz"
 */
export function formatKz(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0,00 Kz';
  
  // Separar parte inteira e decimal
  const [inteira, decimal = '00'] = num.toFixed(2).split('.');
  
  // Adicionar espaços a cada 3 dígitos na parte inteira
  const inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${inteiraFormatada},${decimal} Kz`;
}

/**
 * Formata valores em AOA (sem "Kz" no final)
 * Exemplo: 51990 → "51 990,00 AOA"
 */
export function formatAOA(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0,00 AOA';
  
  const [inteira, decimal = '00'] = num.toFixed(2).split('.');
  const inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${inteiraFormatada},${decimal} AOA`;
}

/**
 * Formata apenas o número sem sufixo
 * Exemplo: 51990 → "51 990,00"
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0,00';
  
  const [inteira, decimal = '00'] = num.toFixed(2).split('.');
  const inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${inteiraFormatada},${decimal}`;
}
