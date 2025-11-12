/**
 * Sistema de Analytics e Tracking
 * Suporta: Google Analytics 4, Facebook Pixel, eventos personalizados
 */

// Configuração
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || 'YOUR_PIXEL_ID';

// Tipos de eventos
export type AnalyticsEvent = 
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'view_item_list'
  | 'add_to_wishlist'
  | 'apply_coupon'
  | 'sign_up'
  | 'login';

interface EventParams {
  [key: string]: any;
}

// Inicializar Google Analytics 4
export const initGA4 = () => {
  if (typeof window === 'undefined') return;

  // Carregar script do GA4
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Inicializar dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true
  });

  console.log('📊 Google Analytics 4 inicializado');
};

// Inicializar Facebook Pixel
export const initFBPixel = () => {
  if (typeof window === 'undefined') return;

  // Script do Facebook Pixel
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');

  console.log('📘 Facebook Pixel inicializado');
};

// Enviar evento para GA4
export const trackGA4Event = (eventName: AnalyticsEvent, params?: EventParams) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', eventName, params);
    console.log(`📊 GA4 Event: ${eventName}`, params);
  } catch (error) {
    console.error('Erro ao enviar evento GA4:', error);
  }
};

// Enviar evento para Facebook Pixel
export const trackFBEvent = (eventName: string, params?: EventParams) => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', eventName, params);
    console.log(`📘 FB Event: ${eventName}`, params);
  } catch (error) {
    console.error('Erro ao enviar evento FB:', error);
  }
};

// Wrapper unificado para enviar para ambos
export const trackEvent = (eventName: AnalyticsEvent, params?: EventParams) => {
  trackGA4Event(eventName, params);
  
  // Mapear eventos GA4 para FB
  const fbEventMap: Record<string, string> = {
    'view_item': 'ViewContent',
    'add_to_cart': 'AddToCart',
    'begin_checkout': 'InitiateCheckout',
    'purchase': 'Purchase',
    'search': 'Search',
    'add_to_wishlist': 'AddToWishlist',
    'sign_up': 'CompleteRegistration',
    'login': 'Lead'
  };

  const fbEventName = fbEventMap[eventName];
  if (fbEventName) {
    trackFBEvent(fbEventName, params);
  }
};

// Funções específicas para eventos comuns
export const analytics = {
  // Visualizar produto
  viewItem: (product: any) => {
    trackEvent('view_item', {
      currency: 'AOA',
      value: product.preco_aoa,
      items: [{
        item_id: product.id,
        item_name: product.nome,
        item_category: product.categoria,
        price: product.preco_aoa
      }]
    });
  },

  // Adicionar ao carrinho
  addToCart: (product: any, quantity: number = 1) => {
    trackEvent('add_to_cart', {
      currency: 'AOA',
      value: product.preco_aoa * quantity,
      items: [{
        item_id: product.id,
        item_name: product.nome,
        item_category: product.categoria,
        price: product.preco_aoa,
        quantity: quantity
      }]
    });
  },

  // Remover do carrinho
  removeFromCart: (product: any) => {
    trackEvent('remove_from_cart', {
      currency: 'AOA',
      value: product.preco_aoa,
      items: [{
        item_id: product.id,
        item_name: product.nome
      }]
    });
  },

  // Iniciar checkout
  beginCheckout: (cart: any[], total: number) => {
    trackEvent('begin_checkout', {
      currency: 'AOA',
      value: total,
      items: cart.map(item => ({
        item_id: item.product.id,
        item_name: item.product.nome,
        item_category: item.product.categoria,
        price: item.product.preco_aoa,
        quantity: item.quantity
      }))
    });
  },

  // Compra concluída
  purchase: (orderId: string, cart: any[], total: number, couponCode?: string) => {
    trackEvent('purchase', {
      transaction_id: orderId,
      currency: 'AOA',
      value: total,
      coupon: couponCode,
      items: cart.map(item => ({
        item_id: item.product.id,
        item_name: item.product.nome,
        item_category: item.product.categoria,
        price: item.product.preco_aoa,
        quantity: item.quantity
      }))
    });
  },

  // Busca
  search: (query: string) => {
    trackEvent('search', {
      search_term: query
    });
  },

  // Aplicar cupom
  applyCoupon: (couponCode: string, discount: number) => {
    trackEvent('apply_coupon', {
      coupon_code: couponCode,
      discount_amount: discount
    });
  },

  // Pageview
  pageView: (path: string) => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path
      });
    }
  }
};

// Tipos globais para TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

// Inicializar tudo
export const initAnalytics = () => {
  initGA4();
  initFBPixel();
};
