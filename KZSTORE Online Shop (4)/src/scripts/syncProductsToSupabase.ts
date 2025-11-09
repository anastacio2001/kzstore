import { supabase } from '../supabase/client';
import { products } from '../data/products';

/**
 * Script para sincronizar produtos locais com Supabase
 * Execute este script apenas uma vez para popular o banco de dados
 */
export async function syncProductsToSupabase() {
  console.log('🔄 Iniciando sincronização de produtos...');
  console.log(`📦 Total de produtos locais: ${products.length}`);

  try {
    // 1. Verificar produtos existentes no Supabase
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('id');

    if (fetchError) {
      console.error('❌ Erro ao buscar produtos existentes:', fetchError);
      return;
    }

    console.log(`📊 Produtos já no Supabase: ${existingProducts?.length || 0}`);

    // 2. Se já existem produtos, perguntar se quer substituir
    if (existingProducts && existingProducts.length > 0) {
      console.warn('⚠️ Atenção: Já existem produtos no Supabase!');
      console.log('Para substituir, execute: DELETE FROM products no Supabase SQL Editor');
      
      // Opção: Apenas adicionar novos produtos
      const existingIds = existingProducts.map(p => p.id);
      const newProducts = products.filter(p => !existingIds.includes(p.id));
      
      if (newProducts.length > 0) {
        console.log(`➕ Adicionando ${newProducts.length} novos produtos...`);
        const { error: insertError } = await supabase
          .from('products')
          .insert(newProducts);

        if (insertError) {
          console.error('❌ Erro ao inserir novos produtos:', insertError);
        } else {
          console.log('✅ Novos produtos adicionados com sucesso!');
        }
      } else {
        console.log('ℹ️ Nenhum produto novo para adicionar');
      }
    } else {
      // 3. Inserir todos os produtos
      console.log('📤 Inserindo todos os produtos...');
      
      // Inserir em lotes de 100 (limite do Supabase)
      const batchSize = 100;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('products')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Erro no lote ${i / batchSize + 1}:`, insertError);
        } else {
          console.log(`✅ Lote ${i / batchSize + 1} inserido (${batch.length} produtos)`);
        }
      }

      console.log('🎉 Sincronização concluída!');
    }

    // 4. Verificar resultado final
    const { data: finalProducts, error: finalError } = await supabase
      .from('products')
      .select('id');

    if (!finalError) {
      console.log(`✅ Total final no Supabase: ${finalProducts?.length || 0} produtos`);
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Para executar no console do navegador:
// import { syncProductsToSupabase } from './scripts/syncProductsToSupabase';
// syncProductsToSupabase();
