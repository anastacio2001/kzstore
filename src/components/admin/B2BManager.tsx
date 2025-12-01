import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import { useB2B } from '../../hooks/useB2B';

interface B2BManagerProps {
  accessToken?: string;
}

export default function B2BManager({ accessToken }: B2BManagerProps) {
  const { accounts, loading, fetchAccounts, createAccount, updateAccount } = useB2B();
  const [editing, setEditing] = useState<any | null>(null);
  const [creditLimit, setCreditLimit] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    await fetchAccounts();
  };

  const handleUpdate = async (accountId: string, status: string) => {
    await updateAccount(accountId, {
      status: status as any,
      approved_credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
      discount_percentage: discount ? parseFloat(discount) : undefined,
      payment_terms: parseInt(paymentTerms)
    });
    
    setEditing(null);
    await loadAccounts();
  };

  const openEdit = (account: any) => {
    setEditing(account);
    setCreditLimit(account.approved_credit_limit.toString());
    setDiscount(account.discount_percentage.toString());
    setPaymentTerms(account.payment_terms.toString());
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  const stats = {
    total: accounts.length,
    pending: accounts.filter(a => a.status === 'pending').length,
    approved: accounts.filter(a => a.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total B2B</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aprovados</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Empresariais B2B</CardTitle>
          <CardDescription>Gerencie contas corporativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <h4 className="font-medium">{account.company_name}</h4>
                        <Badge className={account.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {account.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div><span className="font-medium">NIF:</span> {account.tax_id}</div>
                        <div><span className="font-medium">Contacto:</span> {account.contact_person}</div>
                        <div><span className="font-medium">Email:</span> {account.email}</div>
                        <div><span className="font-medium">Telefone:</span> {account.phone}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-3 border-t text-sm">
                        <div>
                          <p className="text-gray-500">Limite Solicitado</p>
                          <p className="font-semibold">{account.requested_credit_limit.toLocaleString('pt-AO')} AOA</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Limite Aprovado</p>
                          <p className="font-semibold text-green-600">{account.approved_credit_limit.toLocaleString('pt-AO')} AOA</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Desconto</p>
                          <p className="font-semibold">{account.discount_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prazo Pgto</p>
                          <p className="font-semibold">{account.payment_terms} dias</p>
                        </div>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openEdit(account)}>Gerir</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{account.company_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Limite de Crédito (AOA)</label>
                            <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Desconto (%)</label>
                            <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Prazo de Pagamento (dias)</label>
                            <Input type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdate(account.id, 'approved')} className="flex-1 bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                            </Button>
                            <Button onClick={() => handleUpdate(account.id, 'rejected')} variant="destructive" className="flex-1">
                              <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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