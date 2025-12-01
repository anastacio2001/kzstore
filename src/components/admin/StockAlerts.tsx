import { useState, useEffect } from 'react';
import { AlertCircle, Package, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useProducts } from '../../hooks/useProducts';

type StockAlertsProps = {
  threshold?: number;
};

export function StockAlerts({ threshold: initialThreshold = 5 }: StockAlertsProps) {
  const { products, loading, fetchProducts } = useProducts();
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [threshold, setThreshold] = useState(initialThreshold);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products) {
      const low = products.filter(p => p.estoque <= threshold);
      setLowStockProducts(low);
    }
  }, [products, threshold]);

  const loadProducts = async () => {
    await fetchProducts();
  };

  const totalAlerts = lowStockProducts.length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="size-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (totalAlerts === 0) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <Package className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-1">
              Estoque Saudável! 🎉
            </h3>
            <p className="text-sm text-green-700">
              Todos os produtos estão com estoque adequado. Nenhum alerta ativo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertTriangle className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-2">
              Alertas de Estoque
            </h3>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-orange-600" />
                <span className="text-orange-700">
                  <span className="font-bold text-lg">{lowStockProducts.length}</span> produto(s) com estoque baixo
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="size-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Limite de estoque baixo:
          </label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-red-600 focus:outline-none"
          >
            <option value="3">3 unidades</option>
            <option value="5">5 unidades</option>
            <option value="10">10 unidades</option>
            <option value="15">15 unidades</option>
          </select>
        </div>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-orange-50 px-6 py-3 border-b border-orange-200">
            <h4 className="font-semibold text-orange-900 flex items-center gap-2">
              <TrendingDown className="size-5" />
              Estoque Baixo ({lowStockProducts.length})
            </h4>
          </div>
          <div className="divide-y">
            {lowStockProducts.map(product => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={product.imagem_url}
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">
                      {product.nome}
                    </h5>
                    <p className="text-sm text-gray-600">{product.categoria}</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {product.preco_aoa.toLocaleString('pt-AO')} AOA
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-300">
                      <Package className="size-4 text-orange-600" />
                      <span className="font-bold text-orange-900">
                        {product.estoque} {product.estoque === 1 ? 'unidade' : 'unidades'}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      ⚠️ Reabastecer em breve
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}