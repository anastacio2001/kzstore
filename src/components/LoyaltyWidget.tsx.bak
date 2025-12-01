import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, ChevronRight, Sparkles } from 'lucide-react';
// Using backend endpoints now; cookie-based auth is required (credentials: 'include')

type LoyaltyAccount = {
  user_email: string;
  points: number;
  total_earned: number;
  total_spent: number;
  tier: 'bronze' | 'silver' | 'gold';
  created_at: string;
  updated_at: string;
};

type LoyaltyWidgetProps = {
  userEmail?: string;
  accessToken?: string;
  onViewDetails?: () => void;
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
    maxPoints: 49999,
  },
  silver: {
    name: 'Prata',
    color: 'from-gray-300 to-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: Star,
    minPoints: 50000,
    maxPoints: 99999,
  },
  gold: {
    name: 'Ouro',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    icon: Gift,
    minPoints: 100000,
    maxPoints: Infinity,
  },
};

export function LoyaltyWidget({ userEmail, accessToken, onViewDetails }: LoyaltyWidgetProps) {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      loadAccount();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  const loadAccount = async () => {
    try {
      const response = await fetch(`/api/loyalty/account${userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setAccount(data.account);
      }
    } catch (error) {
      console.error('Error loading loyalty account:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!userEmail || !account) {
    return null;
  }

  const tier = tierConfig[account.tier];
  const TierIcon = tier.icon;
  const nextTier = account.tier === 'bronze' ? 'silver' : account.tier === 'silver' ? 'gold' : null;
  const nextTierConfig = nextTier ? tierConfig[nextTier] : null;
  const progressToNext = nextTierConfig 
    ? ((account.total_earned - tier.minPoints) / (nextTierConfig.minPoints - tier.minPoints)) * 100
    : 100;

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

  return (
    <div className={`bg-gradient-to-br ${tier.color} rounded-xl shadow-lg p-6 text-white space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TierIcon className="size-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">Nível</p>
            <h3 className="font-bold text-xl">{tier.name}</h3>
          </div>
        </div>
        <Sparkles className="size-5 opacity-70" />
      </div>

      {/* Points */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{formatPoints(account.points)}</span>
          <span className="text-sm opacity-90">pontos</span>
        </div>
        <p className="text-sm opacity-90">
          = {formatCurrency(account.points)} em créditos
        </p>
      </div>

      {/* Progress to Next Tier */}
      {nextTierConfig && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Próximo nível: {nextTierConfig.name}</span>
            <span className="font-medium">{Math.round(progressToNext)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
          <p className="text-xs opacity-80">
            Faltam {formatPoints(nextTierConfig.minPoints - account.total_earned)} pontos
          </p>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 space-y-1.5">
        <p className="text-sm font-medium">Seus Benefícios:</p>
        <ul className="text-xs space-y-1 opacity-90">
          <li>• Acumule 1% em pontos em cada compra</li>
          {(account.tier === 'silver' || account.tier === 'gold') && (
            <li>• Cupons exclusivos mensais</li>
          )}
          {account.tier === 'gold' && (
            <>
              <li>• Frete grátis em todas as compras</li>
              <li>• Suporte prioritário via WhatsApp</li>
            </>
          )}
        </ul>
      </div>

      {/* CTA */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-between transition-colors"
        >
          <span>Ver Histórico Completo</span>
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
