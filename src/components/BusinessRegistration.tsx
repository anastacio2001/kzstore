import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building, Send, FileText, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function BusinessRegistration() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [monthlyPurchaseVolume, setMonthlyPurchaseVolume] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!companyName.trim() || !cnpj.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validate CNPJ format (basic validation)
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      toast.error('CNPJ deve conter 14 dígitos');
      return;
    }

    try {
      setSubmitting(true);

      // Check if already registered
      const { data: existing } = await supabase
        .from('business_accounts')
        .select('id')
        .eq('cnpj', cnpjNumbers)
        .maybeSingle();

      if (existing) {
        toast.error('Este CNPJ já está cadastrado');
        return;
      }

      // Create business account
      const { error } = await supabase
        .from('business_accounts')
        .insert({
          user_id: user?.id || null,
          company_name: companyName,
          cnpj: cnpjNumbers,
          trade_name: tradeName || null,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address: address || null,
          city: city || null,
          state: state || null,
          zip_code: zipCode || null,
          monthly_purchase_volume: monthlyPurchaseVolume || null,
          business_description: businessDescription || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('✅ Cadastro enviado com sucesso! Analisaremos sua solicitação em até 48h.');
      
      // Reset form
      setCompanyName('');
      setCnpj('');
      setTradeName('');
      setContactName('');
      setContactPhone('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setMonthlyPurchaseVolume('');
      setBusinessDescription('');
    } catch (error: any) {
      console.error('Error registering business:', error);
      toast.error('Erro ao enviar cadastro');
    } finally {
      setSubmitting(false);
    }
  }

  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  }

  function formatZipCode(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <Building className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cadastro B2B</h1>
            <p className="text-gray-400 text-sm">
              Solicite uma conta empresarial e tenha acesso a preços especiais e condições exclusivas
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            ✨ Vantagens da Conta B2B
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• <strong>Descontos Progressivos:</strong> Quanto mais comprar, mais economiza</li>
            <li>• <strong>Preços Exclusivos:</strong> Valores diferenciados para revendedores</li>
            <li>• <strong>Pagamento Facilitado:</strong> Condições especiais de pagamento</li>
            <li>• <strong>Pedidos em Lote:</strong> Compre grandes quantidades com facilidade</li>
            <li>• <strong>Nota Fiscal:</strong> Emissão automática para todas as compras</li>
            <li>• <strong>Atendimento Prioritário:</strong> Suporte dedicado para empresas</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Dados da Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: KZ STORE COMERCIO DE ELETRONICOS LTDA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome Fantasia (Opcional)
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: KZ Store"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Dados de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contato@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Endereço (Opcional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Estado
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="RS">Rio Grande do Sul</option>
                    {/* Add more states as needed */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Informações do Negócio</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Volume Mensal de Compras (Opcional)
              </label>
              <select
                value={monthlyPurchaseVolume}
                onChange={(e) => setMonthlyPurchaseVolume(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma faixa</option>
                <option value="0-5000">Até R$ 5.000</option>
                <option value="5000-15000">R$ 5.000 - R$ 15.000</option>
                <option value="15000-30000">R$ 15.000 - R$ 30.000</option>
                <option value="30000-50000">R$ 30.000 - R$ 50.000</option>
                <option value="50000+">Acima de R$ 50.000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Descreva seu Negócio (Opcional)
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Ex: Revenda de produtos eletrônicos no varejo online e físico, atendemos clientes em todo o estado de SP..."
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              Ao enviar este formulário, você concorda com nossos{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Termos de Serviço B2B</a>
              {' '}e{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">Política de Privacidade</a>.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Cadastro
              </>
            )}
          </button>

          <p className="text-center text-gray-400 text-sm">
            ⏱️ Após análise, você receberá um e-mail com a confirmação e instruções de acesso em até 48h úteis.
          </p>
        </form>
      </div>
    </div>
  );
}
