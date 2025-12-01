const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarPedidoTeste() {
  try {
    const userId = 'c7d1d8e1-da23-4c7f-8762-8fc4d90ed515'; // Pedro Salu
    
    const pedido = await prisma.order.create({
      data: {
        order_number: `KZ${Date.now()}`,
        user_id: userId,
        user_name: 'Pedro Salu',
        user_email: 'pedrosalu@gmail.com',
        items: JSON.stringify([
          {
            product_id: '1',
            product_name: 'Produto Teste',
            quantity: 1,
            price: 25000,
            subtotal: 25000
          }
        ]),
        subtotal: 25000,
        shipping_cost: 2000,
        tax_amount: 0,
        discount_amount: 0,
        total: 27000,
        payment_method: 'multicaixa',
        payment_status: 'pending',
        status: 'pending',
        shipping_address: JSON.stringify({
          nome: 'Pedro Salu',
          telefone: '+244900000000',
          provincia: 'Luanda',
          municipio: 'Luanda',
          bairro: 'Maianga',
          rua: 'Rua Teste',
          referencia: 'Perto do mercado'
        })
      }
    });
    
    console.log('✅ Pedido criado:', pedido.id, pedido.order_number);
    console.log('👤 user_id:', pedido.user_id);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

criarPedidoTeste();
