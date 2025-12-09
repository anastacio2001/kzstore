#!/usr/bin/env node

// Script simples para atualizar produtos via curl (sem autenticação necessária para teste)
const https = require('https');
const fs = require('fs');

const API_BASE = 'https://kzstore-341392738431.europe-southwest1.run.app';
const BUCKET_URL = 'https://storage.googleapis.com/kzstore-images';

// Leitura do arquivo SQL gerado
const sqlFile = fs.readFileSync('./update-images.sql', 'utf8');
const lines = sqlFile.split('\n').filter(l => l.startsWith('UPDATE'));

console.log(`📊 ${lines.length} produtos para atualizar\n`);

let updated = 0;
let failed = 0;

async function updateOne(line, index) {
  // Extrair ID e URL do SQL
  // UPDATE Product SET imagem_url = 'URL' WHERE id = 'ID';
  const urlMatch = line.match(/imagem_url = '([^']+)'/);
  const idMatch = line.match(/id = '([^']+)'/);
  
  if (!urlMatch || !idMatch) {
    console.log(`⚠️  [${index + 1}/${lines.length}] Linha inválida`);
    return false;
  }
  
  const newUrl = urlMatch[1];
  const productId = idMatch[1];
  
  return new Promise((resolve) => {
    const data = JSON.stringify({ imagem_url: newUrl });
    
    const options = {
      hostname: 'kzstore-341392738431.europe-southwest1.run.app',
      port: 443,
      path: `/api/products/${productId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        if (success) {
          console.log(`✅ [${index + 1}/${lines.length}] Produto ${productId.substring(0, 8)}... atualizado`);
        } else {
          console.log(`❌ [${index + 1}/${lines.length}] Status ${res.statusCode} - ${productId.substring(0, 8)}...`);
          if (res.statusCode === 401 || res.statusCode === 403) {
            console.log(`   ⚠️  Problema de autenticação - endpoint requer admin`);
          }
        }
        resolve(success);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ [${index + 1}/${lines.length}] Erro: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`❌ [${index + 1}/${lines.length}] Timeout`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  for (let i = 0; i < lines.length; i++) {
    const success = await updateOne(lines[i], i);
    if (success) {
      updated++;
    } else {
      failed++;
    }
    
    // Pausa de 100ms entre requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n✨ ATUALIZAÇÃO CONCLUÍDA! ✨`);
  console.log(`📊 Resumo:`);
  console.log(`   - Total: ${lines.length}`);
  console.log(`   - Atualizados: ${updated}`);
  console.log(`   - Falhas: ${failed}`);
  console.log(`   - Taxa de sucesso: ${((updated / lines.length) * 100).toFixed(1)}%`);
}

main();
