/**
 * TESTE DE CONEXÃO SUPABASE - KZSTORE
 * 
 * Execute este script para testar a conexão e verificar se o RLS foi desabilitado corretamente
 */

import { getSupabaseClient } from './utils/supabase/client';

async function testarConexaoSupabase() {
  console.log('🔍 INICIANDO TESTE DE CONEXÃO SUPABASE...\n');

  const supabase = getSupabaseClient();

  // Teste 1: Verificar conexão
  console.log('📡 Teste 1: Verificando conexão com Supabase...');
  try {
    const { data, error } = await supabase.from('products').select('count');
    if (error) {
      console.error('❌ ERRO na conexão:', error.message);
      console.error('Detalhes:', error);
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO:', err);
  }

  // Teste 2: Buscar produtos
  console.log('\n📦 Teste 2: Buscando produtos...');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ ERRO ao buscar produtos:', error.message);
      console.error('Código do erro:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('\n🚨 PROBLEMA: RLS ainda está ativo!');
        console.error('👉 SOLUÇÃO: Execute o arquivo QUICK_FIX_RLS.sql no Supabase SQL Editor');
      }
    } else {
      console.log(`✅ Produtos encontrados: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log('📋 Primeiro produto:', products[0].nome || products[0].name);
      }
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO ao buscar produtos:', err);
  }

  // Teste 3: Buscar pedidos
  console.log('\n📋 Teste 3: Buscando pedidos...');
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ ERRO ao buscar pedidos:', error.message);
      console.error('Código do erro:', error.code);
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('\n🚨 PROBLEMA: RLS ainda está ativo na tabela orders!');
        console.error('👉 SOLUÇÃO: Execute o arquivo QUICK_FIX_RLS.sql no Supabase SQL Editor');
      }
    } else {
      console.log(`✅ Pedidos encontrados: ${orders?.length || 0}`);
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO ao buscar pedidos:', err);
  }

  // Teste 4: Buscar categorias
  console.log('\n📂 Teste 4: Buscando categorias...');
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ ERRO ao buscar categorias:', error.message);
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('\n🚨 PROBLEMA: RLS ainda está ativo na tabela categories!');
        console.error('👉 SOLUÇÃO: Execute o arquivo QUICK_FIX_RLS.sql no Supabase SQL Editor');
      }
    } else {
      console.log(`✅ Categorias encontradas: ${categories?.length || 0}`);
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO ao buscar categorias:', err);
  }

  // Teste 5: Buscar cupons
  console.log('\n🎫 Teste 5: Buscando cupons...');
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ ERRO ao buscar cupons:', error.message);
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.error('\n🚨 PROBLEMA: RLS ainda está ativo na tabela coupons!');
        console.error('👉 SOLUÇÃO: Execute o arquivo QUICK_FIX_RLS.sql no Supabase SQL Editor');
      }
    } else {
      console.log(`✅ Cupons encontrados: ${coupons?.length || 0}`);
    }
  } catch (err) {
    console.error('❌ ERRO CRÍTICO ao buscar cupons:', err);
  }

  // Resumo Final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DO TESTE');
  console.log('='.repeat(60));
  console.log('\n✅ Se todos os testes passaram: RLS foi desabilitado com sucesso!');
  console.log('❌ Se algum teste falhou: Execute QUICK_FIX_RLS.sql no Supabase\n');
  console.log('📍 Localização do SQL: /QUICK_FIX_RLS.sql');
  console.log('📍 Instruções detalhadas: /DESABILITAR_RLS_AGORA.md\n');
}

// Executar teste
if (typeof window !== 'undefined') {
  console.log('🚀 Para testar, execute no console do navegador:');
  console.log('testarConexaoSupabase()');
}

export { testarConexaoSupabase };
