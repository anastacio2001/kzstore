/**
 * Script para popular o banco de dados com produtos iniciais
 * 
 * USO: node popular-produtos.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Produtos iniciais (amostra - baseado no arquivo products.ts)
const produtos = [
  {
    nome: 'Memória RAM DDR4 16GB ECC - HP ProLiant',
    descricao: 'Memória RAM DDR4 de 16GB com suporte ECC para servidores HP ProLiant. Ideal para ambientes corporativos que exigem alta confiabilidade.',
    categoria: 'RAM',
    preco_aoa: 45000,
    peso_kg: 0.05,
    estoque: 25,
    imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    especificacoes: {
      'Tipo': 'DDR4',
      'Capacidade': '16GB',
      'ECC': 'Sim',
      'Velocidade': '2666MHz',
      'Compatibilidade': 'HP ProLiant, Dell PowerEdge'
    },
    ativo: true,
    destaque: true
  },
  {
    nome: 'Memória RAM DDR3 8GB UDIMM',
    descricao: 'Memória RAM DDR3 de 8GB UDIMM para servidores e estações de trabalho. Excelente custo-benefício.',
    categoria: 'RAM',
    preco_aoa: 25000,
    peso_kg: 0.05,
    estoque: 40,
    imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    especificacoes: {
      'Tipo': 'DDR3',
      'Capacidade': '8GB',
      'ECC': 'Não',
      'Velocidade': '1600MHz'
    },
    ativo: true
  },
  {
    nome: 'HDD SAS 2TB 7200RPM - Enterprise',
    descricao: 'Hard disk SAS de 2TB com 7200 RPM. Ideal para servidores e storage empresarial.',
    categoria: 'HDD',
    preco_aoa: 85000,
    peso_kg: 0.6,
    estoque: 30,
    imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    especificacoes: {
      'Interface': 'SAS',
      'Capacidade': '2TB',
      'Velocidade': '7200 RPM',
      'Cache': '128MB',
      'Uso': 'Enterprise'
    },
    ativo: true,
    destaque: true
  },
  {
    nome: 'SSD NVMe 512GB - Alta Performance',
    descricao: 'SSD NVMe M.2 de 512GB com velocidades de leitura de até 3500MB/s. Perfeito para sistemas que exigem rapidez.',
    categoria: 'SSD',
    preco_aoa: 55000,
    peso_kg: 0.02,
    estoque: 50,
    imagem_url: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500',
    especificacoes: {
      'Interface': 'NVMe M.2',
      'Capacidade': '512GB',
      'Leitura': '3500 MB/s',
      'Escrita': '3000 MB/s',
      'Fator de forma': 'M.2 2280'
    },
    ativo: true,
    destaque: true
  },
  {
    nome: 'Processador Intel Xeon E5-2670 v3',
    descricao: 'Processador Intel Xeon de 12 núcleos e 24 threads. Perfeito para servidores de alta demanda.',
    categoria: 'Processador',
    preco_aoa: 180000,
    peso_kg: 0.1,
    estoque: 10,
    imagem_url: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=500',
    especificacoes: {
      'Marca': 'Intel',
      'Modelo': 'Xeon E5-2670 v3',
      'Núcleos': '12',
      'Threads': '24',
      'Frequência': '2.3 GHz',
      'Socket': 'LGA 2011-3'
    },
    ativo: true
  },
  {
    nome: 'Placa Mãe Server ASUS Z10PE-D16 WS',
    descricao: 'Placa mãe dual socket para servidores. Suporta 2 processadores Intel Xeon E5 v3/v4.',
    categoria: 'Placa Mãe',
    preco_aoa: 250000,
    peso_kg: 2.5,
    estoque: 5,
    imagem_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
    especificacoes: {
      'Marca': 'ASUS',
      'Sockets': '2x LGA 2011-3',
      'Chipset': 'Intel C612',
      'RAM': 'Até 512GB DDR4',
      'Slots PCIe': '7x PCIe 3.0'
    },
    ativo: true,
    destaque: true
  },
  {
    nome: 'Fonte Server 750W 80+ Platinum',
    descricao: 'Fonte de alimentação redundante para servidores, certificação 80+ Platinum para máxima eficiência energética.',
    categoria: 'Fonte',
    preco_aoa: 95000,
    peso_kg: 2.0,
    estoque: 20,
    imagem_url: 'https://images.unsplash.com/photo-1585128792160-43663f29ea53?w=500',
    especificacoes: {
      'Potência': '750W',
      'Certificação': '80+ Platinum',
      'Tipo': 'Redundante',
      'Modular': 'Sim'
    },
    ativo: true
  },
  {
    nome: 'Switch Gigabit 24 Portas',
    descricao: 'Switch gerenciável de 24 portas Gigabit Ethernet. Ideal para racks de servidores.',
    categoria: 'Rede',
    preco_aoa: 145000,
    peso_kg: 3.5,
    estoque: 8,
    imagem_url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    especificacoes: {
      'Portas': '24x Gigabit Ethernet',
      'Gerenciável': 'Sim',
      'VLAN': 'Suporte',
      'PoE': 'Opcional',
      'Montagem': 'Rack 19"'
    },
    ativo: true
  },
  {
    nome: 'Gabinete Server Rack 4U',
    descricao: 'Gabinete para servidor em formato rack 4U. Construção robusta em aço.',
    categoria: 'Gabinete',
    preco_aoa: 120000,
    peso_kg: 15.0,
    estoque: 6,
    imagem_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
    especificacoes: {
      'Formato': '4U Rack 19"',
      'Material': 'Aço',
      'Baias': '8x 3.5" hot-swap',
      'Ventilação': '4x 120mm'
    },
    ativo: true
  },
  {
    nome: 'Teclado + Mouse Wireless Kit',
    descricao: 'Conjunto teclado e mouse sem fio. Ergonômico e silencioso.',
    categoria: 'Periféricos',
    preco_aoa: 15000,
    peso_kg: 0.8,
    estoque: 50,
    imagem_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    especificacoes: {
      'Conectividade': 'Wireless 2.4GHz',
      'Alcance': '10 metros',
      'Bateria': 'AAA (incluída)',
      'Layout': 'QWERTY US'
    },
    ativo: true
  }
];

async function popularProdutos() {
  try {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║      POPULAR BANCO DE DADOS - KZSTORE                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Verificar se já existem produtos
    const count = await prisma.product.count();
    
    if (count > 0) {
      console.log(`⚠️  Já existem ${count} produtos no banco!\n`);
      console.log('Deseja continuar mesmo assim? (ctrl+c para cancelar)\n');
      // Aguardar 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('📦 Criando produtos...\n');
    
    let criados = 0;
    let erros = 0;

    for (const produto of produtos) {
      try {
        await prisma.product.create({
          data: {
            ...produto,
            especificacoes: produto.especificacoes
          }
        });
        criados++;
        console.log(`✅ ${produto.nome}`);
      } catch (error) {
        erros++;
        console.log(`❌ Erro ao criar "${produto.nome}":`, error.message);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              RESUMO                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`   ✅ Produtos criados: ${criados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📊 Total no banco: ${await prisma.product.count()}\n`);

    if (criados > 0) {
      console.log('🎉 Banco de dados populado com sucesso!\n');
      console.log('Você pode agora:');
      console.log('1. Acessar http://localhost:3000');
      console.log('2. Ver os produtos na página inicial');
      console.log('3. Adicionar ao carrinho e testar checkout\n');
    }

  } catch (error) {
    console.error('\n❌ Erro ao popular banco:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
popularProdutos();
