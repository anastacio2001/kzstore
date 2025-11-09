import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FileText, Send, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface QuoteItem {
  id: string;
  product_name: string;
  quantity: number;
  notes: string;
}

export default function QuoteRequestForm() {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: crypto.randomUUID(), product_name: '', quantity: 1, notes: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function addItem() {
    setItems([...items, { id: crypto.randomUUID(), product_name: '', quantity: 1, notes: '' }]);
  }

  function removeItem(id: string) {
    if (items.length === 1) {
      toast.error('Mantenha pelo menos um item');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  }

  function updateItem(id: string, field: keyof QuoteItem, value: any) {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const hasEmptyItems = items.some(item => !item.product_name.trim() || item.quantity <= 0);
    if (hasEmptyItems) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    try {
      setSubmitting(true);

      // Create quote request
      const { data: quoteData, error: quoteError } = await supabase
        .from('custom_quotes')
        .insert({
          user_id: user?.id || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_company: customerCompany || null,
          additional_notes: additionalNotes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create quote items
      const itemsToInsert = items.map(item => ({
        quote_id: quoteData.id,
        product_name: item.product_name,
        quantity: item.quantity,
        notes: item.notes || null
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast.success('✅ Orçamento solicitado com sucesso! Você receberá uma resposta em até 24h.');
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCompany('');
      setItems([{ id: crypto.randomUUID(), product_name: '', quantity: 1, notes: '' }]);
      setAdditionalNotes('');
    } catch (error: any) {
      console.error('Error submitting quote request:', error);
      toast.error('Erro ao solicitar orçamento');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-500/20 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Solicitar Orçamento</h1>
            <p className="text-gray-400 text-sm">
              Preencha os dados e receberá uma proposta personalizada em até 24h
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Dados de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Empresa (Opcional)
                </label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nome da empresa"
                />
              </div>
            </div>
          </div>

          {/* Quote Items */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Itens do Orçamento</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-400">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Produto *
                      </label>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Ex: iPhone 15 Pro Max 256GB"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Observações (Opcional)
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Ex: Cor preta, com garantia estendida"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Informações Adicionais (Opcional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={4}
              placeholder="Ex: Preciso de nota fiscal, prazo de entrega urgente, forma de pagamento preferida..."
            />
          </div>

          {/* Info Card */}
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 <strong>Dica:</strong> Seja o mais específico possível sobre os produtos desejados.
              Inclua detalhes como modelo, cor, capacidade e quantidade para receber um orçamento mais preciso.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Solicitar Orçamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
