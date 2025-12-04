/**
 * Script para atualizar produtos existentes com campos obrigatórios para feeds
 * Adiciona: marca, codigo_barras (GTIN), sku
 */

import { getPrismaClient } from './src/utils/prisma/client';

const prisma = getPrismaClient();

/**
 * Generate EAN-13 barcode (GTIN)
 */
function generateEAN13(): string {
  // Generate 12 random digits (starting with 2 for Angola products)
  let code = '2';
  for (let i = 0; i < 11; i++) {
    code += Math.floor(Math.random() * 10);
  }
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return code + checkDigit;
}

/**
 * Generate SKU from product name
 */
function generateSKU(name: string, id: string): string {
  const cleanName = name
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 3)
    .join('-');
  
  const shortId = id.substring(0, 6).toUpperCase();
  return `${cleanName}-${shortId}`;
}

/**
 * Extract brand from product name or category
 */
function extractBrand(name: string): string {
  // Common brands in tech/electronics
  const knownBrands = [
    'Kingston', 'Corsair', 'Samsung', 'Intel', 'AMD', 'Nvidia', 'Western Digital',
    'Seagate', 'Crucial', 'G.Skill', 'ASUS', 'MSI', 'Gigabyte', 'Dell', 'HP',
    'Lenovo', 'Acer', 'LG', 'Sony', 'Logitech', 'Razer', 'SteelSeries', 'HyperX',
    'Sandisk', 'Transcend', 'Toshiba', 'Lexar', 'PNY', 'EVGA', 'Zotac', 'Palit',
    'Apple', 'Microsoft', 'Google', 'Amazon', 'TP-Link', 'D-Link', 'Netgear',
    'Canon', 'Epson', 'Brother', 'Xiaomi', 'Huawei', 'Oppo', 'Realme', 'Vivo'
  ];
  
  // Check if any known brand is in the name
  for (const brand of knownBrands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Default to generic brand
  return 'KZStore';
}

async function updateExistingProducts() {
  console.log('🔄 Iniciando atualização de produtos existentes...\n');
  
  try {
    // Buscar todos produtos ativos
    const products = await prisma.product.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        marca: true,
        codigo_barras: true,
        sku: true,
      }
    });
    
    console.log(`📦 Encontrados ${products.length} produtos ativos\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      const updates: any = {};
      let needsUpdate = false;
      
      // 1. Adicionar marca se não existir
      if (!product.marca || product.marca.trim() === '') {
        updates.marca = extractBrand(product.nome);
        needsUpdate = true;
        console.log(`  📝 ${product.nome.substring(0, 40)}... → Marca: ${updates.marca}`);
      }
      
      // 2. Adicionar código de barras (GTIN) se não existir
      if (!product.codigo_barras || product.codigo_barras.trim() === '') {
        updates.codigo_barras = generateEAN13();
        needsUpdate = true;
        console.log(`  🔢 ${product.nome.substring(0, 40)}... → GTIN: ${updates.codigo_barras}`);
      }
      
      // 3. Adicionar SKU se não existir
      if (!product.sku || product.sku.trim() === '') {
        updates.sku = generateSKU(product.nome, product.id);
        needsUpdate = true;
        console.log(`  🏷️  ${product.nome.substring(0, 40)}... → SKU: ${updates.sku}`);
      }
      
      // Atualizar se necessário
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        updated++;
        console.log(`  ✅ Produto atualizado: ${product.nome.substring(0, 50)}...\n`);
      } else {
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Atualização concluída!');
    console.log(`   📊 Total de produtos: ${products.length}`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ⏭️  Já tinham dados: ${skipped}`);
    console.log('='.repeat(60));
    
    // Verificar feeds
    console.log('\n📢 Verificando feeds:');
    console.log('   - JSON Feed: https://kzstore.ao/feed.json');
    console.log('   - Facebook Feed: https://kzstore.ao/feed.xml');
    console.log('   - Google Feed: https://kzstore.ao/google-feed.xml');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produtos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
updateExistingProducts()
  .then(() => {
    console.log('\n✨ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
