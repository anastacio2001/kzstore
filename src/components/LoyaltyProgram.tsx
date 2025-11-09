import { useState, useEffect } from 'react';
import { Award, Star, TrendingUp, Gift, History, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

type LoyaltyData = {
  total_points: number;
  available_points: number;
  points_earned: number;
  points_redeemed: number;
  tier: 'bronze' | 'silver' | 'gold';
  tier_name: string;
  next_tier?: string;
  points_to_next_tier?: number;
};

type LoyaltyHistory = {
  id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  order_id?: string;
  created_at: string;
};

type LoyaltyProgramProps = {
  userEmail: string;
  accessToken: string;
  onPointsRedeemed?: (points: number) => void;
};

export function LoyaltyProgram({ userEmail, accessToken, onPointsRedeemed }: LoyaltyProgramProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [history, setHistory] = useState<LoyaltyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadLoyaltyData();
    loadHistory();
  }, [userEmail]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/user/${userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data);
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/history/${userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleRedeemPoints = async () => {
    const points = parseInt(redeemPoints);
    
    if (!points || points <= 0) {
      toast.error('Digite um valor válido de pontos');
      return;
    }

    if (!loyaltyData || points > loyaltyData.available_points) {
      toast.error('Pontos insuficientes');
      return;
    }

    if (points < 1000) {
      toast.error('Mínimo de 1.000 pontos para resgatar');
      return;
    }

    try {
      setRedeeming(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/redeem-points`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer_email: userEmail,
            points,
            description: `Resgate de ${points} pontos`
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const discountValue = points * 10; // 1 ponto = 10 AOA
        toast.success(`✅ ${points} pontos resgatados! Desconto de ${discountValue.toLocaleString('pt-AO')} AOA`);
        setShowRedeemModal(false);
        setRedeemPoints('');
        loadLoyaltyData();
        loadHistory();
        
        if (onPointsRedeemed) {
          onPointsRedeemed(points);
        }
      } else {
        toast.error(data.error || 'Erro ao resgatar pontos');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error('Erro ao resgatar pontos');
    } finally {
      setRedeeming(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold': return '👑';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 text-center">
        <Gift className="size-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Erro ao carregar programa de fidelidade</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tier Badge */}
      <div className={`bg-gradient-to-r ${getTierColor(loyaltyData.tier)} rounded-2xl p-8 text-white shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{getTierIcon(loyaltyData.tier)}</div>
            <div>
              <p className="text-sm font-medium opacity-90">Seu Nível</p>
              <h3 className="text-3xl font-bold">{loyaltyData.tier_name}</h3>
            </div>
          </div>
          <div className="size-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
            <Award className="size-8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-sm opacity-90 mb-1">Pontos Disponíveis</p>
            <p className="text-2xl font-bold">{loyaltyData.available_points.toLocaleString('pt-AO')}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-sm opacity-90 mb-1">Valor em Desconto</p>
            <p className="text-2xl font-bold">{(loyaltyData.available_points * 10).toLocaleString('pt-AO')} AOA</p>
          </div>
        </div>

        {loyaltyData.next_tier && (
          <div className="mt-6 bg-white/20 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Próximo Nível: {loyaltyData.next_tier}</p>
              <p className="text-sm font-bold">{loyaltyData.points_to_next_tier?.toLocaleString('pt-AO')} pontos</p>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all"
                style={{ 
                  width: `${Math.min(100, (loyaltyData.points_earned / (loyaltyData.points_earned + (loyaltyData.points_to_next_tier || 0))) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="size-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Pontos Ganhos</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loyaltyData.points_earned.toLocaleString('pt-AO')}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Gift className="size-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Pontos Resgatados</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loyaltyData.points_redeemed.toLocaleString('pt-AO')}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Sparkles className="size-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Disponíveis</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{loyaltyData.available_points.toLocaleString('pt-AO')}</p>
        </div>
      </div>

      {/* Redeem Button */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold mb-1">Resgate seus Pontos</h4>
            <p className="text-sm opacity-90">1.000 pontos = 10.000 AOA de desconto</p>
          </div>
          <Button
            onClick={() => setShowRedeemModal(true)}
            disabled={loyaltyData.available_points < 1000}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            Resgatar Pontos
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <History className="size-6 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">Histórico de Pontos</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma movimentação ainda</p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center ${
                    item.type === 'earned' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {item.type === 'earned' ? (
                      <TrendingUp className={`size-5 text-green-600`} />
                    ) : (
                      <Gift className={`size-5 text-purple-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${
                  item.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                }`}>
                  {item.type === 'earned' ? '+' : '-'}{item.points.toLocaleString('pt-AO')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Gift className="size-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Resgatar Pontos</h3>
                <p className="text-sm text-gray-600">Converta em desconto</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Pontos Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{loyaltyData.available_points.toLocaleString('pt-AO')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantidade de Pontos
                </label>
                <input
                  type="number"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  placeholder="Mínimo 1.000 pontos"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none text-lg"
                />
                {redeemPoints && (
                  <p className="text-sm text-gray-600 mt-2">
                    💰 Desconto: <span className="font-bold text-green-600">
                      {(parseInt(redeemPoints) * 10).toLocaleString('pt-AO')} AOA
                    </span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900 font-medium">ℹ️ Como funciona?</p>
                <ul className="text-xs text-blue-800 mt-2 space-y-1">
                  <li>• 1.000 pontos = 10.000 AOA</li>
                  <li>• Use o desconto na próxima compra</li>
                  <li>• Válido por 30 dias</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRedeemModal(false)}
                variant="outline"
                className="flex-1"
                disabled={redeeming}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRedeemPoints}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={redeeming}
              >
                {redeeming ? 'Resgatando...' : 'Resgatar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
          <div className="text-3xl mb-3">🥉</div>
          <h4 className="font-bold text-gray-900 mb-2">Bronze</h4>
          <p className="text-sm text-gray-600">0 - 49.999 pontos ganhos</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-6 border-2 border-gray-300">
          <div className="text-3xl mb-3">🥈</div>
          <h4 className="font-bold text-gray-900 mb-2">Prata</h4>
          <p className="text-sm text-gray-600">50.000 - 99.999 pontos ganhos</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 rounded-xl p-6 border-2 border-yellow-300">
          <div className="text-3xl mb-3">👑</div>
          <h4 className="font-bold text-gray-900 mb-2">Ouro</h4>
          <p className="text-sm text-gray-600">100.000+ pontos ganhos</p>
        </div>
      </div>
    </div>
  );
}
