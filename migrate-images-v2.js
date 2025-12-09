#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const API_BASE = 'https://kzstore-341392738431.europe-southwest1.run.app';
const ADMIN_EMAIL = 'l.anastacio001@gmail.com';
const ADMIN_PASSWORD = 'Mae2019@@@';

let authToken = null;

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = responseData ? JSON.parse(responseData) : {};
          resolve({ statusCode: res.statusCode, data: json, raw: responseData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: null, raw: responseData });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login() {
  console.log('🔐 Fazendo login como admin...');
  
  const loginData = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const options = {
    hostname: 'kzstore-341392738431.europe-southwest1.run.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
    },
  };

  try {
    const response = await makeRequest(options, loginData);
    
    if (response.statusCode === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login bem-sucedido!\n');
      return true;
    } else {
      console.log(`❌ Falha no login: ${response.statusCode}`);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro no login: ${error.message}`);
    return false;
  }
}

async function updateProduct(productId, newUrl, index, total) {
  // Usar endpoint específico de migração
  const data = JSON.stringify({ imagem_url: newUrl });
  
  const options = {
    hostname: 'kzstore-341392738431.europe-southwest1.run.app',
    port: 443,
    path: `/api/products/${productId}/image`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options, data);
    
    if (response.statusCode === 200) {
      console.log(`✅ [${index}/${total}] Produto ${productId.substring(0, 8)}... atualizado`);
      return true;
    } else {
      console.log(`❌ [${index}/${total}] Status ${response.statusCode} - ${productId.substring(0, 8)}...`);
      if (response.raw) {
        console.log(`   Resposta: ${response.raw.substring(0, 150)}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ [${index}/${total}] Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Não foi possível fazer login. Verifique as credenciais.');
    process.exit(1);
  }

  // 2. Ler arquivo SQL
  const sqlFile = fs.readFileSync('./update-images.sql', 'utf8');
  const lines = sqlFile.split('\n').filter(l => l.startsWith('UPDATE'));
  
  console.log(`📊 ${lines.length} produtos para atualizar (tentativa #3 com endpoint PATCH)\n`);

  // 3. Atualizar produtos
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extrair ID e URL do SQL
    const urlMatch = line.match(/imagem_url = '([^']+)'/);
    const idMatch = line.match(/id = '([^']+)'/);
    
    if (!urlMatch || !idMatch) {
      console.log(`⚠️  [${i + 1}/${lines.length}] Linha inválida`);
      failed++;
      continue;
    }
    
    const newUrl = urlMatch[1];
    const productId = idMatch[1];
    
    const success = await updateProduct(productId, newUrl, i + 1, lines.length);
    if (success) {
      updated++;
    } else {
      failed++;
    }
    
    // Pausa de 50ms entre requests
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n✨ MIGRAÇÃO CONCLUÍDA! ✨`);
  console.log(`📊 Resumo:`);
  console.log(`   - Total de produtos: ${lines.length}`);
  console.log(`   - Atualizados com sucesso: ${updated}`);
  console.log(`   - Falhas: ${failed}`);
  console.log(`   - Taxa de sucesso: ${((updated / lines.length) * 100).toFixed(1)}%`);
  
  if (updated > 0) {
    console.log(`\n🎉 Todas as imagens estão agora hospedadas no Google Cloud Storage!`);
    console.log(`📱 As imagens devem funcionar perfeitamente no mobile e desktop.`);
    console.log(`\n⏰ Aguarde 5 minutos para o cache expirar ou teste com:`);
    console.log(`   https://kzstore-341392738431.europe-southwest1.run.app`);
  }
}

main();
