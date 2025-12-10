import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, DollarSign, TrendingUp, Mail, Phone, CreditCard } from 'lucide-react';
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

  if (loading && affiliates.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.status === 'active').length,
    totalSales: affiliates.reduce((sum, a) => sum + Number(a.total_sales), 0),
    totalCommission: affiliates.reduce((sum, a) => sum + Number(a.total_commission), 0),
    pendingCommission: affiliates.reduce((sum, a) => sum + Number(a.pending_commission), 0),
    paidCommission: affiliates.reduce((sum, a) => sum + Number(a.paid_commission), 0),
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Afiliados Ativos
            </CardDescription>
            <CardTitle className="text-3xl">{stats.active} / {stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vendas Totais
            </CardDescription>
            <CardTitle className="text-2xl">{stats.totalSales.toLocaleString('pt-AO')} Kz</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Comissão Total
            </CardDescription>
            <CardTitle className="text-2xl">{stats.totalCommission.toLocaleString('pt-AO')} Kz</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Comissão Pendente
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {stats.pendingCommission.toLocaleString('pt-AO')} Kz
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Afiliados</CardTitle>
          <CardDescription>Gerencie afiliados e suas comissões</CardDescription>
        </CardHeader>
        <CardContent>
          {affiliates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum afiliado cadastrado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {affiliates.map((affiliate) => (
                <Card key={affiliate.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium text-lg">{affiliate.name}</h4>
                          <Badge className="bg-blue-500 text-white">
                            {affiliate.affiliate_code}
                          </Badge>
                          <Badge variant="outline">
                            {affiliate.commission_rate}% comissão
                          </Badge>
                          <Badge 
                            className={
                              affiliate.status === 'active' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-400 text-white'
                            }
                          >
                            {affiliate.status}
                          </Badge>
                        </div>
                        
                        {/* Informações de Contato */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3 pl-8">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{affiliate.email}</span>
                          </div>
                          {affiliate.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{affiliate.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-5 gap-4 pt-3 border-t text-sm">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Cliques</p>
                            <p className="font-semibold text-blue-600">{affiliate.total_clicks}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" /> Vendas
                            </p>
                            <p className="font-semibold">
                              {Number(affiliate.total_sales).toLocaleString('pt-AO')} Kz
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> Total Comissão
                            </p>
                            <p className="font-semibold">
                              {Number(affiliate.total_commission).toLocaleString('pt-AO')} Kz
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Pendente</p>
                            <p className="font-semibold text-yellow-600">
                              {Number(affiliate.pending_commission).toLocaleString('pt-AO')} Kz
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Pago</p>
                            <p className="font-semibold text-green-600">
                              {Number(affiliate.paid_commission).toLocaleString('pt-AO')} Kz
                            </p>
                          </div>
                        </div>

                        {/* Dados Bancários (se existirem) */}
                        {affiliate.bank_name && (
                          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                            <p className="font-medium mb-1">Dados Bancários:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <span>Banco: {affiliate.bank_name}</span>
                              {affiliate.account_holder && (
                                <span>Titular: {affiliate.account_holder}</span>
                              )}
                              {affiliate.account_number && (
                                <span>Conta: {affiliate.account_number}</span>
                              )}
                              {affiliate.iban && (
                                <span>IBAN: {affiliate.iban}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Data de Criação */}
                        <div className="mt-2 text-xs text-gray-400">
                          Membro desde: {new Date(affiliate.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}