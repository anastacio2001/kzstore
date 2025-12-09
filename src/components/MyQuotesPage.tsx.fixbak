import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuotes, Quote } from '../hooks/useQuotes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, Plus } from 'lucide-react';

interface MyQuotesPageProps {
  onBack?: () => void;
  onNewQuote?: () => void;
}

export default function MyQuotesPage({ onBack, onNewQuote }: MyQuotesPageProps) {
  const { user } = useAuth();
  const { fetchQuotes, loading } = useQuotes();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (user) {
      fetchQuotes().then(data => {
        console.log('📋 Cotações carregadas:', data.length);
        setQuotes(data);
      });
    }
  }, [user, fetchQuotes]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', className: 'bg-yellow-500' },
      in_progress: { label: 'Em Análise', className: 'bg-blue-500' },
      sent: { label: 'Enviado', className: 'bg-purple-500' },
      accepted: { label: 'Aceito', className: 'bg-green-500' },
      rejected: { label: 'Rejeitado', className: 'bg-red-500' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-500' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'sent': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Faça login para ver suas cotações</p>
            <Button onClick={() => window.location.href = '/'} className="mt-4">
              Ir para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack || (() => window.history.back())}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Minhas Cotações</h1>
            <p className="text-gray-600">Acompanhe suas solicitações de orçamento</p>
          </div>
        </div>

        {onNewQuote && (
          <Button
            onClick={onNewQuote}
            className="bg-[#E31E24] hover:bg-[#C01A1F] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Você ainda não tem cotações</p>
            <Button onClick={onBack || (() => window.history.back())}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(quote.status)}
                    <div>
                      <CardTitle className="text-lg">{quote.quote_number}</CardTitle>
                      <CardDescription>
                        Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Requisitos:</p>
                    <p className="text-gray-600">{quote.requirements}</p>
                  </div>
                  
                  {quote.budget && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Orçamento:</p>
                      <p className="text-gray-600">AOA {quote.budget.toLocaleString('pt-BR')}</p>
                    </div>
                  )}

                  {quote.admin_proposal && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">📄 Proposta da Equipe:</p>
                      <p className="text-blue-800">{quote.admin_proposal}</p>
                      
                      {quote.total_amount && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-lg font-bold text-blue-900">
                            Total: AOA {quote.total_amount.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {quote.admin_notes && (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Observações:</p>
                      <p className="text-gray-600 text-sm">{quote.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <p className="text-xs text-gray-500">
                      Atualizado: {new Date(quote.updated_at || quote.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    {quote.responded_at && (
                      <p className="text-xs text-gray-500">
                        • Respondido: {new Date(quote.responded_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
