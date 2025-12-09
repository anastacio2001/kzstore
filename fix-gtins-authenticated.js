/**
 * Script para corrigir GTINs inválidos com autenticação admin
 */

const https = require('https');

const API_URL = 'https://kzstore-341392738431.europe-southwest1.run.app';
const ADMIN_EMAIL = 'l.anastacio001@gmail.com';
const ADMIN_PASSWORD = 'Mae2019@@@';

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

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const bodyData = body ? JSON.stringify(body) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (bodyData) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function login() {
  console.log('🔐 Fazendo login como admin...');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.token || response.access_token) {
      const token = response.token || response.access_token;
      console.log('✅ Login realizado com sucesso!\n');
      return token;
    } else {
      throw new Error('Token não encontrado na resposta');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    throw error;
  }
}

async function updateProduct(id, data, token) {
  return makeRequest(`/api/products/${id}`, 'PUT', data, token);
}

async function fixInvalidGTINs() {
  console.log('🔧 CORREÇÃO DE GTINs INVÁLIDOS - GOOGLE MERCHANT CENTER\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Login
    const token = await login();
    
    // 2. Corrigir cada produto
    let success = 0;
    let failed = 0;
    
    for (const product of INVALID_PRODUCTS) {
      try {
        console.log(`📦 ${success + failed + 1}/${INVALID_PRODUCTS.length} - ${product.name}`);
        console.log(`   ID: ${product.id}`);
        
        await updateProduct(product.id, {
          codigo_barras: ''  // Remover GTIN inválido
        }, token);
        
        console.log(`   ✅ GTIN removido com sucesso!\n`);
        success++;
        
        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}\n`);
        failed++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('\n📊 RESUMO DA CORREÇÃO:');
    console.log(`✅ Sucesso: ${success} produtos`);
    console.log(`❌ Falhas: ${failed} produtos`);
    console.log(`📦 Total: ${INVALID_PRODUCTS.length} produtos processados`);
    
    if (success > 0) {
      console.log('\n🎉 GTINs inválidos removidos com sucesso!');
      console.log('\n📌 PRÓXIMOS PASSOS:');
      console.log('1. ⏰ Aguarde 24-48 horas para o Google processar');
      console.log('2. 🌐 Acesse: https://merchants.google.com');
      console.log('3. 📋 Vá em: Products → Needs attention');
      console.log('4. ✅ Verifique: Erros "Reserved GTIN" devem sumir');
      console.log('\n💡 OBSERVAÇÃO:');
      console.log('   • Status "Limited" pode persistir por alguns dias');
      console.log('   • Os produtos JÁ ESTÃO aprovados para exibição');
      console.log('   • "Limited" significa visibilidade reduzida, não bloqueio');
      console.log('\n🔄 Para melhorar o status "Limited":');
      console.log('   1. Adicione imagens de alta qualidade (>800x800px)');
      console.log('   2. Melhore as descrições (>200 caracteres)');
      console.log('   3. Adicione especificações detalhadas');
      console.log('   4. Use títulos descritivos e únicos\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    process.exit(1);
  }
}

// Executar
fixInvalidGTINs();
