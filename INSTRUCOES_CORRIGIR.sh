#!/bin/bash

API_URL="https://kzstore-341392738431.europe-southwest1.run.app"

echo "🔐 Fazendo login como admin via Google OAuth..."
echo ""
echo "⚠️  INSTRUÇÕES:"
echo "1. Abre o browser e faz login em: ${API_URL}/#/admin"
echo "2. Abre o Console (F12 → Console)"
echo "3. Executa este código:"
echo ""
echo "───────────────────────────────────────────────────────────"
cat <<'EOF'
fetch('/api/products/fix-shipping', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(result => {
  console.log('✅ RESULTADO:', result);
  alert(`✅ ${result.updated} produtos atualizados!\n\n🎁 Frete grátis: ${result.stats.free}\n💰 Frete pago: ${result.stats.paid}`);
  
  // Recarregar a página para ver mudanças
  setTimeout(() => location.reload(), 2000);
})
.catch(err => {
  console.error('❌ ERRO:', err);
  alert('❌ Erro ao atualizar produtos: ' + err.message);
});
EOF
echo "───────────────────────────────────────────────────────────"
echo ""
echo "4. Aguarda a mensagem de sucesso"
echo "5. Recarrega a página (Ctrl+R ou Cmd+R)"
echo "6. Limpa cache do browser (Ctrl+Shift+Delete)"
echo ""
echo "🔄 Depois testa:"
echo "   - Editar produto com preço usando vírgulas"
echo "   - Definir frete grátis"
echo "   - Adicionar ao carrinho"
echo "   - Verificar checkout"
