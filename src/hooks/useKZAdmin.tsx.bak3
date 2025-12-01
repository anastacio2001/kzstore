/**
 * Hook agregador para todas as funcionalidades admin da KZSTORE
 * Centraliza todos os hooks para facilitar o uso
 */

import { useProducts } from './useProducts';
import { useOrders } from './useOrders';
import { useAds } from './useAds';
import { useTeam } from './useTeam';
import { useReviews } from './useReviews';
import { useCoupons } from './useCoupons';
import { useFlashSales } from './useFlashSales';
import { usePreOrders } from './usePreOrders';
import { useTradeIn } from './useTradeIn';
import { useQuotes } from './useQuotes';
import { useB2B } from './useB2B';
import { useAffiliates } from './useAffiliates';
import { useTickets } from './useTickets';
import { useAnalytics } from './useAnalytics';

/**
 * Hook principal para administração da KZSTORE
 * Expõe todas as funcionalidades admin em um único lugar
 */
export function useKZAdmin() {
  const products = useProducts();
  const orders = useOrders();
  const ads = useAds();
  const team = useTeam();
  const reviews = useReviews();
  const coupons = useCoupons();
  const flashSales = useFlashSales();
  const preOrders = usePreOrders();
  const tradeIn = useTradeIn();
  const quotes = useQuotes();
  const b2b = useB2B();
  const affiliates = useAffiliates();
  const tickets = useTickets();
  const analytics = useAnalytics();

  return {
    // Products
    products: {
      ...products,
      list: products.products,
      fetch: products.fetchProducts,
      create: products.createProduct,
      update: products.updateProduct,
      delete: products.deleteProduct,
      getById: products.getProductById,
      getLowStock: products.getLowStockProducts,
      updateStock: products.updateStock,
    },

    // Orders
    orders: {
      ...orders,
      list: orders.orders,
      fetch: orders.fetchOrders,
      create: orders.createOrder,
      updateStatus: orders.updateOrderStatus,
      getById: orders.getOrderById,
      getByCustomer: orders.getOrdersByCustomer,
      getByStatus: orders.getOrdersByStatus,
    },

    // Ads
    ads: {
      ...ads,
      list: ads.ads,
      fetch: ads.fetchAds,
      create: ads.createAd,
      update: ads.updateAd,
      delete: ads.deleteAd,
      trackImpression: ads.trackImpression,
      trackClick: ads.trackClick,
      getStats: ads.getStats,
    },

    // Team
    team: {
      ...team,
      list: team.members,
      fetch: team.fetchMembers,
      create: team.createMember,
      update: team.updateMember,
      delete: team.deleteMember,
      getStats: team.getStats,
    },

    // Reviews
    reviews: {
      ...reviews,
      list: reviews.reviews,
      fetch: reviews.fetchReviews,
      create: reviews.createReview,
      updateStatus: reviews.updateReviewStatus,
      delete: reviews.deleteReview,
      getByProduct: reviews.getReviewsByProduct,
    },

    // Coupons
    coupons: {
      ...coupons,
      list: coupons.coupons,
      fetch: coupons.fetchCoupons,
      create: coupons.createCoupon,
      update: coupons.updateCoupon,
      delete: coupons.deleteCoupon,
      validate: coupons.validateCoupon,
      use: coupons.useCoupon,
    },

    // Flash Sales
    flashSales: {
      ...flashSales,
      list: flashSales.flashSales,
      fetch: flashSales.fetchFlashSales,
      create: flashSales.createFlashSale,
      update: flashSales.updateFlashSale,
      delete: flashSales.deleteFlashSale,
      getActive: flashSales.getActiveFlashSales,
      recordSale: flashSales.recordSale,
    },

    // Pre Orders
    preOrders: {
      ...preOrders,
      list: preOrders.preOrders,
      fetch: preOrders.fetchPreOrders,
      create: preOrders.createPreOrder,
      updateStatus: preOrders.updatePreOrderStatus,
      updatePayment: preOrders.updatePayment,
      getByUser: preOrders.getPreOrdersByUser,
    },

    // Trade-In
    tradeIn: {
      ...tradeIn,
      list: tradeIn.tradeIns,
      fetch: tradeIn.fetchTradeIns,
      create: tradeIn.createTradeIn,
      evaluate: tradeIn.evaluateTradeIn,
      updateStatus: tradeIn.updateTradeInStatus,
      getByUser: tradeIn.getTradeInsByUser,
    },

    // Quotes
    quotes: {
      ...quotes,
      list: quotes.quotes,
      fetch: quotes.fetchQuotes,
      create: quotes.createQuote,
      respond: quotes.respondToQuote,
      updateStatus: quotes.updateQuoteStatus,
      getByUser: quotes.getQuotesByUser,
    },

    // B2B
    b2b: {
      ...b2b,
      list: b2b.accounts,
      fetch: b2b.fetchAccounts,
      create: b2b.createAccount,
      update: b2b.updateAccount,
    },

    // Affiliates
    affiliates: {
      ...affiliates,
      list: affiliates.affiliates,
      fetch: affiliates.fetchAffiliates,
      create: affiliates.createAffiliate,
      recordSale: affiliates.recordSale,
      payCommission: affiliates.payCommission,
    },

    // Tickets
    tickets: {
      ...tickets,
      list: tickets.tickets,
      fetch: tickets.fetchTickets,
      create: tickets.createTicket,
      addResponse: tickets.addResponse,
      updateStatus: tickets.updateTicketStatus,
      getByUser: tickets.getTicketsByUser,
    },

    // Analytics
    analytics: {
      ...analytics,
      events: analytics.events,
      track: analytics.trackEvent,
      fetchEvents: analytics.fetchEvents,
      getSummary: analytics.getSummary,
      getByName: analytics.getEventsByName,
      getByUser: analytics.getEventsByUser,
    },

    // Loading states
    loading: 
      products.loading ||
      orders.loading ||
      ads.loading ||
      team.loading ||
      reviews.loading ||
      coupons.loading ||
      flashSales.loading ||
      preOrders.loading ||
      tradeIn.loading ||
      quotes.loading ||
      b2b.loading ||
      affiliates.loading ||
      tickets.loading ||
      analytics.loading,

    // Error states
    error:
      products.error ||
      orders.error ||
      ads.error ||
      team.error ||
      reviews.error ||
      coupons.error ||
      flashSales.error ||
      preOrders.error ||
      tradeIn.error ||
      quotes.error ||
      b2b.error ||
      affiliates.error ||
      tickets.error ||
      analytics.error,
  };
}
