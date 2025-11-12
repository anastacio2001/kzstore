import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase/client';

interface BusinessAccount {
  id: string;
  user_id: string | null;
  company_name: string;
  cnpj: string;
  trade_name: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  monthly_purchase_volume: string | null;
  business_description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  discount_tier: number;
  credit_limit: number;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

export default function B2BManager() {
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      console.log('🔍 Loading B2B accounts...');
      
      const { data, error } = await supabase
        .from('business_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 B2B accounts result:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Error loading accounts:', error);
        throw error;
      }
      
      console.log('✅ Loaded accounts:', data);
      setAccounts(data || []);
    } catch (error: any) {
      console.error('❌ Error loading B2B accounts:', error);
      toast.error('Erro ao carregar contas B2B');
    } finally {
      setLoading(false);
    }
  }

  async function updateAccountStatus(
    accountId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) {
    try {
      console.log('🔄 Updating account status:', { accountId, status, rejectionReason });
      
      const updates: any = {
        status,
        ...(status === 'approved' && {
          approved_at: new Date().toISOString(),
          discount_tier: 1
        }),
        ...(status === 'rejected' && {
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null
        })
      };

      console.log('📝 Update payload:', updates);

      const { data, error } = await supabase
        .from('business_accounts')
        .update(updates)
        .eq('id', accountId)
        .select();

      console.log('📊 Update result:', { data, error });

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      toast.success(
        status === 'approved'
          ? '✅ Conta aprovada com sucesso!'
          : '❌ Conta rejeitada'
      );

      loadAccounts();
    } catch (error: any) {
      console.error('❌ Error updating account status:', error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  async function updateDiscountTier(accountId: string, tier: number) {
    try {
      const { error } = await supabase
        .from('business_accounts')
        .update({ discount_tier: tier })
        .eq('id', accountId);

      if (error) throw error;
      toast.success('Nível de desconto atualizado!');
      loadAccounts();
    } catch (error: any) {
      console.error('Error updating discount tier:', error);
      toast.error('Erro ao atualizar nível de desconto');
    }
  }

  const filteredAccounts = accounts.filter(acc => {
    if (filter === 'all') return true;
    return acc.status === filter;
  });

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pendente' },
    approved: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Aprovado' },
    rejected: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Rejeitado' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contas Empresariais (B2B)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total de Contas</p>
            <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-yellow-700">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {accounts.filter(a => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-green-700">Aprovadas</p>
            <p className="text-2xl font-bold text-green-600">
              {accounts.filter(a => a.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-red-700">Rejeitadas</p>
            <p className="text-2xl font-bold text-red-600">
              {accounts.filter(a => a.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Todas' : statusConfig[status as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma conta encontrada</p>
          </div>
        ) : (
          filteredAccounts.map(account => {
            const StatusIcon = statusConfig[account.status].icon;
            return (
              <div key={account.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{account.company_name}</h3>
                      {account.trade_name && (
                        <p className="text-sm text-gray-600">({account.trade_name})</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">NIF: {account.cnpj}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${statusConfig[account.status].color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusConfig[account.status].label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{account.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${account.contact_email}`} className="text-blue-600 hover:underline">
                        {account.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{account.contact_phone}</span>
                    </div>
                  </div>
                  
                  {(account.address || account.city) && (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <div>
                          {account.address && <p>{account.address}</p>}
                          {account.city && <p>{account.city}, {account.state}</p>}
                          {account.zip_code && <p>{account.zip_code}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {account.monthly_purchase_volume && (
                  <div className="mb-4 text-sm">
                    <span className="text-gray-600">Volume Mensal: </span>
                    <span className="font-semibold text-gray-900">{account.monthly_purchase_volume}</span>
                  </div>
                )}

                {account.business_description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <FileText className="w-4 h-4 inline mr-2" />
                      {account.business_description}
                    </p>
                  </div>
                )}

                {account.status === 'approved' && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Nível de Desconto</p>
                        <p className="text-xs text-green-600 mt-1">
                          Tier {account.discount_tier} - {account.discount_tier * 5}% de desconto
                        </p>
                      </div>
                      <select
                        value={account.discount_tier}
                        onChange={(e) => updateDiscountTier(account.id, parseInt(e.target.value))}
                        className="px-3 py-1 border border-green-300 rounded-lg text-sm"
                      >
                        <option value="1">Tier 1 (5%)</option>
                        <option value="2">Tier 2 (10%)</option>
                        <option value="3">Tier 3 (15%)</option>
                        <option value="4">Tier 4 (20%)</option>
                        <option value="5">Tier 5 (25%)</option>
                      </select>
                    </div>
                  </div>
                )}

                {account.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Motivo da rejeição:</strong> {account.rejection_reason}
                    </p>
                  </div>
                )}

                {account.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateAccountStatus(account.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Aprovar Conta
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Motivo da rejeição (opcional):');
                        updateAccountStatus(account.id, 'rejected', reason || undefined);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Rejeitar Conta
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                  Cadastrado em: {new Date(account.created_at).toLocaleDateString('pt-AO')}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
