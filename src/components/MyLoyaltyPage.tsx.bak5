import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Star, Gift, TrendingUp, TrendingDown, Calendar, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
// requests now go to backend endpoints; we use cookie-based auth via credentials: 'include'

type LoyaltyAccount = {
  user_email: string;
  points: number;
  total_earned: number;
  total_spent: number;
  tier: 'bronze' | 'silver' | 'gold';
  created_at: string;
  updated_at: string;
};

type LoyaltyHistoryItem = {
  id: string;
  user_email: string;
  type: 'earned' | 'redeemed';
  points: number;
  order_id?: string;
  reason: string;
  balance_after: number;
  created_at: string;
};

type MyLoyaltyPageProps = {
  userEmail?: string;
  onBack: () => void;
};

const tierConfig = {
  bronze: {
    name: 'Bronze',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: Trophy,
    minPoints: 0,
    benefits: [
      'Acumule 1% em pontos em cada compra',
      'Resgate pontos como desconto',
      'Acompanhe seu histórico de pontos',
    ],
  },
  silver: {
    name: 'Prata',
    color: 'from-gray-300 to-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: Star,
    minPoints: 50000,
    benefits: [
      'Todos os benefícios Bronze',
      'Cupons exclusivos mensais',
      'Acesso antecipado a promoções',
    ],
  },
  gold: {
    name: 'Ouro',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    icon: Gift,
    minPoints: 100000,
    benefits: [
      'Todos os benefícios Prata',
      'Frete grátis em todas as compras',
      'Suporte prioritário via WhatsApp',
      'Descontos exclusivos VIP',
    ],
  },
};

export function MyLoyaltyPage({ userEmail, accessToken, onBack }: MyLoyaltyPageProps) {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  useEffect(() => {
    if (userEmail) {
      loadData();
    }
  }, [userEmail]);

  const loadData = async () => {
    try {
      // Load account from backend (cookie-based auth)
      const accountRes = await fetch(`/api/loyalty/account${userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccount(accountData.account);
      }

      // Load history
      const historyRes = await fetch(`/api/loyalty/history${userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!account) return;

    const points = parseInt(redeemAmount);
    if (!points || points <= 0) {
      setRedeemError('Digite um valor válido');
      return;
    }

    if (points > account.points) {
      setRedeemError('Você não tem pontos suficientes');
      return;
    }

    if (points < 100) {
      setRedeemError('O resgate mínimo é de 100 pontos');
      return;
    }

    setRedeeming(true);
    setRedeemError('');

    try {
      const response = await fetch('/api/loyalty/redeem',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            points,
            reason: 'Resgate manual de pontos',
          }),
        }
      );

      if (response.ok) {
        setRedeemSuccess(true);
        setRedeemAmount('');
        setTimeout(() => {
          setRedeemSuccess(false);
          loadData();
        }, 2000);
      } else {
        const error = await response.json();
        setRedeemError(error.error || 'Erro ao resgatar pontos');
      }
    } catch (error) {
      setRedeemError('Erro ao resgatar pontos');
    } finally {
      setRedeeming(false);
    }
  };

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat('pt-AO').format(points);
  };

  const formatCurrency = (points: number) => {
    const aoa = points * 10; // 1 ponto = 10 AOA
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(aoa);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa estar logado para ver seus pontos</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus pontos...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar dados</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  const tier = tierConfig[account.tier];
  const TierIcon = tier.icon;
  const nextTier = account.tier === 'bronze' ? tierConfig.silver : account.tier === 'silver' ? tierConfig.gold : null;
  const progressToNext = nextTier 
    ? ((account.total_earned - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-br ${tier.color} text-white py-8 px-4`}>
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="size-5" />
            <span>Voltar</span>
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="size-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TierIcon className="size-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Programa de Fidelidade</h1>
              <p className="opacity-90">Nível: {tier.name}</p>
            </div>
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Pontos Disponíveis</p>
              <p className="text-3xl font-bold">{formatPoints(account.points)}</p>
              <p className="text-xs opacity-80 mt-1">{formatCurrency(account.points)} em créditos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Total Ganho</p>
              <p className="text-3xl font-bold">{formatPoints(account.total_earned)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Total Resgatado</p>
              <p className="text-3xl font-bold">{formatPoints(account.total_spent)}</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm">Próximo nível: {nextTier.name}</p>
                <p className="font-medium">{Math.round(progressToNext)}%</p>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
              <p className="text-xs opacity-80 mt-2">
                Faltam {formatPoints(nextTier.minPoints - account.total_earned)} pontos para {nextTier.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Redeem Points */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="size-6 text-blue-600" />
            Resgatar Pontos
          </h2>
          
          {!redeemSuccess ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>1 ponto = 10 AOA</strong> • Resgate mínimo: 100 pontos (1.000 AOA)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redeem-points">Quantidade de Pontos</Label>
                  <Input
                    id="redeem-points"
                    type="number"
                    placeholder="Ex: 1000"
                    value={redeemAmount}
                    onChange={(e) => {
                      setRedeemAmount(e.target.value);
                      setRedeemError('');
                    }}
                    max={account.points}
                  />
                  {redeemAmount && (
                    <p className="text-sm text-gray-600">
                      = {formatCurrency(parseInt(redeemAmount) || 0)} em créditos
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemAmount}
                    className="w-full"
                  >
                    {redeeming ? 'Resgatando...' : 'Resgatar Pontos'}
                  </Button>
                </div>
              </div>

              {redeemError && (
                <p className="text-sm text-red-600">{redeemError}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="size-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pontos Resgatados!</h3>
              <p className="text-gray-600">Seus créditos estão disponíveis para uso</p>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Benefícios do Nível {tier.name}</h2>
          <ul className="space-y-2">
            {tier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="size-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="size-3 text-green-600" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="size-6 text-blue-600" />
            Histórico de Pontos
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma movimentação ainda</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center ${
                      item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {item.type === 'earned' ? (
                        <TrendingUp className="size-5 text-green-600" />
                      ) : (
                        <TrendingDown className="size-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.reason}</p>
                      <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                      {item.order_id && (
                        <p className="text-xs text-gray-400">Pedido: {item.order_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'earned' ? '+' : '-'}{formatPoints(Math.abs(item.points))}
                    </p>
                    <p className="text-xs text-gray-500">
                      Saldo: {formatPoints(item.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
