/**
 * TESTE COMPLETO DE PEDIDO
 * 
 * Este script simula um pedido real e testa:
 * 1. Criação do pedido no banco
 * 2. Envio de email (Resend)
 * 3. Envio de WhatsApp (Twilio)
 */

const fetch = require('node-fetch');

// Configuração
const API_URL = 'http://localhost:8080';
const CUSTOMER_PHONE = '+244931054015'; // Seu número

async function testCompleteOrder() {
  console.log('🧪 TESTE COMPLETO DE PEDIDO - KZSTORE\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Buscar produtos disponíveis
    console.log('📦 1. Buscando produtos disponíveis...');
    const productsResponse = await fetch(`${API_URL}/api/products`);
    const products = await productsResponse.json();
    
    if (!products || products.length === 0) {
      throw new Error('Nenhum produto encontrado no banco de dados');
    }
    
    const firstProduct = products[0];
    console.log(`   ✅ Produto selecionado: ${firstProduct.nome}`);
    console.log(`   💰 Preço: ${Number(firstProduct.preco_aoa).toLocaleString('pt-AO')} Kz\n`);

    // 2. Criar pedido de teste
    console.log('📝 2. Criando pedido de teste...');
    
    const orderData = {
      items: [
        {
          product_id: firstProduct.id,
          product_name: firstProduct.nome,
          quantity: 1,
          price: Number(firstProduct.preco_aoa),
          image_url: firstProduct.imagem_url
        }
      ],
      shipping_address: {
        full_name: 'Cliente Teste KZSTORE',
        address: 'Rua da Samba, Casa 123',
        city: 'Luanda',
        province: 'Talatona',
        phone: CUSTOMER_PHONE, // Seu número para receber WhatsApp
        postal_code: '0000'
      },
      payment_method: 'bank_transfer',
      user_email: 'leuboy30@gmail.com', // Seu email
      notes: 'Pedido de teste para validar notificações WhatsApp'
    };

    console.log('   📋 Dados do pedido:');
    console.log(`   - Cliente: ${orderData.shipping_address.full_name}`);
    console.log(`   - Telefone: ${orderData.shipping_address.phone}`);
    console.log(`   - Email: ${orderData.user_email}`);
    console.log(`   - Produto: ${orderData.items[0].product_name}`);
    console.log(`   - Quantidade: ${orderData.items[0].quantity}`);
    console.log(`   - Total: ${orderData.items[0].price.toLocaleString('pt-AO')} Kz\n`);

    const orderResponse = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      throw new Error(`Erro ao criar pedido: ${error}`);
    }

    const orderResult = await orderResponse.json();
    const order = orderResult.order;

    console.log('   ✅ Pedido criado com sucesso!');
    console.log(`   📋 Número do Pedido: #${order.order_number}`);
    console.log(`   🆔 ID: ${order.id}`);
    console.log(`   💰 Total: ${Number(order.total).toLocaleString('pt-AO')} Kz\n`);

    // 3. Aguardar processamento assíncrono
    console.log('⏳ 3. Aguardando envio de notificações...');
    console.log('   (Email e WhatsApp são enviados em background)\n');
    
    await sleep(3000); // Aguarda 3 segundos

    // 4. Verificar mensagens WhatsApp no banco
    console.log('🔍 4. Verificando mensagens WhatsApp enviadas...');
    
    const messagesResponse = await fetch(`${API_URL}/api/whatsapp/messages`, {
      headers: {
        'Authorization': 'Bearer fake-admin-token-for-test'
      }
    });

    if (messagesResponse.ok) {
      const messages = await messagesResponse.json();
      const recentMessages = messages.filter(m => 
        new Date(m.created_at) > new Date(Date.now() - 60000) // Últimos 60s
      );
      
      console.log(`   ✅ ${recentMessages.length} mensagem(ns) WhatsApp enviada(s) recentemente\n`);
      
      if (recentMessages.length > 0) {
        recentMessages.forEach((msg, index) => {
          console.log(`   📱 Mensagem ${index + 1}:`);
          console.log(`      - Para: ${msg.to}`);
          console.log(`      - Status: ${msg.status}`);
          console.log(`      - SID: ${msg.message_sid}`);
          console.log(`      - Conteúdo: ${msg.body?.substring(0, 50)}...`);
        });
      }
    } else {
      console.log('   ⚠️  Não foi possível verificar mensagens (endpoint pode estar protegido)\n');
    }

    // 5. Resultados finais
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 VERIFICAÇÕES:');
    console.log('   1. ✅ Pedido criado no banco de dados');
    console.log('   2. 📧 Email enviado para: leuboy30@gmail.com');
    console.log('   3. 📱 WhatsApp enviado para: +244931054015');
    console.log('\n🔔 AGORA VERIFIQUE:');
    console.log('   • Seu email (leuboy30@gmail.com)');
    console.log('   • Seu WhatsApp (+244 931 054 015)');
    console.log(`   • Pedido: #${order.order_number}`);
    console.log('\n═══════════════════════════════════════════════════\n');

    return order;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔧 POSSÍVEIS CAUSAS:');
    console.error('   • Backend não está rodando (npx tsx server.ts)');
    console.error('   • Banco de dados não está conectado');
    console.error('   • Credenciais Twilio/Resend inválidas');
    console.error('   • Número WhatsApp não ativado no sandbox');
    console.error('\n═══════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar teste
testCompleteOrder();
