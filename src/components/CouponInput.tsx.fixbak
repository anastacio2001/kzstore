import { useState } from 'react';
import { Ticket, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { validateCoupon } from '../services/couponsService';
import { useAuth } from '../hooks/useAuth';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_value: number;
  description: string;
};

type CouponInputProps = {
  cartTotal: number;
  onCouponApply: (coupon: Coupon) => void;
  onCouponRemove: () => void;
  appliedCoupon: Coupon | null;
  hasFlashSaleProducts?: boolean;
};

export function CouponInput({ cartTotal, onCouponApply, onCouponRemove, appliedCoupon, hasFlashSaleProducts }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);
  const { user } = useAuth();

  const handleValidateCoupon = async () => {
    if (hasFlashSaleProducts) {
      toast.error('Cupons não podem ser usados com produtos em Flash Sale');
      return;
    }
    
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    if (!user) {
      toast.error('Faça login para usar cupons');
      return;
    }

    try {
      setValidating(true);
      const validation = await validateCoupon(couponCode, user.id, cartTotal);

      if (validation.valid && validation.coupon) {
        onCouponApply(validation.coupon);
        toast.success(validation.message);
        setCouponCode('');
      } else {
        toast.error(validation.message);
      }
    } catch (error) {
      console.error('❌ Erro ao validar cupom:', error);
      toast.error('Erro ao validar cupom. Tente novamente.');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    toast.success('Cupom removido');
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-green-600 text-white flex items-center justify-center">
              <Ticket className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-green-900 font-mono">{appliedCoupon.code}</p>
                <Check className="size-4 text-green-600" />
              </div>
              <p className="text-sm text-green-700">
                {appliedCoupon.discount_type === 'percentage'
                  ? `${appliedCoupon.discount_value}% de desconto`
                  : `${appliedCoupon.discount_value.toLocaleString('pt-AO')} AOA de desconto`}
              </p>
              {appliedCoupon.description && (
                <p className="text-xs text-green-600 mt-0.5">{appliedCoupon.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="size-8 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors"
            title="Remover cupom"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4">
      {hasFlashSaleProducts && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-start gap-2">
          <Ticket className="size-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">Cupons não disponíveis</p>
            <p className="text-xs mt-1">Seu carrinho contém produtos em Flash Sale. Cupons não podem ser combinados com Flash Sales.</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="size-5 text-gray-600" />
        <h4 className="font-semibold text-gray-900">Cupom de Desconto</h4>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="CÓDIGO DO CUPOM"
          maxLength={20}
          className="flex-1 font-mono"
          disabled={hasFlashSaleProducts}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleValidateCoupon();
            }
          }}
        />
        <Button
          onClick={handleValidateCoupon}
          disabled={validating || !couponCode.trim() || hasFlashSaleProducts}
          className="bg-[#E31E24] hover:bg-[#C41E1E]"
        >
          {validating ? 'Validando...' : 'Aplicar'}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Aplicável apenas em compras elegíveis
      </p>
    </div>
  );
}