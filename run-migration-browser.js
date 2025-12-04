// Execute este script no Console do navegador (F12) quando estiver logado como admin
// em https://www.kzstore.ao

(async function() {
  console.log('🔧 Executando migration de advertisements...');
  
  try {
    const response = await fetch('/api/admin/run-migration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Migration aplicada com sucesso!');
      console.log('📊 Antes:', result.before);
      console.log('📊 Depois:', result.after);
      alert('✅ Migration aplicada! Agora você pode fazer upload de imagens nos anúncios.');
    } else {
      console.error('❌ Erro:', result.error);
      alert('❌ Erro: ' + result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    alert('❌ Erro: ' + error.message);
  }
})();
