import { useState } from 'react';
import { Bell, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Product } from '../App';
// Supabase removed - backend endpoints will be used

type PriceAlertButtonProps = {
  product: Product;
  userEmail?: string;
  userName?: string;
  accessToken?: string;
};

export function PriceAlertButton({ product, userEmail, userName, accessToken }: PriceAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCreateAlert = async () => {
    if (!userEmail) {
      setError('Você precisa estar logado para criar alertas de preço');
      return;
    }

    const targetPriceNum = parseFloat(targetPrice.replace(/[^\d]/g, ''));
    
    if (!targetPriceNum || targetPriceNum <= 0) {
      setError('Digite um preço válido');
      return;
    }

    if (targetPriceNum >= product.preco_aoa) {
      setError(`O preço desejado deve ser menor que ${formatPrice(product.preco_aoa)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          target_price: targetPriceNum,
          user_email: userEmail,
          user_name: userName || userEmail.split('@')[0],
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar alerta');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setTargetPrice('');
      }, 2000);
    } catch (err) {
      console.error('Error creating price alert:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar alerta');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/[^\d]/g, '');
    setTargetPrice(numbers);
    setError('');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto gap-2"
      >
        <Bell className="size-4" />
        Alerta de Preço
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bell className="size-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Alerta de Preço</h3>
                  <p className="text-sm text-gray-500">Seja notificado quando baixar</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Produto */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-500">Produto</p>
              <p className="font-medium">{product.nome}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Preço atual:</span>
                <span className="font-semibold text-lg">{formatPrice(product.preco_aoa)}</span>
              </div>
            </div>

            {/* Form */}
            {!success ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-price">Preço Desejado (AOA)</Label>
                  <Input
                    id="target-price"
                    type="text"
                    placeholder="Ex: 50000"
                    value={targetPrice ? formatPrice(parseFloat(targetPrice)) : ''}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className={error ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    Digite o preço que você está disposto a pagar
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Defina o preço que deseja pagar</li>
                    <li>• Quando o produto atingir esse valor, você receberá um email</li>
                    <li>• Você pode criar vários alertas para produtos diferentes</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCreateAlert}
                  disabled={loading || !targetPrice}
                  className="w-full"
                >
                  {loading ? 'Criando Alerta...' : 'Criar Alerta'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Alerta Criado!</h3>
                <p className="text-sm text-gray-600">
                  Você receberá um email quando o preço atingir {formatPrice(parseFloat(targetPrice))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
