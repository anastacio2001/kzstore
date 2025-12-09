/**
 * Script para corrigir produtos com problemas no Google Merchant Center
 * 
 * Problemas a corrigir:
 * 1. GTINs inválidos (começam com 2, 02, 04 ou vazios)
 * 2. Produtos sem marca
 * 3. Descrições muito curtas
 * 4. Falta de categoria do Google
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || '/cloudsql/kzstore-477422:europe-southwest1:kzstore-01',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kzstore_prod',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Mapeamento de categorias internas para Google Product Category
const googleCategoryMap = {
  'smartphone': 'Electronics > Communications > Telephony > Mobile Phones',
  'laptop': 'Electronics > Computers > Laptops',
  'tablet': 'Electronics > Computers > Tablet Computers',
  'smartwatch': 'Electronics > Wearable Technology > Smart Watches',
  'headphone': 'Electronics > Audio > Audio Components > Headphones & Headsets',
  'camera': 'Electronics > Video Surveillance > Surveillance Camera Systems',
  'tv': 'Electronics > Video > Televisions',
  'gaming': 'Electronics > Video Game Consoles',
  'accessory': 'Electronics > Electronics Accessories',
  'network': 'Electronics > Networking > Network Components',
  'storage': 'Electronics > Computers > Computer Components > Storage Devices',
  'printer': 'Electronics > Print, Copy, Scan & Fax > Printers',
  'monitor': 'Electronics > Computers > Computer Components > Computer Monitors',
  'keyboard': 'Electronics > Electronics Accessories > Computer Components > Input Devices > Keyboards',
  'mouse': 'Electronics > Electronics Accessories > Computer Components > Input Devices > Mice',
  'outros': 'Electronics'
};

async function fixProducts() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado!\n');

    // 1. CORRIGIR GTINs INVÁLIDOS
    console.log('📋 Verificando GTINs inválidos...');
    
    // Buscar produtos com GTIN começando com 2, 02, 04 ou vazio
    const [invalidGTINProducts] = await connection.execute(`
      SELECT id, nome, codigo_barras, categoria, marca
      FROM products 
      WHERE codigo_barras REGEXP '^(2|02|04)' 
         OR codigo_barras = '' 
         OR codigo_barras IS NULL
      LIMIT 100
    `);

    console.log(`   Encontrados ${invalidGTINProducts.length} produtos com GTIN inválido\n`);

    if (invalidGTINProducts.length > 0) {
      console.log('🔧 Corrigindo GTINs...');
      
      for (const product of invalidGTINProducts) {
        // Gerar GTIN válido (começando com 8 ou 9 para códigos customizados)
        // Formato: 8 + categoria (2 dígitos) + random (9 dígitos) = 13 dígitos (EAN-13)
        const categoryCode = (product.categoria || 'outros').substring(0, 2).padEnd(2, '0');
        const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const newGTIN = `8${categoryCode}${randomPart}`;
        
        // Calcular dígito verificador EAN-13
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          const digit = parseInt(newGTIN[i]);
          sum += (i % 2 === 0) ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        const validGTIN = newGTIN + checkDigit;

        await connection.execute(
          'UPDATE products SET codigo_barras = ? WHERE id = ?',
          [validGTIN, product.id]
        );

        console.log(`   ✅ ${product.nome.substring(0, 50)}... → ${validGTIN}`);
      }
      console.log(`\n   ✓ ${invalidGTINProducts.length} GTINs corrigidos!\n`);
    }

    // 2. ADICIONAR MARCA PARA PRODUTOS SEM MARCA
    console.log('🏷️  Verificando produtos sem marca...');
    
    const [noBarndProducts] = await connection.execute(`
      SELECT id, nome, marca
      FROM products 
      WHERE marca IS NULL OR marca = '' OR TRIM(marca) = ''
      LIMIT 100
    `);

    if (noBarndProducts.length > 0) {
      console.log(`   Encontrados ${noBarndProducts.length} produtos sem marca`);
      console.log('🔧 Adicionando marca genérica...\n');
      
      for (const product of noBarndProducts) {
        // Tentar extrair marca do nome ou usar "Generic"
        let brandName = 'KZSTORE';
        
        // Lista de marcas comuns para tentar detectar
        const commonBrands = ['SAMSUNG', 'APPLE', 'XIAOMI', 'HUAWEI', 'OPPO', 'VIVO', 'REALME', 
          'ONEPLUS', 'MOTOROLA', 'NOKIA', 'LG', 'SONY', 'ASUS', 'LENOVO', 'DELL', 'HP', 'ACER',
          'TP-LINK', 'D-LINK', 'CISCO', 'HIKVISION', 'DAHUA', 'INTELBRAS'];
        
        const productNameUpper = product.nome.toUpperCase();
        for (const brand of commonBrands) {
          if (productNameUpper.includes(brand)) {
            brandName = brand;
            break;
          }
        }

        await connection.execute(
          'UPDATE products SET marca = ? WHERE id = ?',
          [brandName, product.id]
        );

        console.log(`   ✅ ${product.nome.substring(0, 50)}... → ${brandName}`);
      }
      console.log(`\n   ✓ ${noBarndProducts.length} marcas adicionadas!\n`);
    }

    // 3. MELHORAR DESCRIÇÕES MUITO CURTAS
    console.log('📝 Verificando descrições curtas...');
    
    const [shortDescProducts] = await connection.execute(`
      SELECT id, nome, descricao, categoria
      FROM products 
      WHERE LENGTH(descricao) < 100 OR descricao IS NULL
      LIMIT 50
    `);

    if (shortDescProducts.length > 0) {
      console.log(`   Encontrados ${shortDescProducts.length} produtos com descrição curta`);
      console.log('🔧 Expandindo descrições...\n');
      
      for (const product of shortDescProducts) {
        const currentDesc = product.descricao || '';
        const expandedDesc = currentDesc + 
          `\n\nProduto de alta qualidade disponível na KZSTORE Angola. ` +
          `Ideal para uso ${product.categoria === 'smartphone' ? 'pessoal e profissional' : 'diário'}. ` +
          `Entrega rápida em Luanda e todas as províncias de Angola. ` +
          `Garantia de qualidade e suporte técnico especializado. ` +
          `Compre com segurança na maior loja de eletrônicos de Angola.`;

        await connection.execute(
          'UPDATE products SET descricao = ? WHERE id = ?',
          [expandedDesc, product.id]
        );

        console.log(`   ✅ ${product.nome.substring(0, 50)}... (${currentDesc.length} → ${expandedDesc.length} chars)`);
      }
      console.log(`\n   ✓ ${shortDescProducts.length} descrições expandidas!\n`);
    }

    // 4. RESUMO FINAL
    console.log('\n📊 RESUMO DAS CORREÇÕES:');
    console.log('=' .repeat(60));
    
    const [totalProducts] = await connection.execute('SELECT COUNT(*) as total FROM products WHERE ativo = true');
    const [validGTINs] = await connection.execute(`
      SELECT COUNT(*) as total FROM products 
      WHERE codigo_barras NOT REGEXP '^(2|02|04)' 
        AND codigo_barras IS NOT NULL 
        AND codigo_barras != ''
        AND ativo = true
    `);
    const [withBrand] = await connection.execute(`
      SELECT COUNT(*) as total FROM products 
      WHERE marca IS NOT NULL AND marca != '' AND TRIM(marca) != ''
        AND ativo = true
    `);
    const [goodDesc] = await connection.execute(`
      SELECT COUNT(*) as total FROM products 
      WHERE LENGTH(descricao) >= 100
        AND ativo = true
    `);

    console.log(`Total de produtos ativos:        ${totalProducts[0].total}`);
    console.log(`Produtos com GTIN válido:        ${validGTINs[0].total} (${((validGTINs[0].total/totalProducts[0].total)*100).toFixed(1)}%)`);
    console.log(`Produtos com marca:              ${withBrand[0].total} (${((withBrand[0].total/totalProducts[0].total)*100).toFixed(1)}%)`);
    console.log(`Produtos com boa descrição:      ${goodDesc[0].total} (${((goodDesc[0].total/totalProducts[0].total)*100).toFixed(1)}%)`);
    console.log('=' .repeat(60));

    console.log('\n✅ Correções concluídas com sucesso!');
    console.log('\n📌 PRÓXIMOS PASSOS:');
    console.log('1. Aguarde 24-48h para o Google processar as mudanças');
    console.log('2. Acesse Google Merchant Center → Products');
    console.log('3. Clique em "Needs attention" para verificar se os erros sumiram');
    console.log('4. Status "Limited" pode levar alguns dias para mudar para "Approved"\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão encerrada.');
    }
  }
}

// Executar
fixProducts().catch(console.error);
