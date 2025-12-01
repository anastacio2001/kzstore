/**
 * Available Coupons Component - Exibe cupons disponíveis para o usuário
 * @author KZSTORE
 */

import { useState, useEffect } from 'react';
import { getActiveCoupons } from '../services/couponsService';
import type { Coupon } from '../services/couponsService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Copy, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AvailableCouponsProps {
  onApplyCoupon?: (code: string) => void;
  showApplyButton?: boolean;
}

export default function AvailableCoupons({ 
  onApplyCoupon, 
  showApplyButton = false 
}: AvailableCouponsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const activeCoupons = await getActiveCoupons();
      setCoupons(activeCoupons);
      console.log('🎫 AvailableCoupons: Cupons ativos carregados:', activeCoupons.length);
    } catch (error) {
      console.error('❌ Erro ao carregar cupons:', error);
      toast.error('Não foi possível carregar os cupons disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Cupom ${code} copiado!`);
  };

  const handleApply = (code: string) => {
    if (onApplyCoupon) {
      onApplyCoupon(code);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    }
    return `${coupon.discount_value.toLocaleString('pt-AO')} Kz OFF`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando cupons disponíveis...</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Nenhum cupom disponível no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Cupons Disponíveis</h4>
          <Badge variant="secondary" className="text-xs">{coupons.length}</Badge>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="flex-shrink-0 w-64 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border-2 border-dashed border-red-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="font-mono text-xs px-2 py-0.5">
                    {coupon.code}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-primary">
                  {formatDiscount(coupon)}
                </p>
              </div>
            </div>

            {coupon.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                {coupon.description}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => handleCopy(coupon.code)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
              {showApplyButton && onApplyCoupon && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => handleApply(coupon.code)}
                >
                  Aplicar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
