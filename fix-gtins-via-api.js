/**
 * Script Node.js para remover GTINs inválidos via API
 */

const https = require('https');

const API_URL = 'https://kzstore-341392738431.europe-southwest1.run.app';

// Produtos com GTIN inválido
const INVALID_PRODUCTS = [
  { id: "3185c02b-54e4-47ea-8001-2d635beca0cb", name: "Cartão De Memória 32GB Canvas Select Plus" },
  { id: "a9e14339-3c52-4b3a-88d9-ae454acb4acf", name: "NordVPN" },
  { id: "4f170c70-2e9a-469d-8ba4-596f99ba726a", name: "Ativador do Office Casa e Escritorio 2024" },
  { id: "b26c6797-6d3b-463d-96db-616acc99d6e6", name: "Microsoft Office 2024 Professional Plus" },
  { id: "375b5f48-a03a-4979-bccf-52d566247426", name: "MICROSOFT Windows 11 Professional" },
  { id: "97d1845b-6c19-41e8-8f98-a25a389b57c9", name: "Rolo Etiquetas 34x18 Térmicas" },
  { id: "1adc475e-6549-4073-a4c6-06afcaa3bcaa", name: "Rolo Térmico Para Multicaixas (Tpa)" },
  { id: "a474a07b-e4dd-4f19-a27c-0900e9846031", name: "Tinteiro 305 3ym60ae Color 2720" },
  { id: "e760c420-191e-4bb6-82c3-f2eff5317485", name: "Tinteiro 305 3ym61ae Preto 2720" },
  { id: "c92ed87a-06c7-47ab-b565-18fffe1e0175", name: "Tinteiro 925 Amarelo" },
  { id: "be171dee-de76-4be5-8f49-7c6bacb07dcd", name: "Tinteiro 925 Ciano" },
];

function updateProduct(id, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/products/${id}`, API_URL);
    const bodyData = JSON.stringify(data);
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyData)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(bodyData);
    req.end();
  });
}

async function fixInvalidGTINs() {
  console.log('🔧 Iniciando correção de GTINs inválidos...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const product of INVALID_PRODUCTS) {
    try {
      console.log(`📦 Removendo GTIN de: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      
      await updateProduct(product.id, {
        codigo_barras: ''  // Remover GTIN
      });
      
      console.log(`   ✅ GTIN removido com sucesso!\n`);
      success++;
      
      // Delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('\n📊 RESUMO:');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${success} produtos`);
  console.log(`❌ Falhas: ${failed} produtos`);
  console.log('='.repeat(60));
  
  console.log('\n📌 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde 24-48h para o Google processar as mudanças');
  console.log('2. Acesse: https://merchants.google.com');
  console.log('3. Vá em Products → Needs attention');
  console.log('4. Verifique se os erros "Reserved GTIN" sumiram');
  console.log('\n💡 O status "Limited" pode persistir por alguns dias,');
  console.log('   mas os produtos estarão aprovados para exibição.\n');
}

fixInvalidGTINs();
