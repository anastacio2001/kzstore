/**
 * Script para corrigir produtos no Google Merchant Center via API
 */

const https = require('https');

const API_URL = 'https://kzstore-341392738431.europe-southwest1.run.app';

// Função helper para fazer requisições
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fixGoogleMerchantProducts() {
  console.log('🔍 Buscando produtos...\n');
  
  try {
    const response = await makeRequest('/api/products');
    const products = response.data || [];
    
    console.log(`📦 Total de produtos: ${products.length}\n`);
    
    // Análise de problemas
    const problems = {
      invalidGTIN: [],
      noGTIN: [],
      noBrand: [],
      shortDesc: []
    };
    
    products.forEach(product => {
      // GTIN inválido
      if (product.codigo_barras) {
        if (/^(2|02|04)/.test(product.codigo_barras)) {
          problems.invalidGTIN.push(product);
        }
      } else {
        problems.noGTIN.push(product);
      }
      
      // Sem marca
      if (!product.marca || product.marca.trim() === '') {
        problems.noBrand.push(product);
      }
      
      // Descrição curta
      if (!product.descricao || product.descricao.length < 100) {
        problems.shortDesc.push(product);
      }
    });
    
    console.log('📊 ANÁLISE DE PROBLEMAS:');
    console.log('='.repeat(60));
    console.log(`❌ GTINs inválidos (começam com 2/02/04): ${problems.invalidGTIN.length}`);
    console.log(`⚠️  Sem GTIN: ${problems.noGTIN.length}`);
    console.log(`⚠️  Sem marca: ${problems.noBrand.length}`);
    console.log(`⚠️  Descrição curta (< 100 chars): ${problems.shortDesc.length}`);
    console.log('='.repeat(60));
    console.log();
    
    // Exibir produtos com GTIN inválido
    if (problems.invalidGTIN.length > 0) {
      console.log('❌ PRODUTOS COM GTIN INVÁLIDO:');
      problems.invalidGTIN.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.nome}`);
        console.log(`      GTIN atual: ${p.codigo_barras}`);
        console.log(`      ID: ${p.id}\n`);
      });
    }
    
    // Exibir produtos sem marca
    if (problems.noBrand.length > 0) {
      console.log('⚠️  PRODUTOS SEM MARCA:');
      problems.noBrand.slice(0, 10).forEach((p, i) => {
        console.log(`   ${i+1}. ${p.nome} (ID: ${p.id})`);
      });
      if (problems.noBrand.length > 10) {
        console.log(`   ... e mais ${problems.noBrand.length - 10} produtos\n`);
      }
    }
    
    console.log('\n💡 SOLUÇÃO:');
    console.log('='.repeat(60));
    console.log('Para corrigir os GTINs inválidos dos 2 produtos:');
    console.log();
    console.log('1. Acesse Google Merchant Center');
    console.log('2. Clique nos produtos com erro');
    console.log('3. Opções:');
    console.log('   a) REMOVER o GTIN (deixar vazio) se o produto não tem código de barras real');
    console.log('   b) SUBSTITUIR por GTIN válido se você tem o código correto');
    console.log();
    console.log('💡 RECOMENDAÇÃO: Para switches TP-LINK sem código de barras oficial,');
    console.log('   é melhor REMOVER o GTIN do que usar um código inválido.');
    console.log();
    console.log('📝 NO GOOGLE MERCHANT CENTER:');
    console.log('   1. Produtos → Needs attention');
    console.log('   2. Clique em "SWITCH DE MESA TP-LINK TL-SF1005D"');
    console.log('   3. Clique em "Fix"');
    console.log('   4. Escolha: "Product doesn\'t have a GTIN"');
    console.log('   5. Clique em "Remove GTIN"');
    console.log('   6. Repita para o outro switch (TL-SG1005D)');
    console.log('='.repeat(60));
    
    console.log('\n✅ Análise concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixGoogleMerchantProducts();
