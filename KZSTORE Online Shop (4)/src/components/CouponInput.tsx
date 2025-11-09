import { useState } from 'react';
import { Ticket, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  description: string;
};

type CouponInputProps = {
  cartTotal: number;
  onCouponApply: (coupon: Coupon) => void;
  onCouponRemove: () => void;
  appliedCoupon: Coupon | null;
};

export function CouponInput({ cartTotal, onCouponApply, onCouponRemove, appliedCoupon }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    try {
      setValidating(true);

      // Buscar cupom usando REST API
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/coupons?code=eq.${couponCode.toUpperCase()}`,
        {
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const coupons = await response.json();

      if (!response.ok || coupons.length === 0) {
        toast.error('Cupom não encontrado');
        return;
      }

      const coupon = coupons[0];

      // Validar cupom
      if (!coupon.is_active) {
        toast.error('Este cupom não está mais ativo');
        return;
      }

      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (now < startDate) {
        toast.error('Este cupom ainda não está disponível');
        return;
      }

      if (now > endDate) {
        toast.error('Este cupom expirou');
        return;
      }

      if (cartTotal < coupon.min_purchase) {
        toast.error(`Valor mínimo de compra: ${coupon.min_purchase.toLocaleString('pt-AO')} AOA`);
        return;
      }

      if (coupon.used_count >= coupon.max_uses) {
        toast.error('Este cupom atingiu o limite de uso');
        return;
      }

      // Cupom válido!
      onCouponApply(coupon);
      toast.success(`Cupom ${coupon.code} aplicado!`);
      setCouponCode('');
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('Erro ao validar cupom');
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleValidateCoupon();
            }
          }}
        />
        <Button
          onClick={handleValidateCoupon}
          disabled={validating || !couponCode.trim()}
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
