// Script para verificar dados existentes no banco
const projectId = "duxeeawfyxcciwlyjllk";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eGVlYXdmeXhjY2l3bHlqbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwMDQsImV4cCI6MjA3Nzg1MzAwNH0.1BWI_11MST5ZC19NEx5yZoLJHn3MtOmgfd-Fs8FQhVc";

async function checkData() {
  console.log('\n🔍 Verificando dados existentes no banco...\n');

  // 1. Verificar Flash Sales
  try {
    const flashResponse = await fetch(
      `https://${projectId}.supabase.co/rest/v1/flash_sales?select=*`,
      {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const flashSales = await flashResponse.json();
    console.log(`⚡ Flash Sales: ${flashSales.length} registros encontrados`);
    if (flashSales.length > 0) {
      console.log('   Primeiros registros:', flashSales.slice(0, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao verificar flash_sales:', error.message);
  }

  // 2. Verificar Cupons
  try {
    const couponsResponse = await fetch(
      `https://${projectId}.supabase.co/rest/v1/coupons?select=*`,
      {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const coupons = await couponsResponse.json();
    console.log(`\n🎫 Cupons: ${coupons.length} registros encontrados`);
    if (coupons.length > 0) {
      console.log('   Primeiros registros:', coupons.slice(0, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao verificar coupons:', error.message);
  }

  // 3. Verificar Reviews
  try {
    const reviewsResponse = await fetch(
      `https://${projectId}.supabase.co/rest/v1/reviews?select=*`,
      {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const reviews = await reviewsResponse.json();
    console.log(`\n⭐ Reviews: ${reviews.length} registros encontrados`);
    if (reviews.length > 0) {
      console.log('   Primeiros registros:', reviews.slice(0, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao verificar reviews:', error.message);
  }

  // 4. Verificar Produtos (para referência)
  try {
    const productsResponse = await fetch(
      `https://${projectId}.supabase.co/rest/v1/products?select=id,nome&limit=5`,
      {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const products = await productsResponse.json();
    console.log(`\n📦 Produtos disponíveis: ${products.length} (primeiros 5)`);
    products.forEach(p => console.log(`   - ${p.nome} (ID: ${p.id})`));
  } catch (error) {
    console.error('❌ Erro ao verificar products:', error.message);
  }

  console.log('\n✅ Verificação concluída!\n');
}

checkData();
