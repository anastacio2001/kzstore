import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

type PriceAlertButtonProps = {
  productId: string;
  productName: string;
  currentPrice: number;
  userEmail?: string;
  accessToken?: string;
};

export function PriceAlertButton({ 
  productId, 
  productName, 
  currentPrice, 
  userEmail, 
  accessToken 
}: PriceAlertButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [hasAlert, setHasAlert] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      checkExistingAlert();
    }
  }, [userEmail, productId]);

  const checkExistingAlert = async () => {
    if (!userEmail || !accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/price-alerts/user/${userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const existingAlert = data.alerts.find(
          (alert: any) => alert.product_id === productId && alert.is_active
        );

        if (existingAlert) {
          setHasAlert(true);
          setAlertId(existingAlert.id);
          setTargetPrice(existingAlert.target_price.toString());
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!userEmail || !accessToken) {
      toast.error('Faça login para criar alertas de preço');
      return;
    }

    const price = parseFloat(targetPrice);
    if (!price || price <= 0) {
      toast.error('Digite um preço válido');
      return;
    }

    if (price >= currentPrice) {
      toast.error('O preço alvo deve ser menor que o preço atual');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/price-alerts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId,
            product_name: productName,
            current_price: currentPrice,
            target_price: price,
            customer_email: userEmail
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setHasAlert(true);
        setAlertId(data.alert.id);
        setShowModal(false);
        toast.success('✅ Alerta criado! Você será notificado quando o preço baixar.');
      } else {
        toast.error(data.error || 'Erro ao criar alerta');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Erro ao criar alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlert = async () => {
    if (!alertId || !accessToken) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/price-alerts/${alertId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        setHasAlert(false);
        setAlertId(null);
        setTargetPrice('');
        toast.success('Alerta removido');
      }
    } catch (error) {
      console.error('Error removing alert:', error);
      toast.error('Erro ao remover alerta');
    } finally {
      setLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <Button
        onClick={() => toast.info('Faça login para criar alertas de preço')}
        variant="outline"
        className="gap-2"
      >
        <Bell className="size-4" />
        Alerta de Preço
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => hasAlert ? handleRemoveAlert() : setShowModal(true)}
        variant={hasAlert ? "default" : "outline"}
        className={`gap-2 ${hasAlert ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
        disabled={loading}
      >
        {hasAlert ? (
          <>
            <Check className="size-4" />
            Alerta Ativo
          </>
        ) : (
          <>
            <Bell className="size-4" />
            Alerta de Preço
          </>
        )}
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Bell className="size-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alerta de Preço</h3>
                <p className="text-sm text-gray-600">Seja notificado quando baixar</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Produto</p>
                <p className="text-gray-900 line-clamp-2">{productName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Preço Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPrice.toLocaleString('pt-AO')} <span className="text-lg">AOA</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preço Desejado (AOA)
                </label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={`Menor que ${currentPrice.toLocaleString('pt-AO')}`}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você será notificado por email quando o preço atingir este valor
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAlert}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Alerta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
