import { Zap } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface FlashSaleBadgeProps {
  endDate: string;
  discountPercentage: number;
  stockLimit: number;
  stockSold: number;
  size?: 'small' | 'large';
}

export function FlashSaleBadge({ 
  endDate, 
  discountPercentage, 
  stockLimit, 
  stockSold,
  size = 'small'
}: FlashSaleBadgeProps) {
  const { formatTime, isExpired } = useCountdown(endDate);

  if (isExpired) return null;

  const remainingStock = stockLimit - stockSold;
  const stockPercentage = (stockSold / stockLimit) * 100;

  if (size === 'small') {
    return (
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
          <Zap className="size-4 fill-white" />
          <span className="text-sm font-bold">-{discountPercentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Zap className="size-8 fill-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">FLASH SALE</h3>
          <p className="text-white/90 text-sm">Oferta por tempo limitado</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-white/80 text-xs mb-1">Desconto</p>
          <p className="text-3xl font-bold">-{discountPercentage}%</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-white/80 text-xs mb-1">Termina em</p>
          <p className="text-xl font-bold">{formatTime()}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/90">Unidades restantes</span>
          <span className="font-bold">{remainingStock}/{stockLimit}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${100 - stockPercentage}%` }}
          />
        </div>
        {remainingStock <= 10 && (
          <p className="text-yellow-300 text-xs mt-2 font-semibold">
            ⚡ Restam apenas {remainingStock} unidades!
          </p>
        )}
      </div>
    </div>
  );
}
