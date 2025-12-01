/**
 * Script para verificar dados no Supabase
 * Execute no console do navegador para ver produtos e pedidos
 */

import { getSupabaseClient } from './supabase/client';

const supabase = getSupabaseClient();

/**
 * Verificar produtos na tabela Supabase
 */
export async function verificarProdutos() {
  console.log('\n📦 ========== PRODUTOS NO SUPABASE ==========\n');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return;
  }

  console.log(`✅ Total de produtos: ${data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    console.table(data.map(p => ({
      id: p.id,
      nome: p.nome,
      preco_aoa: p.preco_aoa,
      estoque: p.estoque,
      categoria: p.categoria,
      ativo: p.ativo
    })));
  } else {
    console.log('⚠️ Nenhum produto encontrado na tabela products');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Importar produtos do KV Store');
    console.log('2. Ou criar produtos manualmente');
  }
  
  return data;
}

/**
 * Verificar pedidos na tabela Supabase
 */
export async function verificarPedidos() {
  console.log('\n📋 ========== PEDIDOS NO SUPABASE ==========\n');
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    return;
  }

  console.log(`✅ Total de pedidos: ${data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    console.table(data.map(o => ({
      id: o.id?.substring(0, 8),
      order_number: o.order_number,
      user_email: o.user_email,
      total: `${o.total} AOA`,
      status: o.status,
      payment_method: o.payment_method,
      created_at: new Date(o.created_at).toLocaleString('pt-AO')
    })));
    
    console.log('\n📝 DETALHES DO PRIMEIRO PEDIDO:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('⚠️ Nenhum pedido encontrado na tabela orders');
  }
  
  return data;
}

/**
 * Verificar pedido específico por número
 */
export async function verificarPedidoPorNumero(orderNumber: string) {
  console.log(`\n🔍 ========== BUSCANDO PEDIDO ${orderNumber} ==========\n`);
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    return;
  }

  if (data) {
    console.log('✅ Pedido encontrado!\n');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ Pedido ${orderNumber} não encontrado`);
  }
  
  return data;
}

/**
 * Verificar categorias
 */
export async function verificarCategorias() {
  console.log('\n🏷️ ========== CATEGORIAS NO SUPABASE ==========\n');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return;
  }

  console.log(`✅ Total de categorias: ${data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    console.table(data);
  }
  
  return data;
}

/**
 * Verificar cupons
 */
export async function verificarCupons() {
  console.log('\n🎫 ========== CUPONS NO SUPABASE ==========\n');
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*');

  if (error) {
    console.error('❌ Erro ao buscar cupons:', error);
    return;
  }

  console.log(`✅ Total de cupons: ${data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    console.table(data);
  }
  
  return data;
}

/**
 * Executar todas as verificações
 */
export async function verificarTudo() {
  console.clear();
  console.log('🚀 ========================================');
  console.log('🚀   VERIFICAÇÃO COMPLETA - KZSTORE');
  console.log('🚀 ========================================');
  
  await verificarProdutos();
  await verificarPedidos();
  await verificarCategorias();
  await verificarCupons();
  
  console.log('\n✅ ========================================');
  console.log('✅   VERIFICAÇÃO CONCLUÍDA!');
  console.log('✅ ========================================\n');
}

// Exportar para uso no console
if (typeof window !== 'undefined') {
  (window as any).verificarSupabase = {
    produtos: verificarProdutos,
    pedidos: verificarPedidos,
    pedidoPorNumero: verificarPedidoPorNumero,
    categorias: verificarCategorias,
    cupons: verificarCupons,
    tudo: verificarTudo
  };
  
  console.log('✅ Utilitários de verificação carregados!');
  console.log('💡 Use no console:');
  console.log('   - verificarSupabase.tudo()');
  console.log('   - verificarSupabase.produtos()');
  console.log('   - verificarSupabase.pedidos()');
  console.log('   - verificarSupabase.pedidoPorNumero("KZ-MI7RZLUL-INE")');
}
