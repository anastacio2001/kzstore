import fetch from 'node-fetch';

const API_URL = 'http://localhost:8080';

// Dados de login (usuário de teste)
const loginData = {
  email: "teste.pedido@kzstore.ao",
  password: "Test123!"
};

// Dados do pedido de teste
const testOrder = {
  order_number: `TEST-${Date.now()}`,
  user_name: "António Silva",
  user_email: "antonio.silva@test.com",
  items: [
    {
      product_id: "1",
      product_name: "iPhone 13 Pro",
      quantity: 2,
      price: 15000,
      subtotal: 30000
    }
  ],
  subtotal: 30000,
  shipping_cost: 2000,
  total: 32000,
  payment_method: "transferencia_bancaria",
  payment_status: "pending",
  shipping_address: {
    full_name: "António Silva",
    phone: "+244931054015",
    address: "Rua da Maianga",
    city: "Luanda",
    province: "Luanda"
  },
  status: "pending",
  notes: "Pedido de teste para WhatsApp"
};

async function fazerLogin() {
  console.log('🔐 Fazendo login...');
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erro no login: ${JSON.stringify(data)}`);
  }
  
  console.log('✅ Login realizado com sucesso\n');
  return data.token;
}

async function criarPedidoTeste() {
  try {
    // Primeiro fazer login
    const token = await fazerLogin();
    
    console.log('📦 Criando pedido de teste...\n');
    console.log('Dados do pedido:', JSON.stringify(testOrder, null, 2));
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testOrder)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erro ao criar pedido:', data);
      return;
    }

    console.log('\n✅ Pedido criado com sucesso!');
    console.log('📋 ID do pedido:', data.id);
    console.log('📱 WhatsApp deve ser enviado para:', testOrder.customerInfo.phone);
    console.log('\nDetalhes do pedido:', JSON.stringify(data, null, 2));

    // Aguardar um pouco para verificar logs
    console.log('\n⏳ Aguardando envio do WhatsApp...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n✅ Verifique os logs do servidor para confirmar o envio do WhatsApp');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar o teste
criarPedidoTeste();
