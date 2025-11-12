import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building, Send, FileText, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../utils/supabase/client';

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

    console.log('📝 Submitting B2B form...', {
      companyName,
      cnpj,
      contactName,
      contactEmail,
      contactPhone
    });

    if (!companyName.trim() || !cnpj.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      console.error('❌ Missing required fields');
      return;
    }

    // Validate NIF format (9 digits for Angola)
    const nifNumbers = cnpj.replace(/\D/g, '');
    console.log('🔢 NIF validation:', { raw: cnpj, clean: nifNumbers, length: nifNumbers.length });
    
    if (nifNumbers.length !== 9) {
      toast.error('NIF deve conter 9 dígitos');
      console.error('❌ Invalid NIF length:', nifNumbers.length);
      return;
    }

    try {
      setSubmitting(true);
      console.log('🚀 Checking if NIF already exists...');

      // Check if already registered
      const { data: existing } = await supabase
        .from('business_accounts')
        .select('id')
        .eq('cnpj', nifNumbers)
        .maybeSingle();

      if (existing) {
        toast.error('Este NIF já está cadastrado');
        console.error('❌ NIF already registered');
        return;
      }

      console.log('✅ NIF available, creating account...');

      // Create business account
      const { data, error } = await supabase
        .from('business_accounts')
        .insert({
          user_id: user?.id || null,
          company_name: companyName,
          cnpj: nifNumbers,
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
        })
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Account created successfully:', data);
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
      console.error('❌ Error registering business:', error);
      toast.error(`Erro ao enviar cadastro: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function formatCNPJ(value: string) {
    // NIF angolano: apenas 9 dígitos sem formatação especial
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 9);
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
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro B2B</h1>
            <p className="text-gray-600 text-sm">
              Solicite uma conta empresarial e tenha acesso a preços especiais e condições exclusivas
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            ✨ Vantagens da Conta B2B
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
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
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: KZ STORE COMERCIO DE ELETRONICOS LTDA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF *
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000000"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia (Opcional)
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: KZ Store"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contato@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+244 9XX XXX XXX"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço (Opcional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Luanda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Província
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Luanda">Luanda</option>
                    <option value="Bengo">Bengo</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Bié">Bié</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Cuando Cubango">Cuando Cubango</option>
                    <option value="Cuanza Norte">Cuanza Norte</option>
                    <option value="Cuanza Sul">Cuanza Sul</option>
                    <option value="Cunene">Cunene</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Huíla">Huíla</option>
                    <option value="Lunda Norte">Lunda Norte</option>
                    <option value="Lunda Sul">Lunda Sul</option>
                    <option value="Malanje">Malanje</option>
                    <option value="Moxico">Moxico</option>
                    <option value="Namibe">Namibe</option>
                    <option value="Uíge">Uíge</option>
                    <option value="Zaire">Zaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Negócio</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume Mensal de Compras (Opcional)
              </label>
              <select
                value={monthlyPurchaseVolume}
                onChange={(e) => setMonthlyPurchaseVolume(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma faixa</option>
                <option value="0-50000">Até 50.000 Kz</option>
                <option value="50000-150000">50.000 Kz - 150.000 Kz</option>
                <option value="150000-300000">150.000 Kz - 300.000 Kz</option>
                <option value="300000-500000">300.000 Kz - 500.000 Kz</option>
                <option value="500000+">Acima de 500.000 Kz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descreva seu Negócio (Opcional)
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Ex: Revenda de produtos eletrônicos no varejo online e físico, atendemos clientes em toda província de Luanda..."
              />
            </div>
          </div>

          {/* Terms */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">
              Ao enviar este formulário, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Termos de Serviço B2B</a>
              {' '}e{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Política de Privacidade</a>.
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

          <p className="text-center text-gray-600 text-sm">
            ⏱️ Após análise, você receberá um e-mail com a confirmação e instruções de acesso em até 48h úteis.
          </p>
        </form>
      </div>
    </div>
  );
}
