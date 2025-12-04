// Execute no Console do navegador (F12) quando logado como admin
(async function() {
  console.log('🔧 Tentando executar migration...');
  
  // Tentar pegar token de diferentes lugares
  const userStr = localStorage.getItem('user');
  let token = null;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.access_token;
      console.log('✅ Token encontrado no user object');
    } catch (e) {
      console.error('❌ Erro ao parsear user:', e);
    }
  }
  
  if (!token) {
    token = localStorage.getItem('access_token');
    console.log('🔍 Tentando token direto do localStorage');
  }
  
  if (!token) {
    console.error('❌ Token não encontrado!');
    alert('❌ Token não encontrado. Faça login novamente.');
    return;
  }
  
  console.log('🚀 Executando migration com token...');
  
  try {
    const response = await fetch('/api/admin/run-migration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('📊 Resultado:', result);
    
    if (result.success) {
      alert('✅ Migration aplicada com sucesso!');
    } else {
      alert('❌ Erro: ' + result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('❌ Erro: ' + error.message);
  }
})();
