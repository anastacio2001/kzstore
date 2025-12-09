/**
 * Wrapper global para fetch que automaticamente usa a URL correta do backend
 * IMPORTANTE: Este arquivo deve ser importado ANTES de qualquer outro código
 */

// Detectar URL do backend baseado no ambiente
const getAPIBaseURL = () => {
  // Verificar se estamos em produção (Vercel)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://kzstore-backend.fly.dev/api';
  }
  // Desenvolvimento local
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  // Fallback para variável de ambiente
  return import.meta.env.VITE_API_URL || 'https://kzstore-backend.fly.dev/api';
};

const API_BASE_URL = getAPIBaseURL();

console.log(`✅ [Fetch Wrapper] Initialized - API calls will redirect to: ${API_BASE_URL}`);

// Salvar o fetch original
const originalFetch = window.fetch;

// Função helper para reescrever URLs
function rewriteURL(input: RequestInfo | URL): string {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Se a URL começa com /api/, substituir pelo backend correto
  if (url.startsWith('/api/')) {
    const path = url.slice(4); // Remove /api
    return `${API_BASE_URL}${path}`;
  }
  
  return url;
}

// Sobrescrever fetch global
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const rewrittenURL = rewriteURL(input);
  
  // Adicionar credentials: 'include' por padrão se não especificado
  const finalInit: RequestInit = {
    credentials: 'include',
    ...init,
  };
  
  // Log apenas para URLs da API
  if (rewrittenURL.includes('/api/') || rewrittenURL.includes('kzstore-backend')) {
    console.log(`🌐 [Fetch Wrapper] ${typeof input === 'string' ? input : 'URL'} → ${rewrittenURL}`);
  }
  
  return originalFetch(rewrittenURL, finalInit);
};

console.log('✅ [Fetch Wrapper] Initialized - API calls will use:', API_BASE_URL);

export {}; // Para tornar este arquivo um módulo
