import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

type PriceAlert = {
  id: string;
  user_email: string;
  product_id: number;
  target_price: number;
  created_at: string;
};

type PriceAlertButtonProps = {
  productId: string;
  productName: string;
  currentPrice: number;
};

export function PriceAlertButton({ 
  productId, 
  productName, 
  currentPrice
}: PriceAlertButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [hasAlert, setHasAlert] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkExistingAlert();
    }
  }, [user?.email, productId]);

  const checkExistingAlert = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_email', user.email)
        .eq('product_id', productId)
        .maybeSingle();

      if (data && !error) {
        setHasAlert(true);
        setAlertId(data.id);
        setTargetPrice(data.target_price.toString());
      } else {
        setHasAlert(false);
        setAlertId(null);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  const handleCreateAlert = async () => {
    console.log('🔔 handleCreateAlert chamado');
    console.log('User:', user);
    console.log('User email:', user?.email);
    console.log('Product ID (original):', productId, 'tipo:', typeof productId);
    
    if (!user?.email) {
      console.log('❌ Sem email do usuário');
      toast.error('Faça login para criar alertas de preço');
      return;
    }

    const price = parseFloat(targetPrice);
    console.log('💰 Preço digitado:', targetPrice, 'Parseado:', price);
    console.log('💰 Preço atual:', currentPrice);
    
    if (!price || price <= 0) {
      console.log('❌ Preço inválido');
      toast.error('Digite um preço válido');
      return;
    }

    if (price >= currentPrice) {
      console.log('❌ Preço alvo maior ou igual ao atual');
      toast.error('O preço alvo deve ser menor que o preço atual');
      return;
    }

    try {
      setLoading(true);
      
      const alertData = {
        user_email: user.email,
        product_id: productId, // Manter como string (UUID)
        target_price: price
      };
      
      console.log('📤 Enviando dados:', alertData);
      
      const { data, error } = await supabase
        .from('price_alerts')
        .insert([alertData])
        .select()
        .single();

      console.log('📥 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro ao criar alerta:', error);
        toast.error(`Erro ao criar alerta: ${error.message}`);
        return;
      }

      console.log('✅ Alerta criado com sucesso!', data);
      setHasAlert(true);
      setAlertId(data.id);
      setShowModal(false);
      toast.success('✅ Alerta criado! Você será notificado quando o preço baixar.');
    } catch (error) {
      console.error('❌ Exceção ao criar alerta:', error);
      toast.error(`Erro ao criar alerta: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlert = async () => {
    if (!alertId) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error removing alert:', error);
        toast.error('Erro ao remover alerta');
        return;
      }

      setHasAlert(false);
      setAlertId(null);
      setTargetPrice('');
      toast.success('Alerta removido');
    } catch (error) {
      console.error('Error removing alert:', error);
      toast.error('Erro ao remover alerta');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.email) {
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
