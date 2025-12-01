import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Play, Package } from 'lucide-react';
import { Button } from './components/ui/button';
import { useProducts } from './hooks/useProducts';
import { useOrders } from './hooks/useOrders';
import { useAds } from './hooks/useAds';
import { useTeam } from './hooks/useTeam';
import { useReviews } from './hooks/useReviews';
import { useCoupons } from './hooks/useCoupons';
import { useFlashSales } from './hooks/useFlashSales';
import { usePreOrders } from './hooks/usePreOrders';
import { useTradeIn } from './hooks/useTradeIn';
import { useQuotes } from './hooks/useQuotes';
import { useB2B } from './hooks/useB2B';
import { useAffiliates } from './hooks/useAffiliates';
import { useTickets } from './hooks/useTickets';
import { useAnalytics } from './hooks/useAnalytics';

type TestResult = {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  time?: number;
};

/**
 * TESTE DE INTEGRAÇÃO COMPLETO - KZSTORE
 * 
 * Este componente testa TODOS os 14 hooks criados na migração.
 * 
 * USO:
 * 1. Importe este componente no App.tsx temporariamente
 * 2. Adicione uma rota /test ou renderize condicionalmente
 * 3. Clique em "Executar Todos os Testes"
 * 4. Verifique os resultados
 * 5. Remova após validação
 */
export default function TestIntegration() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: '1. useProducts - Buscar produtos', status: 'pending' },
    { name: '2. useOrders - Buscar pedidos', status: 'pending' },
    { name: '3. useAds - Buscar anúncios', status: 'pending' },
    { name: '4. useTeam - Buscar equipe', status: 'pending' },
    { name: '5. useReviews - Buscar avaliações', status: 'pending' },
    { name: '6. useCoupons - Buscar cupons', status: 'pending' },
    { name: '7. useFlashSales - Buscar promoções', status: 'pending' },
    { name: '8. usePreOrders - Buscar pré-vendas', status: 'pending' },
    { name: '9. useTradeIn - Buscar trade-ins', status: 'pending' },
    { name: '10. useQuotes - Buscar orçamentos', status: 'pending' },
    { name: '11. useB2B - Buscar contas B2B', status: 'pending' },
    { name: '12. useAffiliates - Buscar afiliados', status: 'pending' },
    { name: '13. useTickets - Buscar tickets', status: 'pending' },
    { name: '14. useAnalytics - Buscar analytics', status: 'pending' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ success: 0, error: 0, total: 14 });

  // Hooks
  const productsHook = useProducts();
  const ordersHook = useOrders();
  const adsHook = useAds();
  const teamHook = useTeam();
  const reviewsHook = useReviews();
  const couponsHook = useCoupons();
  const flashSalesHook = useFlashSales();
  const preOrdersHook = usePreOrders();
  const tradeInHook = useTradeIn();
  const quotesHook = useQuotes();
  const b2bHook = useB2B();
  const affiliatesHook = useAffiliates();
  const ticketsHook = useTickets();
  const analyticsHook = useAnalytics();

  const updateTest = (index: number, status: 'running' | 'success' | 'error', message?: string, time?: number) => {
    setTests(prev => {
      const newTests = [...prev];
      newTests[index] = { ...newTests[index], status, message, time };
      return newTests;
    });
  };

  const runTest = async (
    index: number,
    testFn: () => Promise<any>,
    successCheck: (result: any) => boolean
  ) => {
    const startTime = performance.now();
    updateTest(index, 'running');
    
    try {
      const result = await testFn();
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      
      if (successCheck(result)) {
        updateTest(index, 'success', '✓ Sucesso', time);
        return true;
      } else {
        updateTest(index, 'error', '✗ Falhou na validação', time);
        return false;
      }
    } catch (error) {
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      updateTest(index, 'error', `✗ Erro: ${String(error)}`, time);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    let successCount = 0;
    let errorCount = 0;

    // Teste 1: Products
    if (await runTest(0, 
      () => productsHook.fetchProducts(), 
      () => !productsHook.loading && productsHook.products !== null
    )) successCount++; else errorCount++;

    // Teste 2: Orders
    if (await runTest(1, 
      () => ordersHook.fetchOrders(), 
      () => !ordersHook.loading && ordersHook.orders !== null
    )) successCount++; else errorCount++;

    // Teste 3: Ads
    if (await runTest(2, 
      () => adsHook.fetchAds(), 
      () => !adsHook.loading && adsHook.ads !== null
    )) successCount++; else errorCount++;

    // Teste 4: Team
    if (await runTest(3, 
      () => teamHook.fetchTeamMembers(), 
      () => !teamHook.loading && teamHook.teamMembers !== null
    )) successCount++; else errorCount++;

    // Teste 5: Reviews
    if (await runTest(4, 
      () => reviewsHook.fetchReviews(), 
      () => !reviewsHook.loading && reviewsHook.reviews !== null
    )) successCount++; else errorCount++;

    // Teste 6: Coupons
    if (await runTest(5, 
      () => couponsHook.fetchCoupons(), 
      () => !couponsHook.loading && couponsHook.coupons !== null
    )) successCount++; else errorCount++;

    // Teste 7: Flash Sales
    if (await runTest(6, 
      () => flashSalesHook.fetchFlashSales(), 
      () => !flashSalesHook.loading && flashSalesHook.flashSales !== null
    )) successCount++; else errorCount++;

    // Teste 8: Pre Orders
    if (await runTest(7, 
      () => preOrdersHook.fetchPreOrders(), 
      () => !preOrdersHook.loading && preOrdersHook.preOrders !== null
    )) successCount++; else errorCount++;

    // Teste 9: Trade In
    if (await runTest(8, 
      () => tradeInHook.fetchTradeIns(), 
      () => !tradeInHook.loading && tradeInHook.tradeIns !== null
    )) successCount++; else errorCount++;

    // Teste 10: Quotes
    if (await runTest(9, 
      () => quotesHook.fetchQuotes(), 
      () => !quotesHook.loading && quotesHook.quotes !== null
    )) successCount++; else errorCount++;

    // Teste 11: B2B
    if (await runTest(10, 
      () => b2bHook.fetchAccounts(), 
      () => !b2bHook.loading && b2bHook.accounts !== null
    )) successCount++; else errorCount++;

    // Teste 12: Affiliates
    if (await runTest(11, 
      () => affiliatesHook.fetchAffiliates(), 
      () => !affiliatesHook.loading && affiliatesHook.affiliates !== null
    )) successCount++; else errorCount++;

    // Teste 13: Tickets
    if (await runTest(12, 
      () => ticketsHook.fetchTickets(), 
      () => !ticketsHook.loading && ticketsHook.tickets !== null
    )) successCount++; else errorCount++;

    // Teste 14: Analytics
    if (await runTest(13, 
      () => analyticsHook.trackEvent({ event_type: 'test', metadata: {} }), 
      () => true // Analytics sempre retorna sucesso se não der erro
    )) successCount++; else errorCount++;

    setSummary({ success: successCount, error: errorCount, total: 14 });
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'error':
        return <XCircle className="size-5 text-red-600" />;
      case 'running':
        return <div className="size-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="size-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const successRate = summary.total > 0 ? (summary.success / summary.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="size-16 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#FDD835] flex items-center justify-center">
              <Package className="size-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Teste de Integração KZSTORE
              </h1>
              <p className="text-gray-600">
                Validação completa de todos os 14 hooks do SDK Supabase
              </p>
            </div>
          </div>

          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-[#E31E24] to-[#C41E1E] hover:from-[#C41E1E] hover:to-[#A01818] text-white py-4 text-lg"
          >
            {isRunning ? (
              <>
                <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Executando Testes...
              </>
            ) : (
              <>
                <Play className="size-5 mr-2" />
                Executar Todos os Testes
              </>
            )}
          </Button>
        </div>

        {/* Summary */}
        {(summary.success > 0 || summary.error > 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="font-bold text-xl mb-4">Resumo</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Sucesso</p>
                <p className="text-3xl font-bold text-green-600">{summary.success}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-sm text-red-700 mb-1">Falhas</p>
                <p className="text-3xl font-bold text-red-600">{summary.error}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-blue-600">{successRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Tests List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="font-bold text-xl mb-4">Testes Executados</h2>
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{test.name}</p>
                      {test.message && (
                        <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                      )}
                    </div>
                  </div>
                  {test.time && (
                    <span className="text-sm text-gray-500 font-mono">
                      {test.time}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6">
          <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle className="size-5" />
            Instruções
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Este é um componente de teste temporário</li>
            <li>• Clique no botão acima para executar todos os testes</li>
            <li>• Verifique se todos os hooks retornam sucesso</li>
            <li>• Se houver falhas, verifique os logs do console</li>
            <li>• Após validação, remova este componente do projeto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
