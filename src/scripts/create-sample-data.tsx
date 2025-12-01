// Script para criar dados de exemplo para o sistema de publicidade e equipe
// Execute este código no console do navegador após fazer login no admin

import { projectId, publicAnonKey } from '../utils/supabase/info';

async function createSampleAds() {
  const sampleAds = [
    {
      titulo: 'Black Friday KZSTORE 2024',
      descricao: 'Descontos de até 50% em produtos selecionados',
      imagem_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      link_url: '/products',
      posicao: 'home-hero-banner',
      tipo: 'banner',
      ativo: true,
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
    },
    {
      titulo: 'Memória RAM DDR5 - Promoção',
      descricao: 'As melhores memórias para servidores com 20% OFF',
      imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
      link_url: '/products?category=Memória RAM',
      posicao: 'category-top',
      tipo: 'banner',
      ativo: true,
      data_inicio: new Date().toISOString()
    },
    {
      titulo: 'Frete Grátis para Luanda',
      descricao: 'Em compras acima de 100.000 Kz',
      imagem_url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80',
      link_url: '/checkout',
      posicao: 'home-sidebar',
      tipo: 'sidebar',
      ativo: true,
      data_inicio: new Date().toISOString()
    },
    {
      titulo: 'Suporte Técnico Especializado',
      descricao: 'Fale com nossos especialistas via WhatsApp',
      imagem_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
      link_url: 'https://wa.me/244931054015',
      posicao: 'product-sidebar',
      tipo: 'sidebar',
      ativo: true,
      data_inicio: new Date().toISOString()
    },
    {
      titulo: 'Mini PCs em Promoção',
      descricao: 'Perfeitos para escritórios e home office',
      imagem_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
      link_url: '/products?category=Mini PCs',
      posicao: 'home-middle-banner',
      tipo: 'banner',
      ativo: true,
      data_inicio: new Date().toISOString()
    },
    {
      titulo: 'Garanta o seu agora!',
      descricao: 'Finalize seu pedido e receba em 24-48h',
      imagem_url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80',
      link_url: '/checkout',
      posicao: 'checkout-banner',
      tipo: 'banner',
      ativo: true,
      data_inicio: new Date().toISOString()
    }
  ];

  console.log('🎨 Criando anúncios de exemplo...');

  for (const ad of sampleAds) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/ads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(ad),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Anúncio criado: ${ad.titulo}`);
      } else {
        console.error(`❌ Erro ao criar anúncio: ${ad.titulo}`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Erro ao criar anúncio: ${ad.titulo}`, error);
    }
  }

  console.log('✨ Anúncios de exemplo criados com sucesso!');
}

async function createSampleTeamMembers() {
  const sampleMembers = [
    {
      nome: 'João Silva',
      email: 'joao.silva@kzstore.ao',
      role: 'super_admin',
      ativo: true
    },
    {
      nome: 'Maria Santos',
      email: 'maria.santos@kzstore.ao',
      role: 'admin',
      ativo: true
    },
    {
      nome: 'Pedro Costa',
      email: 'pedro.costa@kzstore.ao',
      role: 'editor',
      ativo: true
    },
    {
      nome: 'Ana Ferreira',
      email: 'ana.ferreira@kzstore.ao',
      role: 'editor',
      ativo: true
    },
    {
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@kzstore.ao',
      role: 'viewer',
      ativo: true
    }
  ];

  console.log('👥 Criando membros de equipe de exemplo...');

  for (const member of sampleMembers) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/team`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(member),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Membro criado: ${member.nome} (${member.role})`);
      } else {
        console.error(`❌ Erro ao criar membro: ${member.nome}`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Erro ao criar membro: ${member.nome}`, error);
    }
  }

  console.log('✨ Membros de equipe de exemplo criados com sucesso!');
}

// Função principal para criar todos os dados de exemplo
export async function createAllSampleData() {
  console.log('🚀 Iniciando criação de dados de exemplo...\n');
  
  await createSampleAds();
  console.log('');
  await createSampleTeamMembers();
  
  console.log('\n🎉 Todos os dados de exemplo foram criados com sucesso!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Acesse o Painel Admin');
  console.log('2. Navegue até "Anúncios" para ver os anúncios criados');
  console.log('3. Navegue até "Equipe" para ver os membros criados');
  console.log('4. Visite as páginas da loja para ver os anúncios em ação!');
}

// Auto-executar se estiver no console do navegador
if (typeof window !== 'undefined') {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('    KZSTORE - Script de Dados de Exemplo');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Para criar os dados de exemplo, execute:');
  console.log('');
  console.log('  createAllSampleData()');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}
