/**
 * Utility para limpar cache e localStorage antigos
 * Executado automaticamente quando a versão da app muda
 */

const APP_VERSION = '2.1.0'; // Versão atual da aplicação
const VERSION_KEY = 'kzstore_app_version';

// Chaves que devem ser PRESERVADAS
const PRESERVED_KEYS = [
  'sb-' // Todas as chaves do Supabase (sessão, tokens, etc)
];

// Chaves ANTIGAS que devem ser REMOVIDAS
const DEPRECATED_KEYS = [
  'kzstore_auth_token', // Token antigo do sistema anterior
  'kzstore_user', // Dados de usuário antigos
  'kzstore_session' // Sessão antiga
];

/**
 * Verifica se uma chave deve ser preservada
 */
function shouldPreserveKey(key: string): boolean {
  return PRESERVED_KEYS.some(prefix => key.startsWith(prefix));
}

/**
 * Limpa localStorage de dados antigos/deprecated
 */
export function clearDeprecatedStorage() {
  console.log('🧹 Limpando dados deprecated do localStorage...');
  
  let removedCount = 0;
  
  DEPRECATED_KEYS.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`  ❌ Removido: ${key}`);
    }
  });
  
  if (removedCount > 0) {
    console.log(`✅ ${removedCount} itens deprecated removidos`);
  } else {
    console.log('✅ Nenhum item deprecated encontrado');
  }
}

/**
 * Verifica se é necessário fazer hard reset (mudança de versão)
 */
export function checkAndUpdateVersion() {
  const currentVersion = localStorage.getItem(VERSION_KEY);
  
  if (currentVersion !== APP_VERSION) {
    console.log(`🔄 Versão mudou: ${currentVersion || 'unknown'} → ${APP_VERSION}`);
    
    // Em caso de mudança de versão, limpar dados deprecated
    clearDeprecatedStorage();
    
    // Atualizar versão
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    console.log('✅ Versão atualizada com sucesso');
    return true;
  }
  
  return false;
}

/**
 * Limpa TODOS os dados do localStorage (PERIGOSO!)
 * Use apenas para debug
 */
export function clearAllStorage() {
  console.warn('⚠️ CLEARING ALL LOCALSTORAGE - Isso vai fazer logout!');
  
  // Guardar apenas chaves do Supabase
  const supabaseData: Record<string, string> = {};
  
  Object.keys(localStorage).forEach(key => {
    if (shouldPreserveKey(key)) {
      supabaseData[key] = localStorage.getItem(key) || '';
    }
  });
  
  // Limpar tudo
  localStorage.clear();
  
  // Restaurar Supabase
  Object.entries(supabaseData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  console.log('✅ LocalStorage limpo (Supabase preservado)');
}

/**
 * Log de debug - mostra todas as chaves do localStorage
 */
export function debugLocalStorage() {
  console.log('📦 LocalStorage atual:');
  
  const keys = Object.keys(localStorage);
  
  if (keys.length === 0) {
    console.log('  (vazio)');
    return;
  }
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    const size = value ? new Blob([value]).size : 0;
    console.log(`  - ${key}: ${size} bytes`);
  });
  
  console.log(`Total: ${keys.length} chaves`);
}
