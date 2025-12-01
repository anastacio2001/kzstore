// Script para corrigir shipping de produtos antigos via API
const API_URL = 'https://kzstore-341392738431.europe-southwest1.run.app';

async function fixProductsShipping() {
  try {
    // Login como admin primeiro
    console.log('🔐 Fazendo login como admin...');
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'antonio@kzstore.ao',
        password: 'admin123', // Trocar pela senha real
      }),
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login falhou: ${loginRes.status}`);
    }
    
    const { token } = await loginRes.json();
    console.log('✅ Login bem-sucedido!');
    
    // Chamar endpoint fix-shipping
    console.log('🔄 Corrigindo shipping dos produtos...');
    const fixRes = await fetch(`${API_URL}/api/products/fix-shipping`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!fixRes.ok) {
      throw new Error(`Fix falhou: ${fixRes.status}`);
    }
    
    const result = await fixRes.json();
    console.log('✅ Resultado:', result);
    console.log(`📦 Produtos atualizados: ${result.updated}`);
    console.log(`🎁 Frete grátis: ${result.stats.free}`);
    console.log(`💰 Frete pago: ${result.stats.paid}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixProductsShipping();
