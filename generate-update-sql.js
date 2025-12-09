#!/usr/bin/env node

// Script para gerar SQL de atualização dos URLs das imagens
const fs = require('fs');
const https = require('https');

const API_BASE = 'https://kzstore-341392738431.europe-southwest1.run.app';
const BUCKET_URL = 'https://storage.googleapis.com/kzstore-images';

async function fetchProducts() {
  return new Promise((resolve, reject) => {
    https.get(`${API_BASE}/api/products?limit=1000`, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const products = json.data || json.products || [];
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function sanitizeFilename(url, productId) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '.jpg';
    const nameWithoutExt = filename.replace(ext, '');
    
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50);
    return `product-${productId}-${safeName}${ext}`;
  } catch {
    return `product-${productId}-image-${Date.now()}.jpg`;
  }
}

async function generateSQL() {
  console.log('🔍 Buscando produtos...');
  const products = await fetchProducts();
  
  const externalUrls = products.filter(p => {
    const url = p.imagem_url || '';
    return url.includes('loja.sistec.co.ao') || 
           url.includes('http://') || 
           (url.includes('https://') && !url.includes('storage.googleapis.com'));
  });

  console.log(`📊 ${externalUrls.length} produtos para atualizar\n`);
  console.log('-- SQL para atualizar URLs das imagens\n');

  for (const product of externalUrls) {
    const filename = sanitizeFilename(product.imagem_url, product.id);
    const newUrl = `${BUCKET_URL}/${filename}`;
    
    console.log(`UPDATE Product SET imagem_url = '${newUrl}' WHERE id = '${product.id}';`);
  }

  console.log('\n-- Fim do SQL');
  console.log(`\n✅ Gerados ${externalUrls.length} comandos UPDATE`);
}

generateSQL();
