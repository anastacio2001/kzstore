/**
 * 🔥 FERRAMENTA DE MIGRAÇÃO E UNIFICAÇÃO DE DADOS
 * Resolve o problema de múltiplos User IDs com dados diferentes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Database, Users, Package, ShoppingCart, Megaphone, Tag, AlertTriangle, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { kvGetByPrefix, kvSet, kvDelete } from '../../utils/supabase/kv';

interface DataStats {
  userId: string;
  userEmail?: string;
  products: number;
  orders: number;
  ads: number;
  coupons: number;
  flashSales: number;
  preOrders: number;
  tickets: number;
  customers: number;
  total: number;
}

export function DataMigrationTool() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DataStats[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  useEffect(() => {
    analyzeData();
  }, []);

  const analyzeData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Analisando todos os dados no banco...');

      // Buscar TODOS os dados com prefixos conhecidos
      const allProducts = await kvGetByPrefix('product:');
      const allOrders = await kvGetByPrefix('order:');
      const allAds = await kvGetByPrefix('ad:');
      const allCoupons = await kvGetByPrefix('coupon:');
      const allFlashSales = await kvGetByPrefix('flash-sale:');
      const allPreOrders = await kvGetByPrefix('pre-order:');
      const allTickets = await kvGetByPrefix('ticket:');
      const allCustomers = await kvGetByPrefix('customer:');

      console.log('📊 Dados encontrados:', {
        products: allProducts.length,
        orders: allOrders.length,
        ads: allAds.length,
        coupons: allCoupons.length,
        flashSales: allFlashSales.length,
        preOrders: allPreOrders.length,
        tickets: allTickets.length,
        customers: allCustomers.length
      });

      // Agrupar por User ID (se existir no dado)
      const userDataMap = new Map<string, DataStats>();

      // Função helper para adicionar dados
      const addToStats = (userId: string, type: keyof Omit<DataStats, 'userId' | 'userEmail' | 'total'>, count: number) => {
        if (!userDataMap.has(userId)) {
          userDataMap.set(userId, {
            userId,
            products: 0,
            orders: 0,
            ads: 0,
            coupons: 0,
            flashSales: 0,
            preOrders: 0,
            tickets: 0,
            customers: 0,
            total: 0
          });
        }
        const stats = userDataMap.get(userId)!;
        stats[type] = count;
        stats.total += count;
      };

      // Como os dados não têm userId, vamos considerar TODOS os dados como um único conjunto
      const globalUserId = 'GLOBAL_DATA';
      addToStats(globalUserId, 'products', allProducts.length);
      addToStats(globalUserId, 'orders', allOrders.length);
      addToStats(globalUserId, 'ads', allAds.length);
      addToStats(globalUserId, 'coupons', allCoupons.length);
      addToStats(globalUserId, 'flashSales', allFlashSales.length);
      addToStats(globalUserId, 'preOrders', allPreOrders.length);
      addToStats(globalUserId, 'tickets', allTickets.length);
      addToStats(globalUserId, 'customers', allCustomers.length);

      const statsArray = Array.from(userDataMap.values());
      setStats(statsArray);

      console.log('✅ Análise completa:', statsArray);
    } catch (error) {
      console.error('❌ Erro ao analisar dados:', error);
      toast.error('Erro ao analisar dados: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const listAllKeys = async () => {
    setLoading(true);
    try {
      console.log('📋 Listando TODAS as chaves no banco...');
      
      const prefixes = [
        'product:', 'order:', 'ad:', 'coupon:', 'flash-sale:',
        'pre-order:', 'ticket:', 'customer:', 'team:', 'quote:',
        'trade-in:', 'affiliate:', 'review:', 'b2b:'
      ];

      for (const prefix of prefixes) {
        const items = await kvGetByPrefix(prefix);
        if (items.length > 0) {
          console.log(`📦 ${prefix}`, items.length, 'itens');
          console.log('   Amostra:', items.slice(0, 2));
          
          // 🔥 EXTRA DEBUG: Mostrar estrutura completa dos anúncios
          if (prefix === 'ad:') {
            console.log('🔍 ESTRUTURA COMPLETA DOS ANÚNCIOS:');
            items.forEach((item, index) => {
              console.log(`   Anúncio ${index + 1}:`, {
                key: item.key,
                value: item.value,
                campos: Object.keys(item.value)
              });
            });
          }
        }
      }

      toast.success('Lista completa no console!');
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('Erro: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteAllData = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai DELETAR TODOS OS DADOS do banco!\n\nEsta ação NÃO PODE ser desfeita!\n\nDigite SIM em maiúsculas para confirmar:')) {
      return;
    }

    const confirmText = prompt('Digite "DELETAR TUDO" para confirmar:');
    if (confirmText !== 'DELETAR TUDO') {
      toast.error('Cancelado - texto incorreto');
      return;
    }

    setLoading(true);
    try {
      console.log('🗑️ Deletando TODOS os dados...');
      
      const prefixes = [
        'product:', 'order:', 'ad:', 'coupon:', 'flash-sale:',
        'pre-order:', 'ticket:', 'customer:', 'team:', 'quote:',
        'trade-in:', 'affiliate:', 'review:', 'b2b:', 
        'products:list', 'ads:list', 'coupons:list'
      ];

      let totalDeleted = 0;

      for (const prefix of prefixes) {
        const items = await kvGetByPrefix(prefix);
        console.log(`🗑️ Deletando ${items.length} itens com prefixo "${prefix}"...`);
        
        for (const item of items) {
          await kvDelete(item.key);
          totalDeleted++;
        }
      }

      console.log(`✅ ${totalDeleted} itens deletados!`);
      toast.success(`✅ ${totalDeleted} itens deletados com sucesso!`);
      
      // Recarregar análise
      await analyzeData();
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      toast.error('Erro ao deletar: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    setLoading(true);
    try {
      console.log('📤 Exportando TODOS os dados...');
      
      const prefixes = [
        'product:', 'order:', 'ad:', 'coupon:', 'flash-sale:',
        'pre-order:', 'ticket:', 'customer:', 'team:', 'quote:',
        'trade-in:', 'affiliate:', 'review:', 'b2b:'
      ];

      const exportData: any = {};

      for (const prefix of prefixes) {
        const items = await kvGetByPrefix(prefix);
        exportData[prefix] = items;
      }

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kzstore-backup-${new Date().toISOString()}.json`;
      a.click();

      toast.success('✅ Backup criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao exportar:', error);
      toast.error('Erro ao exportar: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="size-8 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">
              🔥 Ferramenta de Migração e Diagnóstico
            </h2>
            <p className="text-white/90 mb-3">
              Esta ferramenta permite diagnosticar e resolver problemas de dados duplicados causados por múltiplas sessões com diferentes User IDs.
            </p>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <strong>⚠️ Use com cuidado:</strong> Esta ferramenta pode deletar dados permanentemente.
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={analyzeData}
          disabled={loading}
          className="h-auto py-4 flex-col gap-2"
          variant="outline"
        >
          <Database className="size-6" />
          <span>Analisar Dados</span>
        </Button>

        <Button
          onClick={listAllKeys}
          disabled={loading}
          className="h-auto py-4 flex-col gap-2"
          variant="outline"
        >
          <Users className="size-6" />
          <span>Listar Todas as Chaves</span>
        </Button>

        <Button
          onClick={exportAllData}
          disabled={loading}
          className="h-auto py-4 flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CheckCircle2 className="size-6" />
          <span>Exportar Backup</span>
        </Button>
      </div>

      {/* Statistics */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Estatísticas de Dados</CardTitle>
            <CardDescription>
              Resumo de todos os dados encontrados no banco
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.map((stat) => (
              <div key={stat.userId} className="border rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {stat.userId === 'GLOBAL_DATA' ? '🌍 Dados Globais' : `User: ${stat.userId}`}
                    </h3>
                    {stat.userEmail && (
                      <p className="text-sm text-gray-600">{stat.userEmail}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#E31E24]">
                      {stat.total}
                    </div>
                    <div className="text-xs text-gray-600">itens totais</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stat.products > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                      <Package className="size-5 text-blue-600" />
                      <div>
                        <div className="font-bold text-blue-900">{stat.products}</div>
                        <div className="text-xs text-blue-700">Produtos</div>
                      </div>
                    </div>
                  )}

                  {stat.orders > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                      <ShoppingCart className="size-5 text-green-600" />
                      <div>
                        <div className="font-bold text-green-900">{stat.orders}</div>
                        <div className="text-xs text-green-700">Pedidos</div>
                      </div>
                    </div>
                  )}

                  {stat.ads > 0 && (
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
                      <Megaphone className="size-5 text-purple-600" />
                      <div>
                        <div className="font-bold text-purple-900">{stat.ads}</div>
                        <div className="text-xs text-purple-700">Anúncios</div>
                      </div>
                    </div>
                  )}

                  {stat.coupons > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
                      <Tag className="size-5 text-orange-600" />
                      <div>
                        <div className="font-bold text-orange-900">{stat.coupons}</div>
                        <div className="text-xs text-orange-700">Cupons</div>
                      </div>
                    </div>
                  )}

                  {stat.flashSales > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-3">
                      <div className="font-bold text-yellow-900">{stat.flashSales}</div>
                      <div className="text-xs text-yellow-700">Flash Sales</div>
                    </div>
                  )}

                  {stat.preOrders > 0 && (
                    <div className="flex items-center gap-2 bg-indigo-50 rounded-lg p-3">
                      <div className="font-bold text-indigo-900">{stat.preOrders}</div>
                      <div className="text-xs text-indigo-700">Pré-Vendas</div>
                    </div>
                  )}

                  {stat.tickets > 0 && (
                    <div className="flex items-center gap-2 bg-pink-50 rounded-lg p-3">
                      <div className="font-bold text-pink-900">{stat.tickets}</div>
                      <div className="text-xs text-pink-700">Tickets</div>
                    </div>
                  )}

                  {stat.customers > 0 && (
                    <div className="flex items-center gap-2 bg-teal-50 rounded-lg p-3">
                      <Users className="size-5 text-teal-600" />
                      <div>
                        <div className="font-bold text-teal-900">{stat.customers}</div>
                        <div className="text-xs text-teal-700">Clientes</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <Trash2 className="size-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600">
            Ações irreversíveis - use com extremo cuidado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={deleteAllData}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="size-4 mr-2" />
            Deletar TODOS os Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}