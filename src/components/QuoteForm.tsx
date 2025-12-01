import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type QuoteFormProps = {
  onBack: () => void;
  onSuccess?: () => void;
};

export function QuoteForm({ onBack, onSuccess }: QuoteFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error('Você precisa estar logado para enviar solicitação de orçamento');

      // Get token from localStorage
      let token = localStorage.getItem('token');
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            token = userData.access_token || userData.token;
          } catch (e) {
            // ignore
          }
        }
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('📤 Enviando cotação:', {
        user_name: user.name || name,
        user_email: user.email || email,
        user_phone: phone,
        hasToken: !!token
      });

      const response = await fetch('/api/quotes', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          user_name: user.name || name,
          user_email: user.email || email,
          user_phone: phone,
          company: '',
          requirements,
          budget: budget || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao criar cotação:', response.status, errorData);
        throw new Error(errorData.error || 'Erro ao enviar solicitação');
      }

      const data = await response.json();
      console.log('✅ Cotação criada:', data.quote?.quote_number);

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onBack();
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting quote request:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <FileText className="h-16 w-16 text-[#E31E24] mx-auto mb-4" />
            <h1 className="text-3xl mb-2">Solicitar Orçamento</h1>
            <p className="text-gray-600">
              Descreva suas necessidades e receba uma proposta personalizada da KZSTORE
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Solicitação Enviada!</h3>
              <p className="text-gray-600">
                Nossa equipe irá analisar sua solicitação e enviar uma proposta em breve.
                <br />
                Entraremos em contato através do email e telefone fornecidos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefone/WhatsApp *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 900 000 000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição do que precisa *
                </label>
                <Textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Descreva em detalhe o que você precisa. Exemplo: 10 laptops Dell i5, 8GB RAM, SSD 256GB para uso em escritório"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Orçamento Disponível (opcional)
                </label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Ex: 500000 AOA"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Informe seu orçamento para recebermos uma proposta mais adequada
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E31E24] hover:bg-[#C41A1F]"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação de Orçamento'}
              </Button>

              <p className="text-xs text-center text-gray-500">
                * Campos obrigatórios
              </p>
            </form>
          )}
        </Card>

        {/* Info adicional */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <h3 className="font-semibold mb-2">Resposta Rápida</h3>
            <p className="text-sm text-gray-600">
              Receba uma proposta em até 24 horas
            </p>
          </Card>
          <Card className="p-4 text-center">
            <h3 className="font-semibold mb-2">Preços Competitivos</h3>
            <p className="text-sm text-gray-600">
              Melhores preços do mercado angolano
            </p>
          </Card>
          <Card className="p-4 text-center">
            <h3 className="font-semibold mb-2">Suporte Técnico</h3>
            <p className="text-sm text-gray-600">
              Equipe especializada para ajudar
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
