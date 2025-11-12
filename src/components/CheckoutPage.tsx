import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Building, Smartphone, User, Mail, Phone, MapPin, FileText, Package, Shield, Truck, MessageCircle, Copy, Check, Edit, Ticket, X } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { useKZStore } from '../hooks/useKZStore';
import { useAuth } from '../hooks/useAuth';
import { useFlashSales } from '../hooks/useFlashSales';
import { AdBanner } from './AdBanner';
import { BANK_ACCOUNTS, COMPANY_INFO } from '../config/constants';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { CouponInput } from './CouponInput';

type CheckoutPageProps = {
  cart: CartItem[];
  cartTotal: number;
  onOrderComplete: () => void;
  onBack: () => void;
};

type PaymentMethod = 'multicaixa' | 'bank_transfer' | 'reference';
type Step = 'info' | 'payment' | 'confirmation';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  description: string;
};

export function CheckoutPage({ cart, cartTotal, onOrderComplete, onBack }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa');
  const [orderNumber, setOrderNumber] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { flashSales } = useFlashSales();
  
  // Loyalty program states
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  
  const { createOrder } = useKZStore();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: 'Luanda',
    observacoes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Preencher dados automaticamente quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      console.log('✅ Preenchendo dados do usuário:', user);
      setFormData(prev => ({
        ...prev,
        nome: user.nome || user.name || '',
        telefone: user.telefone || user.phone || '',
        email: user.email || '',
        endereco: user.endereco || ''
      }));
      
      // Carregar pontos de fidelidade
      loadLoyaltyPoints();
    }
  }, [user]);

  // Carregar pontos de fidelidade do usuário
  const loadLoyaltyPoints = async () => {
    if (!user?.email || !user?.access_token) return;
    
    try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/user/${user.email}`,
            {
              headers: {
                'Authorization': `Bearer ${user.access_token}`
              }
            }
          );      if (response.ok) {
        const data = await response.json();
        setLoyaltyPoints(data.available_points || 0);
        console.log('✅ Pontos de fidelidade:', data.available_points);
      }
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
    }
  };

  // Helper: calcula preço com desconto de flash sale
  const getItemPrice = (item: CartItem) => {
    const flashSale = flashSales.find(sale => 
      sale.product_id === item.product.id && sale.is_active
    );
    
    if (flashSale) {
      return item.product.preco_aoa * (1 - flashSale.discount_percentage / 100);
    }
    
    return item.product.preco_aoa;
  };

  // Safe calculation of cart total with flash sale discounts
  const safeCartTotal = cartTotal || cart.reduce((total, item) => {
    const itemPrice = getItemPrice(item);
    return total + (itemPrice * (item.quantity || 0));
  }, 0);

  const shippingCost = 5000;

  // Calcular desconto de pontos (1 ponto = 10 AOA)
  const pointsDiscount = usePoints ? Math.min(pointsToUse * 10, safeCartTotal) : 0;

  // Calcular desconto do cupom
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.floor(safeCartTotal * (appliedCoupon.discount_value / 100))
      : appliedCoupon.discount_value
    : 0;

  console.log('🧾 Checkout calculations:', {
    safeCartTotal,
    shippingCost,
    pointsDiscount,
    couponDiscount,
    appliedCoupon: appliedCoupon ? {
      code: appliedCoupon.code,
      discount_type: appliedCoupon.discount_type,
      discount_value: appliedCoupon.discount_value,
      min_purchase: appliedCoupon.min_purchase
    } : null
  });

  // Total final com todos os descontos
  const total = Math.max(0, safeCartTotal + shippingCost - pointsDiscount - couponDiscount);

  console.log('🧾 Final total calculated:', total);

  // Handlers para cupons
  const handleCouponApply = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!formData.telefone.trim()) errors.telefone = 'Telefone é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
    if (!formData.endereco.trim()) errors.endereco = 'Endereço é obrigatório';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('payment');
    }
  };

  const handleConfirmPayment = async () => {
    setIsCreatingOrder(true);
    try {
      const orderData = {
        user_id: user?.id || null,
        customer_name: formData.nome,
        customer_email: formData.email,
        customer_phone: formData.telefone,
        customer_address: `${formData.endereco}, ${formData.cidade}${formData.observacoes ? ` - ${formData.observacoes}` : ''}`,
        items: cart.map(item => {
          const flashSale = flashSales.find(sale => 
            sale.product_id === item.product.id && sale.is_active
          );
          const itemPrice = flashSale 
            ? item.product.preco_aoa * (1 - flashSale.discount_percentage / 100)
            : item.product.preco_aoa;
          
          return {
            product_id: item.product.id,
            product_nome: item.product.nome,
            quantity: item.quantity,
            preco_aoa: Math.floor(itemPrice)
          };
        }),
        total: Math.floor(total),
        payment_method: paymentMethod === 'multicaixa' ? 'Multicaixa Express' : 
                       paymentMethod === 'bank_transfer' ? 'Transferência Bancária' : 
                       'Referência Bancária',
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: Math.floor(couponDiscount)
      };
      
      console.log('📦 Creating order:', orderData);
      const order = await createOrder(orderData);
      const orderId = order.order_number || order.id || `KZ${Date.now().toString().slice(-8)}`;
      setOrderNumber(orderId);
      
      // ✨ FIDELIDADE: Resgatar pontos se o usuário optou por usar
      if (user && usePoints && pointsToUse > 0) {
        try {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;
          
          const redeemResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/redeem`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                customer_email: user.email,
                points: pointsToUse,
                description: `Resgate no pedido #${orderId}`
              })
            }
          );
          
          if (redeemResponse.ok) {
            console.log(`✨ ${pointsToUse} pontos resgatados com sucesso`);
            toast.success(`${pointsToUse} pontos utilizados! Desconto de ${(pointsToUse * 10).toLocaleString('pt-AO')} AOA aplicado.`);
          }
        } catch (err) {
          console.error('Erro ao resgatar pontos:', err);
        }
      }
      
      // ✨ FIDELIDADE: Adicionar pontos pela compra (1% do valor do pedido)
      if (user && user.email && user.access_token) {
        try {
          const pointsToAdd = Math.floor(safeCartTotal * 0.01);
          
          const addPointsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd/loyalty/add-points`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                customer_email: user.email,
                points: pointsToAdd,
                description: `Compra #${orderId}`,
                order_id: orderId
              })
            }
          );
          
          if (addPointsResponse.ok) {
            console.log(`✨ ${pointsToAdd} pontos adicionados à conta do cliente`);
            toast.success(`Você ganhou ${pointsToAdd} pontos de fidelidade! 🎉`);
          }
        } catch (error) {
          console.error('Erro ao adicionar pontos:', error);
          // Não bloqueia o checkout se falhar
        }
      }
      
      setStep('confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao criar pedido. Por favor, tente novamente.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    let message = `*Novo Pedido - KZSTORE*\n\n`;
    message += `*Pedido:* ${orderNumber}\n\n`;
    message += `*Cliente:*\n`;
    message += `Nome: ${formData.nome}\n`;
    message += `Telefone: ${formData.telefone}\n`;
    message += `Email: ${formData.email}\n`;
    message += `Endereço: ${formData.endereco}, ${formData.cidade}\n\n`;
    message += `*Produtos:*\n`;
    cart.forEach(item => {
      const itemPrice = getItemPrice(item);
      message += `• ${item.product.nome} (${item.quantity}x) - ${(itemPrice * item.quantity).toLocaleString('pt-AO')} AOA\n`;
    });
    message += `\n*Subtotal:* ${safeCartTotal.toLocaleString('pt-AO')} AOA\n`;
    message += `*Frete:* ${shippingCost.toLocaleString('pt-AO')} AOA\n`;
    if (couponDiscount > 0 && appliedCoupon) {
      message += `*Cupom (${appliedCoupon.code}):* -${couponDiscount.toLocaleString('pt-AO')} AOA\n`;
    }
    if (pointsDiscount > 0) {
      message += `*Desconto (${pointsToUse} pontos):* -${pointsDiscount.toLocaleString('pt-AO')} AOA\n`;
    }
    message += `*Total:* ${total.toLocaleString('pt-AO')} AOA\n`;
    message += `*Pagamento:* ${
      paymentMethod === 'multicaixa' ? 'Multicaixa Express' : 
      paymentMethod === 'bank_transfer' ? 'Transferência Bancária' : 
      'Referência Bancária'
    }`;
    
    if (formData.observacoes) {
      message += `\n\n*Observações:* ${formData.observacoes}`;
    }
    
    const whatsappUrl = `https://wa.me/244931054015?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const paymentMethods = [
    {
      id: 'multicaixa' as PaymentMethod,
      icon: Smartphone,
      title: 'Multicaixa Express',
      description: 'Pagamento rápido via app',
      badge: 'Recomendado',
      color: 'blue'
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      icon: Building,
      title: 'Transferência Bancária',
      description: 'Transferência direta',
      color: 'yellow'
    },
    {
      id: 'reference' as PaymentMethod,
      icon: CreditCard,
      title: 'Referência Bancária',
      description: 'Pagamento na agência',
      color: 'green'
    }
  ];

  const steps = [
    { id: 'info', label: 'Informações', icon: User },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmação', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group mb-4"
          >
            <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Carrinho</span>
          </button>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 flex-1 ${
                  step === s.id ? 'opacity-100' : 
                  steps.findIndex(st => st.id === step) > index ? 'opacity-100' : 
                  'opacity-40'
                }`}>
                  <div className={`size-12 rounded-xl flex items-center justify-center ${
                    step === s.id 
                      ? 'bg-red-600 text-white' 
                      : steps.findIndex(st => st.id === step) > index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } transition-all`}>
                    {steps.findIndex(st => st.id === step) > index ? (
                      <CheckCircle className="size-6" />
                    ) : (
                      <s.icon className="size-6" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500">Passo {index + 1} de 3</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full ${
                    steps.findIndex(st => st.id === step) > index ? 'bg-green-600' : 'bg-gray-200'
                  } transition-all`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Customer Information */}
            {step === 'info' && (
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 animate-slide-in-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Entrega</h2>
                
                {/* User info notice */}
                {user && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <User className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-1">Dados da sua conta</p>
                        <p className="text-sm text-blue-700">
                          Suas informações foram preenchidas automaticamente. Você pode editá-las se necessário.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmitInfo} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                          formErrors.nome ? 'border-red-300' : 'border-gray-200'
                        } focus:border-red-600 focus:outline-none transition-all`}
                        placeholder="João Silva"
                      />
                    </div>
                    {formErrors.nome && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Telefone & Email */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                            formErrors.telefone ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="+244 900 000 000"
                        />
                      </div>
                      {formErrors.telefone && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.telefone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                            formErrors.email ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="joao@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Endereço Completo *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 size-5 text-gray-400" />
                      <textarea
                        value={formData.endereco}
                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                        rows={3}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                          formErrors.endereco ? 'border-red-300' : 'border-gray-200'
                        } focus:border-red-600 focus:outline-none transition-all resize-none`}
                        placeholder="Rua, número, bairro..."
                      />
                    </div>
                    {formErrors.endereco && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.endereco}</p>
                    )}
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <select
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                    >
                      <option value="Luanda">Luanda</option>
                      <option value="Benguela">Benguela</option>
                      <option value="Huambo">Huambo</option>
                      <option value="Lobito">Lobito</option>
                      <option value="Cabinda">Cabinda</option>
                      <option value="Lubango">Lubango</option>
                    </select>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observações (Opcional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 size-5 text-gray-400" />
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange('observacoes', e.target.value)}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all resize-none"
                        placeholder="Instruções especiais de entrega..."
                      />
                    </div>
                  </div>

                  {/* Coupon Input - Early Access */}
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Ticket className="size-5 text-gray-600" />
                      Cupom de Desconto (Opcional)
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Aproveite para aplicar seu cupom antes de continuar
                    </p>
                    <CouponInput
                      cartTotal={safeCartTotal}
                      onCouponApply={handleCouponApply}
                      onCouponRemove={handleCouponRemove}
                      appliedCoupon={appliedCoupon}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                  >
                    Continuar para Pagamento
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 'payment' && (
              <div className="space-y-6 animate-slide-in-left">
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Método de Pagamento</h2>
                  
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                          paymentMethod === method.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-12 rounded-xl flex items-center justify-center ${
                            method.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            method.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            <method.icon className="size-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{method.title}</h3>
                              {method.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          <div className={`size-6 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id
                              ? 'border-red-600 bg-red-600'
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === method.id && (
                              <div className="size-3 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">Pagamento Seguro</p>
                      <p className="text-sm text-blue-700">
                        Após confirmar o pedido, você receberá as instruções de pagamento detalhadas 
                        via WhatsApp e email.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loyalty Points Section */}
                {user && loyaltyPoints >= 1000 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Ticket className="size-5 text-purple-600" />
                          Usar Pontos de Fidelidade
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Você tem <span className="font-bold text-purple-600">{loyaltyPoints.toLocaleString('pt-AO')}</span> pontos disponíveis
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={(e) => {
                            setUsePoints(e.target.checked);
                            if (!e.target.checked) setPointsToUse(0);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    
                    {usePoints && (
                      <div className="space-y-3 animate-slide-in-left">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantidade de pontos a usar
                          </label>
                          <input
                            type="number"
                            min="1000"
                            max={Math.min(loyaltyPoints, Math.floor(safeCartTotal / 10))}
                            step="100"
                            value={pointsToUse}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              const maxPoints = Math.min(loyaltyPoints, Math.floor(safeCartTotal / 10));
                              setPointsToUse(Math.min(value, maxPoints));
                            }}
                            placeholder="Mínimo 1000 pontos"
                            className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-600 focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Máximo: {Math.min(loyaltyPoints, Math.floor(safeCartTotal / 10)).toLocaleString('pt-AO')} pontos
                          </p>
                        </div>
                        
                        {pointsToUse >= 1000 && (
                          <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Desconto com pontos:</span>
                              <span className="text-lg font-bold text-green-600">
                                -{(pointsToUse * 10).toLocaleString('pt-AO')} AOA
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Usando {pointsToUse.toLocaleString('pt-AO')} pontos
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Coupon Input */}
                <CouponInput
                  cartTotal={safeCartTotal}
                  onCouponApply={handleCouponApply}
                  onCouponRemove={handleCouponRemove}
                  appliedCoupon={appliedCoupon}
                />

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep('info')}
                    variant="outline"
                    className="flex-1 py-4 rounded-xl border-2"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isCreatingOrder}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                  >
                    {isCreatingOrder ? 'Processando...' : 'Confirmar Pedido'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirmation' && (
              <div className="animate-scale-in">
                {/* Success Message */}
                <div className="bg-white rounded-2xl p-8 border-2 border-green-200 mb-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 text-green-600 mb-4">
                      <CheckCircle className="size-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Pedido Confirmado!
                    </h2>
                    <p className="text-lg text-gray-600">
                      Seu pedido foi recebido com sucesso
                    </p>
                  </div>

                  {/* Order Number */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="text-sm text-gray-600 mb-2 text-center">Número do Pedido</p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-3xl font-bold text-red-600">#{orderNumber}</p>
                      <button
                        onClick={handleCopyReference}
                        className="size-10 rounded-lg bg-white border-2 border-gray-200 hover:border-red-600 flex items-center justify-center transition-all"
                        title="Copiar referência"
                      >
                        {copied ? (
                          <Check className="size-5 text-green-600" />
                        ) : (
                          <Copy className="size-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <CreditCard className="size-5" />
                      Instruções de Pagamento
                    </h3>
                    {paymentMethod === 'multicaixa' && (
                      <div className="text-sm text-blue-700 space-y-2">
                        <p><strong>1.</strong> Abra o app Multicaixa Express</p>
                        <p><strong>2.</strong> Selecione "Pagamentos"</p>
                        <p><strong>3.</strong> Use a referência: <strong>#{orderNumber}</strong></p>
                        <p><strong>4.</strong> Valor: <strong>{total.toLocaleString('pt-AO')} AOA</strong></p>
                      </div>
                    )}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="text-sm text-blue-700 space-y-2">
                        <p><strong>Banco:</strong> {BANK_ACCOUNTS.bai.name}</p>
                        <p><strong>IBAN:</strong> {BANK_ACCOUNTS.bai.iban}</p>
                        <p><strong>Titular:</strong> {BANK_ACCOUNTS.bai.titular}</p>
                        <p><strong>Referência:</strong> #{orderNumber}</p>
                        <p><strong>Valor:</strong> {total.toLocaleString('pt-AO')} AOA</p>
                      </div>
                    )}
                    {paymentMethod === 'reference' && (
                      <div className="text-sm text-blue-700 space-y-2">
                        <p><strong>1.</strong> Dirija-se a qualquer agência do BAI</p>
                        <p><strong>2.</strong> Informe a referência: <strong>#{orderNumber}</strong></p>
                        <p><strong>3.</strong> Efetue o pagamento de <strong>{total.toLocaleString('pt-AO')} AOA</strong></p>
                        <p><strong>4.</strong> Guarde o comprovante</p>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold mb-4"
                  >
                    <MessageCircle className="size-5" />
                    Enviar Pedido via WhatsApp
                  </button>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={onOrderComplete}
                      variant="outline"
                      className="flex-1 py-3 rounded-xl border-2"
                    >
                      Voltar à Loja
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
                    >
                      Imprimir Pedido
                    </Button>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Próximos Passos</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="size-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Efetue o Pagamento</p>
                        <p className="text-sm text-gray-600">
                          Siga as instruções acima para completar o pagamento
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="size-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Confirmação</p>
                        <p className="text-sm text-gray-600">
                          Aguarde a confirmação do pagamento (até 2 horas úteis)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Preparação</p>
                        <p className="text-sm text-gray-600">
                          Seu pedido será preparado para envio
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="size-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Entrega</p>
                        <p className="text-sm text-gray-600">
                          Receba em 24-48 horas em Luanda
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 border-2 border-gray-100 animate-slide-in-right">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const flashSale = flashSales.find(sale => 
                    sale.product_id === item.product.id && sale.is_active
                  );
                  const itemPrice = getItemPrice(item);
                  const hasDiscount = flashSale !== undefined;

                  return (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="size-16 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden relative">
                        <img 
                          src={item.product.imagem_url} 
                          alt={item.product.nome}
                          className="w-full h-full object-cover"
                        />
                        {hasDiscount && (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-orange-500/90 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">-{flashSale.discount_percentage}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.product.nome}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600">
                            {item.quantity}x {Math.floor(itemPrice).toLocaleString('pt-AO')} AOA
                          </p>
                          {hasDiscount && (
                            <span className="text-xs text-red-600 font-semibold">🔥 Flash Sale</span>
                          )}
                        </div>
                        {hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">
                            {item.product.preco_aoa.toLocaleString('pt-AO')} AOA
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="divider mb-6" />

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{safeCartTotal.toLocaleString('pt-AO')} AOA</span>
                </div>
                
                {/* Flash Sale Savings */}
                {(() => {
                  const originalTotal = cart.reduce((total, item) => 
                    total + (item.product.preco_aoa * item.quantity), 0
                  );
                  const flashSavings = originalTotal - safeCartTotal;
                  
                  if (flashSavings > 0) {
                    return (
                      <div className="flex justify-between text-green-600">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚡</span>
                          <span>Flash Sale</span>
                        </div>
                        <span className="font-semibold">-{Math.floor(flashSavings).toLocaleString('pt-AO')} AOA</span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4" />
                    <span>Frete</span>
                  </div>
                  <span className="font-semibold">{shippingCost.toLocaleString('pt-AO')} AOA</span>
                </div>

                {/* Coupon Discount */}
                {couponDiscount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4" />
                      <span>Cupom ({appliedCoupon.code})</span>
                    </div>
                    <span className="font-semibold">-{couponDiscount.toLocaleString('pt-AO')} AOA</span>
                  </div>
                )}

                {/* Points Discount */}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Desconto com Pontos</span>
                    <span className="font-semibold">-{pointsDiscount.toLocaleString('pt-AO')} AOA</span>
                  </div>
                )}

                <div className="divider" />
                
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <p className="text-2xl font-bold text-red-600">
                    {total.toLocaleString('pt-AO')} AOA
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-green-600" />
                  <span className="text-sm text-gray-700">Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="size-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Entrega Rápida Garantida</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="size-5 text-yellow-600" />
                  <span className="text-sm text-gray-700">Produtos Originais</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdBanner position="checkout-banner" />
      </div>
    </div>
  );
}