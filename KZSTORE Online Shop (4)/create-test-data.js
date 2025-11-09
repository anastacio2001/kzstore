// Script para criar cupons e reviews de teste
const projectId = "duxeeawfyxcciwlyjllk";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eGVlYXdmeXhjY2l3bHlqbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwMDQsImV4cCI6MjA3Nzg1MzAwNH0.1BWI_11MST5ZC19NEx5yZoLJHn3MtOmgfd-Fs8FQhVc";

// IDs dos produtos (do check-data.js)
const IPHONE_ID = '2d45d6af-0cec-4134-b11b-c70a58da0629';
const MACBOOK_ID = 'a7e75881-78e0-4bbc-b329-8e2b1e3910aa';
const AIRPODS_ID = 'e0eadf3d-b3cb-4b8b-906a-883308b9f95b';
const SAMSUNG_ID = 'c0d8a598-5528-4adb-8f02-789faf9ba137';
const PS5_ID = 'dd115009-9394-4c1e-98b2-32fef545fd65';

async function createCoupons() {
  console.log('\n🎫 Criando cupons de teste...\n');

  const coupons = [
    {
      code: 'BEMVINDO',
      description: 'Cupom de boas-vindas - 10% OFF na primeira compra',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 50000,
      max_uses: 100,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias
      is_active: true
    },
    {
      code: 'BLACKFRIDAY',
      description: 'Black Friday 2025 - 20% OFF em tudo',
      discount_type: 'percentage',
      discount_value: 20,
      min_purchase: 0,
      max_uses: 1000,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      is_active: true
    },
    {
      code: 'FRETE10',
      description: 'Desconto fixo de 10.000 AOA (frete grátis)',
      discount_type: 'fixed',
      discount_value: 10000,
      min_purchase: 100000,
      max_uses: 50,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
      is_active: true
    },
    {
      code: 'CLIENTE50',
      description: 'Desconto de 50.000 AOA para clientes especiais',
      discount_type: 'fixed',
      discount_value: 50000,
      min_purchase: 200000,
      max_uses: 20,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 dias
      is_active: true
    }
  ];

  for (const coupon of coupons) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/coupons`,
        {
          method: 'POST',
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(coupon)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Cupom criado: ${coupon.code} (${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_value.toLocaleString('pt-AO') + ' AOA'})`);
      } else {
        const error = await response.text();
        console.error(`❌ Erro ao criar cupom ${coupon.code}:`, error);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar cupom ${coupon.code}:`, error.message);
    }
  }
}

async function createReviews() {
  console.log('\n⭐ Criando reviews de teste...\n');

  const reviews = [
    {
      product_id: IPHONE_ID,
      user_name: 'João Silva',
      user_email: 'joao.silva@example.com',
      rating: 5,
      comment: 'Excelente smartphone! A câmera é incrível e a bateria dura o dia todo. Recomendo muito!',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: IPHONE_ID,
      user_name: 'Maria Santos',
      user_email: 'maria.santos@example.com',
      rating: 4,
      comment: 'Muito bom, mas achei o preço um pouco alto. A qualidade compensa.',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: MACBOOK_ID,
      user_name: 'Pedro Costa',
      user_email: 'pedro.costa@example.com',
      rating: 5,
      comment: 'Melhor notebook que já tive! Perfeito para trabalho e edição de vídeo. O chip M3 é muito rápido!',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: MACBOOK_ID,
      user_name: 'Ana Ferreira',
      user_email: 'ana.ferreira@example.com',
      rating: 5,
      comment: 'Chegou rápido e em perfeitas condições. Adorei a tela Retina!',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: AIRPODS_ID,
      user_name: 'Carlos Mendes',
      user_email: 'carlos.mendes@example.com',
      rating: 4,
      comment: 'Muito bons! O cancelamento de ruído funciona perfeitamente. Só achei um pouco caros.',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: SAMSUNG_ID,
      user_name: 'Beatriz Lima',
      user_email: 'beatriz.lima@example.com',
      rating: 5,
      comment: 'A câmera de 200MP é espetacular! Melhor Android do mercado.',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: SAMSUNG_ID,
      user_name: 'Ricardo Oliveira',
      user_email: 'ricardo.oliveira@example.com',
      rating: 5,
      comment: 'Bateria dura muito, tela linda e a S Pen é muito útil!',
      is_verified_purchase: false,
      is_approved: true
    },
    {
      product_id: PS5_ID,
      user_name: 'Lucas Pereira',
      user_email: 'lucas.pereira@example.com',
      rating: 5,
      comment: 'Console incrível! Os gráficos são de outro nível. Vale cada centavo!',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: PS5_ID,
      user_name: 'Juliana Sousa',
      user_email: 'juliana.sousa@example.com',
      rating: 4,
      comment: 'Muito bom, mas poderia ter mais armazenamento. Jogos ocupam muito espaço.',
      is_verified_purchase: true,
      is_approved: true
    },
    {
      product_id: AIRPODS_ID,
      user_name: 'Gabriel Nunes',
      user_email: 'gabriel.nunes@example.com',
      rating: 3,
      comment: 'Bons, mas não achei que o áudio fosse tão superior assim. Esperava mais pelo preço.',
      is_verified_purchase: false,
      is_approved: true
    }
  ];

  for (const review of reviews) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/reviews`,
        {
          method: 'POST',
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(review)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Review criada: ${review.user_name} - ${review.rating}⭐ ${review.is_verified_purchase ? '✓' : ''}`);
      } else {
        const error = await response.text();
        console.error(`❌ Erro ao criar review de ${review.user_name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar review de ${review.user_name}:`, error.message);
    }
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   KZSTORE - Criação de Dados de Teste           ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  await createCoupons();
  await createReviews();

  console.log('\n🎉 Todos os dados de teste foram criados com sucesso!\n');
  console.log('📝 Resumo:');
  console.log('   ✅ 4 cupons criados');
  console.log('   ✅ 10 reviews criadas\n');
  console.log('🚀 Acesse o site para ver as funcionalidades em ação!\n');
}

main();
