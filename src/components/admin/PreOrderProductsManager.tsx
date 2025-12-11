import { useState, useEffect } from 'react';
import { Package, Calendar, Edit, Trash2, Plus, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface PreOrderProduct {
  id: string;
  nome: string;
  preco_aoa: number;
  imagem_url?: string;
  categoria: string;
  estoque: number;
  ativo: boolean;
  is_pre_order: boolean;
  pre_order_info?: {
    estimated_arrival?: string;
    deposit_percentage?: number;
    reserved_count?: number;
    max_reservations?: number;
    status?: string;
  };
  created_at: string;
}

export function PreOrderProductsManager() {
  const [products, setProducts] = useState<PreOrderProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreOrderProducts();
  }, []);

  const fetchPreOrderProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://kzstore-backend.fly.dev/api/products?pre_order=true&limit=1000', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        toast.error('Erro ao carregar produtos de pré-venda');
      }
    } catch (error) {
      console.error('Error fetching pre-order products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`https://kzstore-backend.fly.dev/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ativo: !currentStatus })
      });

      if (response.ok) {
        toast.success('Status atualizado!');
        fetchPreOrderProducts();
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Deseja deletar "${productName}"?`)) return;

    try {
      const response = await fetch(`https://kzstore-backend.fly.dev/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Produto deletado!');
        fetchPreOrderProducts();
      } else {
        toast.error('Erro ao deletar produto');
      }
    } catch (error) {
      toast.error('Erro ao deletar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produtos de Pré-venda</h2>
          <p className="text-gray-600">Gerencie produtos disponíveis para pré-venda</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {products.length} {products.length === 1 ? 'produto' : 'produtos'}
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Como gerenciar produtos de pré-venda:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Para adicionar um produto a pré-venda, edite o produto em "Produtos" e marque "Pré-venda"</li>
                <li>Configure a data estimada de chegada e percentual de sinal</li>
                <li>Produtos inativos não aparecem na loja</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto de pré-venda</h3>
            <p className="text-gray-600 mb-6">
              Edite um produto existente e marque-o como pré-venda para que apareça aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const arrivalDate = product.pre_order_info?.estimated_arrival
              ? new Date(product.pre_order_info.estimated_arrival).toLocaleDateString('pt-PT')
              : 'Não definida';

            return (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    {product.imagem_url && (
                      <img
                        src={product.imagem_url}
                        alt={product.nome}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{product.nome}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.categoria}</Badge>
                            <Badge variant={product.ativo ? 'default' : 'destructive'}>
                              {product.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-red-600">
                            {product.preco_aoa.toLocaleString('pt-AO')} Kz
                          </p>
                          <p className="text-sm text-gray-600">
                            Sinal: {Math.round(product.preco_aoa * ((product.pre_order_info?.deposit_percentage || 30) / 100)).toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                      </div>

                      {/* Pre-order Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Data de Chegada</p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {arrivalDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Sinal (%)</p>
                          <p className="text-sm font-medium">
                            {product.pre_order_info?.deposit_percentage || 30}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Reservas</p>
                          <p className="text-sm font-medium">
                            {product.pre_order_info?.reserved_count || 0} / {product.pre_order_info?.max_reservations || 100}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Status</p>
                          <p className="text-sm font-medium">
                            {product.pre_order_info?.status || 'Aguardando'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://kzstore.ao/produto/${product.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver na Loja
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={product.ativo ? 'outline' : 'default'}
                          onClick={() => handleToggleActive(product.id, product.ativo)}
                        >
                          {product.ativo ? 'Desativar' : 'Ativar'}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id, product.nome)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
