import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import { useAffiliates } from '../../hooks/useAffiliates';

interface AffiliatesManagerProps {
  accessToken?: string;
}

export default function AffiliatesManager({ accessToken }: AffiliatesManagerProps) {
  const { affiliates, loading, fetchAffiliates, payCommission } = useAffiliates();

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    await fetchAffiliates();
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  const stats = {
    total: affiliates.length,
    totalSales: affiliates.reduce((sum, a) => sum + a.total_sales, 0),
    totalCommission: affiliates.reduce((sum, a) => sum + a.total_commission, 0),
    pendingCommission: affiliates.reduce((sum, a) => sum + a.pending_commission, 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Afiliados Ativos</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Vendas Totais</CardDescription>
            <CardTitle className="text-2xl">{stats.totalSales.toLocaleString('pt-AO')} AOA</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Comissão Total</CardDescription>
            <CardTitle className="text-2xl">{stats.totalCommission.toLocaleString('pt-AO')} AOA</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Comissão Pendente</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pendingCommission.toLocaleString('pt-AO')} AOA</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Afiliados</CardTitle>
          <CardDescription>Gerencie afiliados e suas comissões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {affiliates.map((affiliate) => (
              <Card key={affiliate.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <h4 className="font-medium">{affiliate.name}</h4>
                        <Badge className="bg-blue-500 text-white">
                          {affiliate.affiliate_code}
                        </Badge>
                        <Badge variant="outline">{affiliate.commission_rate}% comissão</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div><span className="font-medium">Email:</span> {affiliate.email}</div>
                        <div><span className="font-medium">Telefone:</span> {affiliate.phone}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-3 border-t text-sm">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Vendas
                          </p>
                          <p className="font-semibold">{affiliate.total_sales.toLocaleString('pt-AO')} AOA</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Comissão Total
                          </p>
                          <p className="font-semibold">{affiliate.total_commission.toLocaleString('pt-AO')} AOA</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pendente</p>
                          <p className="font-semibold text-yellow-600">{affiliate.pending_commission.toLocaleString('pt-AO')} AOA</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pago</p>
                          <p className="font-semibold text-green-600">{affiliate.paid_commission.toLocaleString('pt-AO')} AOA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}