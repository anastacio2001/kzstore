import { checkLowStockAlerts, calculateDailyMetrics } from './backend/cron-jobs';

(async () => {
  try {
    console.log('🧪 Testando cron jobs...\n');

    // Test 1: Low Stock Alerts
    console.log('📦 Teste 1: Low Stock Alerts');
    const stockResult = await checkLowStockAlerts();
    console.log('✅ Resultado:', JSON.stringify(stockResult, null, 2));

    console.log('\n---\n');

    // Test 2: Daily Metrics
    console.log('📊 Teste 2: Daily Metrics');
    const metricsResult = await calculateDailyMetrics();
    console.log('✅ Resultado:', JSON.stringify(metricsResult, null, 2));

    console.log('\n✅ Todos os testes concluídos!');
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
})();
