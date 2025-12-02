/**
 * Data Migration Component
 * LIMPEZA AGRESSIVA de dados antigos do localStorage
 * Detecta e remove IMEDIATAMENTE qualquer dado com IDs customizados
 */

import { useEffect, useRef } from 'react';

export function DataMigration() {
  // Usar ref para garantir que executa apenas uma vez
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    forceCleanup();
  }, []);

  const forceCleanup = () => {
    // Cleanup process running silently
    let cleanedSomething = false;

    // 1. LIMPAR CARRINHO
    try {
      const cart = localStorage.getItem('kzstore_cart');
      if (cart) {
        const cartData = JSON.parse(cart);
        
        if (Array.isArray(cartData)) {
          // Verificar se tem produtos com IDs antigos
          const hasOldIds = cartData.some((item: any) => {
            const id = item?.product?.id || item?.id;
            return id && typeof id === 'string' && (
              id.startsWith('prod_') || 
              id.startsWith('order_') ||
              id.startsWith('cust_') ||
              !isValidUUID(id)
            );
          });

          if (hasOldIds || cartData.length > 0) {
            localStorage.removeItem('kzstore_cart');
            cleanedSomething = true;
          }
        }
      }
    } catch (e) {
      localStorage.removeItem('kzstore_cart');
      cleanedSomething = true;
    }

    // 2. LIMPAR WISHLIST
    try {
      const wishlist = localStorage.getItem('kzstore_wishlist');
      if (wishlist) {
        const wishlistData = JSON.parse(wishlist);
        
        if (Array.isArray(wishlistData)) {
          const hasOldIds = wishlistData.some((id: any) => 
            typeof id === 'string' && (
              id.startsWith('prod_') ||
              !isValidUUID(id)
            )
          );

          if (hasOldIds) {
            localStorage.removeItem('kzstore_wishlist');
            cleanedSomething = true;
          }
        }
      }
    } catch (e) {
      localStorage.removeItem('kzstore_wishlist');
      cleanedSomething = true;
    }

    // 3. LIMPAR PRODUTO SELECIONADO
    try {
      const selectedProduct = localStorage.getItem('kzstore_selected_product');
      if (selectedProduct) {
        const product = JSON.parse(selectedProduct);
        if (product?.id && !isValidUUID(product.id)) {
          localStorage.removeItem('kzstore_selected_product');
          cleanedSomething = true;
        }
      }
    } catch (e) {
      localStorage.removeItem('kzstore_selected_product');
      cleanedSomething = true;
    }

    // 4. LIMPAR OUTROS DADOS POTENCIALMENTE ANTIGOS
    const keysToCheck = [
      'kzstore_products',
      'kzstore_orders',
      'kzstore_customer',
      'kzstore_user'
    ];

    keysToCheck.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Se é array
          if (Array.isArray(parsed)) {
            const hasOldIds = parsed.some((item: any) => {
              const id = item?.id;
              return id && typeof id === 'string' && (
                id.startsWith('prod_') || 
                id.startsWith('order_') ||
                id.startsWith('cust_') ||
                !isValidUUID(id)
              );
            });

            if (hasOldIds) {
              localStorage.removeItem(key);
              cleanedSomething = true;
            }
          }
          // Se é objeto com id
          else if (parsed?.id && !isValidUUID(parsed.id)) {
            localStorage.removeItem(key);
            cleanedSomething = true;
          }
        }
      } catch (e) {
        // Se não conseguir parsear ou der erro, remove
        localStorage.removeItem(key);
        cleanedSomething = true;
      }
    });

    // Cleanup completed silently
  };

  // Validar se é UUID válido
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Componente não renderiza nada
  return null;
}

/**
 * Hook para limpeza manual
 */
export function useForceClearOldData() {
  const clearOldData = () => {
    console.log('🧹 [MANUAL CLEANUP] Iniciando limpeza manual...');
    
    const keys = [
      'kzstore_cart',
      'kzstore_wishlist',
      'kzstore_selected_product',
      'kzstore_products',
      'kzstore_orders',
      'kzstore_customer',
      'kzstore_user'
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ [MANUAL CLEANUP] ${key} removido`);
    });

    console.log('🎉 [MANUAL CLEANUP] Limpeza manual concluída!');
    alert('Dados limpos com sucesso! A página será recarregada.');
    window.location.reload();
  };

  return { clearOldData };
}
