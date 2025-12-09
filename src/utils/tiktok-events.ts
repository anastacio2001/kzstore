/**
 * TikTok Pixel Events Integration
 * 
 * Pixel ID: D4QLH33C77U0596TKJ7G
 * Access Token: 355aa33cfc9cef01260dcf6f07cb8a1bccb81808
 * 
 * Este arquivo contém funções para rastrear eventos do TikTok Pixel
 * conforme a documentação oficial da API de Eventos do TikTok.
 */

// Declara o objeto ttq global do TikTok
declare global {
  interface Window {
    ttq?: {
      track: (eventName: string, eventData?: any) => void;
      page: () => void;
      identify: (data: any) => void;
    };
  }
}

interface TikTokEventData {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  price?: number;
  description?: string;
  query?: string;
}

/**
 * Utilitário para enviar eventos ao TikTok Pixel
 */
class TikTokEvents {
  private pixelId = 'D4QLH33C77U0596TKJ7G';
  
  /**
   * Verifica se o TikTok Pixel está carregado
   */
  private isLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.ttq !== 'undefined';
  }

  /**
   * Envia evento genérico ao TikTok
   */
  private track(eventName: string, data?: TikTokEventData) {
    if (!this.isLoaded()) {
      console.warn('[TikTok Pixel] Pixel não carregado ainda');
      return;
    }

    try {
      const eventData = {
        ...data,
        currency: data?.currency || 'AOA',
      };

      window.ttq?.track(eventName, eventData);
      console.log(`✅ [TikTok Pixel] Evento enviado: ${eventName}`, eventData);
    } catch (error) {
      console.error(`❌ [TikTok Pixel] Erro ao enviar evento ${eventName}:`, error);
    }
  }

  /**
   * ViewContent - Visualização de produto
   * Rastreia quando um usuário visualiza uma página de produto
   */
  viewContent(product: {
    id: string;
    nome: string;
    preco_aoa: number;
    categoria?: string;
    descricao?: string;
  }) {
    this.track('ViewContent', {
      content_id: product.id,
      content_type: 'product',
      content_name: product.nome,
      content_category: product.categoria,
      value: product.preco_aoa,
      currency: 'AOA',
      description: product.descricao,
    });
  }

  /**
   * AddToCart - Adicionar ao carrinho
   * Rastreia quando um usuário adiciona um produto ao carrinho
   */
  addToCart(product: {
    id: string;
    nome: string;
    preco_aoa: number;
    categoria?: string;
  }, quantity: number = 1) {
    this.track('AddToCart', {
      content_id: product.id,
      content_type: 'product',
      content_name: product.nome,
      content_category: product.categoria,
      value: product.preco_aoa * quantity,
      currency: 'AOA',
      quantity: quantity,
      price: product.preco_aoa,
    });
  }

  /**
   * AddToWishlist - Adicionar à lista de desejos
   * Rastreia quando um usuário adiciona um produto à wishlist
   */
  addToWishlist(product: {
    id: string;
    nome: string;
    preco_aoa: number;
  }) {
    this.track('AddToWishlist', {
      content_id: product.id,
      content_type: 'product',
      content_name: product.nome,
      value: product.preco_aoa,
      currency: 'AOA',
    });
  }

  /**
   * Search - Busca de produtos
   * Rastreia quando um usuário faz uma busca
   */
  search(query: string, results?: number) {
    this.track('Search', {
      query: query,
      content_type: 'product',
      description: `Busca por: ${query}`,
    });
  }

  /**
   * InitiateCheckout - Iniciar checkout
   * Rastreia quando um usuário inicia o processo de checkout
   */
  initiateCheckout(cart: Array<{
    product: { id: string; nome: string; preco_aoa: number };
    quantity: number;
  }>) {
    const totalValue = cart.reduce((sum, item) => 
      sum + (item.product.preco_aoa * item.quantity), 0
    );

    const contentIds = cart.map(item => item.product.id).join(',');
    const contentNames = cart.map(item => item.product.nome).join(', ');

    this.track('InitiateCheckout', {
      content_id: contentIds,
      content_type: 'product',
      content_name: contentNames,
      value: totalValue,
      currency: 'AOA',
      quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
    });
  }

  /**
   * AddPaymentInfo - Adicionar informações de pagamento
   * Rastreia quando um usuário adiciona informações de pagamento
   */
  addPaymentInfo(totalValue: number, paymentMethod: string) {
    this.track('AddPaymentInfo', {
      content_type: 'product',
      value: totalValue,
      currency: 'AOA',
      description: `Método: ${paymentMethod}`,
    });
  }

  /**
   * PlaceAnOrder - Fazer pedido
   * Rastreia quando um pedido é criado (antes do pagamento)
   */
  placeAnOrder(orderId: string, totalValue: number, items: Array<{
    product: { id: string; nome: string };
    quantity: number;
  }>) {
    const contentIds = items.map(item => item.product.id).join(',');
    const contentNames = items.map(item => item.product.nome).join(', ');

    this.track('PlaceAnOrder', {
      content_id: contentIds,
      content_type: 'product',
      content_name: contentNames,
      value: totalValue,
      currency: 'AOA',
      description: `Pedido #${orderId}`,
    });
  }

  /**
   * CompletePayment (Purchase) - Completar pagamento
   * Rastreia quando uma compra é concluída
   */
  completePurchase(orderId: string, totalValue: number, items: Array<{
    product: { id: string; nome: string };
    quantity: number;
  }>) {
    const contentIds = items.map(item => item.product.id).join(',');
    const contentNames = items.map(item => item.product.nome).join(', ');

    this.track('CompletePayment', {
      content_id: contentIds,
      content_type: 'product',
      content_name: contentNames,
      value: totalValue,
      currency: 'AOA',
      description: `Pedido #${orderId} concluído`,
    });
  }

  /**
   * CompleteRegistration - Registro completo
   * Rastreia quando um usuário completa o registro
   */
  completeRegistration(userId: string, email: string) {
    this.track('CompleteRegistration', {
      content_type: 'account',
      description: `Novo usuário: ${email}`,
    });
  }
}

// Exporta instância única (singleton)
export const tiktokEvents = new TikTokEvents();
