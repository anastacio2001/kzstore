// Analytics Tracking Utility for KZSTORE
import { projectId, publicAnonKey } from './supabase/info';

let sessionId: string | null = null;

// Get or create session ID
function getSessionId(): string {
  if (sessionId) return sessionId;
  
  sessionId = sessionStorage.getItem('kz_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('kz_session_id', sessionId);
  }
  
  return sessionId;
}

// Track event
export async function trackEvent(
  eventType: string,
  data?: any,
  userId?: string
): Promise<void> {
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/analytics/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          user_id: userId || 'anonymous',
          session_id: getSessionId(),
          data: data || {},
        }),
      }
    );
  } catch (error) {
    // Silently fail to not disrupt user experience
    console.debug('Analytics tracking failed:', error);
  }
}

// Convenience functions for common events
export const analytics = {
  pageView: (page: string, data?: any) => 
    trackEvent('page_view', { page, ...data }),
  
  productView: (productId: string, productName: string, price: number, data?: any) => 
    trackEvent('product_view', { product_id: productId, product_name: productName, price, ...data }),
  
  addToCart: (productId: string, productName: string, quantity: number, price: number) => 
    trackEvent('add_to_cart', { product_id: productId, product_name: productName, quantity, price }),
  
  removeFromCart: (productId: string, productName: string) => 
    trackEvent('remove_from_cart', { product_id: productId, product_name: productName }),
  
  checkoutStart: (cartTotal: number, itemCount: number) => 
    trackEvent('checkout_start', { cart_total: cartTotal, item_count: itemCount }),
  
  purchase: (orderId: string, total: number, items: any[]) => 
    trackEvent('purchase', { order_id: orderId, total, items }),
  
  search: (query: string, resultsCount: number) => 
    trackEvent('search', { query, results_count: resultsCount }),
  
  filterApplied: (filterType: string, filterValue: string) => 
    trackEvent('filter_applied', { filter_type: filterType, filter_value: filterValue }),
};
