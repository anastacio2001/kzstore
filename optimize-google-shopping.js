// Script para otimizar títulos e descrições dos produtos para Google Shopping
// Adiciona palavras-chave locais (Luanda, Angola) e características para melhor ranking orgânico

const fetch = require('node-fetch');

const API_URL = 'https://kzstore-341392738431.europe-southwest1.run.app';

// Função para login
async function login() {
  console.log('🔐 Fazendo login como admin...');
  
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'l.anastacio001@gmail.com',
      password: 'Levi@2003'
    })
  });

  if (!response.ok) {
    throw new Error('Falha no login');
  }

  const data = await response.json();
  console.log('✅ Login bem-sucedido!\n');
  return data.token;
}

// Função para buscar todos produtos
async function getAllProducts(token) {
  console.log('📦 Buscando todos produtos...');
  
  const response = await fetch(`${API_URL}/api/products?limit=1000`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar produtos');
  }

  const data = await response.json();
  console.log(`✅ ${data.products.length} produtos encontrados\n`);
  return data.products;
}

// Função para otimizar título do produto
function optimizeTitle(product) {
  const { nome, categoria, marca } = product;
  
  // Estrutura otimizada: [Marca] [Nome] - [Categoria] - Entrega Luanda Angola
  let optimizedTitle = '';
  
  if (marca && marca !== 'Generic') {
    optimizedTitle += `${marca} `;
  }
  
  optimizedTitle += nome;
  
  // Adicionar categoria se não estiver no nome
  if (categoria && !nome.toLowerCase().includes(categoria.toLowerCase())) {
    optimizedTitle += ` - ${categoria}`;
  }
  
  // Adicionar palavras-chave locais
  if (!optimizedTitle.toLowerCase().includes('angola') && !optimizedTitle.toLowerCase().includes('luanda')) {
    optimizedTitle += ' - Entrega Luanda Angola';
  }
  
  // Limitar a 150 caracteres (máximo Google Shopping)
  if (optimizedTitle.length > 150) {
    optimizedTitle = optimizedTitle.substring(0, 147) + '...';
  }
  
  return optimizedTitle;
}

// Função para otimizar descrição do produto
function optimizeDescription(product) {
  const { descricao, nome, marca, categoria, preco } = product;
  
  let optimizedDesc = '';
  
  // Se já tem descrição boa (>200 chars), manter e só adicionar keywords
  if (descricao && descricao.length > 200) {
    optimizedDesc = descricao;
    
    // Adicionar keywords locais no final se não existirem
    if (!descricao.toLowerCase().includes('luanda') && !descricao.toLowerCase().includes('angola')) {
      optimizedDesc += '\n\n🚚 Entrega rápida em Luanda, Angola. Compre na KZSTORE - loja de eletrónicos #1 em Angola. Aceitamos Multicaixa e transferência bancária.';
    }
  } else {
    // Criar descrição do zero
    optimizedDesc = `${nome} ${marca ? 'da marca ' + marca : ''} disponível na KZSTORE.\n\n`;
    
    optimizedDesc += `✅ Produto original com garantia\n`;
    optimizedDesc += `✅ Entrega rápida em Luanda (24-48h)\n`;
    optimizedDesc += `✅ Pagamento seguro (Multicaixa/Transferência)\n`;
    optimizedDesc += `✅ Atendimento via WhatsApp\n\n`;
    
    if (categoria) {
      optimizedDesc += `Categoria: ${categoria}\n`;
    }
    
    optimizedDesc += `\nCompre online em kzstore.ao - A melhor loja de eletrónicos e tecnologia em Angola. `;
    optimizedDesc += `Servimos Luanda e toda Angola com os melhores preços do mercado.\n\n`;
    optimizedDesc += `#${categoria || 'Tech'}Angola #LuandaShopping #ComprarEmAngola #EletronicosAngola`;
  }
  
  return optimizedDesc;
}

// Função para atualizar produto
async function updateProduct(token, productId, updates) {
  const response = await fetch(`${API_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Falha ao atualizar produto ${productId}: ${error}`);
  }

  return await response.json();
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando otimização de produtos para Google Shopping...\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Login
    const token = await login();

    // 2. Buscar todos produtos
    const products = await getAllProducts(token);

    // 3. Otimizar cada produto
    console.log('🔄 Otimizando produtos...\n');
    
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        const optimizedTitle = optimizeTitle(product);
        const optimizedDesc = optimizeDescription(product);

        // Verificar se precisa atualizar
        const needsUpdate = 
          optimizedTitle !== product.nome || 
          optimizedDesc !== product.descricao;

        if (!needsUpdate) {
          console.log(`⏭️  PULADO: ${product.nome.substring(0, 50)}... (já otimizado)`);
          skippedCount++;
          continue;
        }

        // Atualizar produto
        await updateProduct(token, product.id, {
          nome: optimizedTitle,
          descricao: optimizedDesc
        });

        console.log(`✅ OTIMIZADO: ${product.nome.substring(0, 40)}...`);
        console.log(`   Novo título: ${optimizedTitle.substring(0, 60)}...`);
        console.log(`   Descrição: ${optimizedDesc.length} caracteres\n`);
        
        successCount++;

        // Pequeno delay para não sobrecarregar API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ ERRO: ${product.nome}`);
        console.error(`   ${error.message}\n`);
        failCount++;
      }
    }

    // 4. Resumo final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA OTIMIZAÇÃO:');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Total de produtos: ${products.length}`);
    console.log(`✅ Otimizados com sucesso: ${successCount}`);
    console.log(`⏭️  Já otimizados (pulados): ${skippedCount}`);
    console.log(`❌ Falhas: ${failCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 OTIMIZAÇÃO CONCLUÍDA!');
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Aguardar 24-48h para Google reindexar produtos');
      console.log('2. Verificar Google Merchant Center');
      console.log('3. Produtos devem aparecer melhor em buscas como:');
      console.log('   - "comprar [produto] luanda"');
      console.log('   - "loja eletrónicos angola"');
      console.log('   - "[marca] angola preço"');
      console.log('\n✨ Resultado: Mais visibilidade GRATUITA no Google!');
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
    process.exit(1);
  }
}

// Executar
main();
