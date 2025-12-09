import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, CreditCard, Building, Smartphone, User, Mail, Phone, MapPin, FileText, Package, Shield, Truck, MessageCircle, Copy, Check, Edit, Ticket, X } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { useAuth } from '../hooks/useAuth';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { AdBanner } from './AdBanner';
import { FlashSaleBanner } from './FlashSaleBanner';
import { BANK_ACCOUNTS, COMPANY_INFO } from '../config/constants';
import { toast } from 'sonner';
import { CouponInput } from './CouponInput';
import AvailableCoupons from './AvailableCoupons';
import { ShippingCalculator } from './ShippingCalculator'; // BUILD 131
import { createOrder, validateStock, OrderItem } from '../services/ordersService';
import { incrementCouponUsage } from '../services/couponsService';
import { copyToClipboard } from '../utils/clipboard';

type CheckoutPageProps = {
  cart: CartItem[];
  cartTotal: number;
  onOrderComplete: () => void;
  onBack: () => void;
  onViewProduct?: (productId: string) => void;
  onNavigateToProduct?: (product: any) => void;
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

export function CheckoutPage({ cart, cartTotal, onOrderComplete, onBack, onViewProduct, onNavigateToProduct }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('multicaixa');
  const [orderNumber, setOrderNumber] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [dynamicShippingCost, setDynamicShippingCost] = useState(3500); // BUILD 131: Dynamic shipping

  const { user: supabaseUser } = useAuth();
  const { user: localUser, quickLogin } = useLocalAuth();

  // Usar Supabase user se disponível, senão usar local user
  const user = supabaseUser || localUser;
  
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
    }
  }, [user]);

  // Verificar se é compra como convidado
  const isGuestCheckout = !user;

  // Safe calculation of cart total if not provided
  const safeCartTotal = cartTotal || cart.reduce((total, item) => 
    total + ((item.product?.preco_aoa || 0) * (item.quantity || 0)), 0
  ) || 0;

  // Check if cart has flash sale products
  const hasFlashSaleProducts = cart.some(item => (item.product as any).is_flash_sale);

  // Calculate shipping cost - PEGA O MAIOR frete fixo entre produtos (não soma)
  const shippingCost = cart.reduce((maxShipping, item) => {
    const product = item.product;
    const shippingType = product?.shipping_type || 'dynamic';
    
    console.log('🚚 [Frete] Produto:', product?.nome);
    console.log('🚚 [Frete] Tipo:', shippingType);
    
    // 🎁 Frete grátis
    if (shippingType === 'free' || shippingType === 'free_all') {
      console.log('✅ [Frete] GRÁTIS');
      return maxShipping;
    }
    
    // 💰 Frete pago fixo - NÃO multiplica por quantidade
    if (shippingType === 'paid' || shippingType === 'paid_fixed') {
      const shippingCostAoa = product?.shipping_cost_aoa || 0;
      console.log('💰 [Frete] Fixo:', shippingCostAoa);
      // Retorna o MAIOR frete entre os produtos (não soma)
      return Math.max(maxShipping, shippingCostAoa);
    }
    
    // 🧮 Frete dinâmico - calculado depois
    console.log('🧮 [Frete] Dinâmico');
    return maxShipping;
  }, 0);
  
  console.log('📦 [Frete] Custo calculado:', shippingCost);
  
  // Verificar se algum produto tem frete fixo (paid/paid_fixed)
  const hasFixedShipping = cart.some(item => {
    const type = item.product?.shipping_type;
    return type === 'paid' || type === 'paid_fixed';
  });
  console.log('🔍 [Frete] Tem frete fixo?', hasFixedShipping);
  
  // Calculate discount from applied coupon (only if no flash sale products)
  const discountAmount = appliedCoupon && !hasFlashSaleProducts
    ? appliedCoupon.discount_type === 'percentage'
      ? (safeCartTotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;
  
  const safeDiscountAmount = Number(discountAmount) || 0;
  
  // Verificar se todos produtos têm frete grátis
  const allProductsFreeShipping = cart.length > 0 && cart.every(item => {
    const shippingType = item.product?.shipping_type || 'dynamic';
    return shippingType === 'free' || shippingType === 'free_all';
  });
  
  console.log('✅ [Frete] Todos grátis?', allProductsFreeShipping);
  console.log('💵 [Frete] Frete dinâmico:', dynamicShippingCost);
  console.log('📊 [Frete] Shipping cost calculado:', shippingCost);
  console.log('🔍 [Frete] Has fixed shipping?', hasFixedShipping);
  
  // Lógica SIMPLES de frete final:
  // 1. Todos grátis? → 0
  // 2. Tem paid/paid_fixed? → usa shippingCost
  // 3. Caso contrário (dynamic) → usa dynamicShippingCost
  const finalShippingCost = allProductsFreeShipping ? 0 : 
                            hasFixedShipping ? shippingCost :
                            dynamicShippingCost;
  
  const safeFinalShippingCost = Number(finalShippingCost) || 0;
  
  console.log('🎯 [Frete] FINAL:', safeFinalShippingCost);
  
  const total = Number(safeCartTotal) + safeFinalShippingCost - safeDiscountAmount;

  // BUILD 131: Handle dynamic shipping calculation
  const handleShippingCalculated = (cost: number, days: number) => {
    setDynamicShippingCost(cost);
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
    console.log('🔥 [CHECKOUT] handleConfirmPayment chamado');
    console.log('🔥 [CHECKOUT] User:', user);
    console.log('🔥 [CHECKOUT] Cart:', cart);
    console.log('🔥 [CHECKOUT] Payment Method:', paymentMethod);
    
    // Validar carrinho
    if (cart.length === 0) {
      console.error('❌ [CHECKOUT] Carrinho vazio');
      toast.error('Carrinho vazio. Adicione produtos antes de finalizar.');
      return;
    }

    setIsCreatingOrder(true);
    try {
      // 1. Preparar itens do pedido
      console.log('🛒 [CHECKOUT] Cart items:', cart);
      
      const orderItems: OrderItem[] = cart.map(item => {
        console.log('🔍 [CHECKOUT] Processing cart item:', {
          product_id: item.product.id,
          product_name: item.product.nome,
          kv_key_to_search: `product:${item.product.id}`
        });
        
        return {
          product_id: item.product.id,
          product_name: item.product.nome,
          product_image: item.product.imagem_url || '',
          quantity: item.quantity,
          price: item.product.preco_aoa,
          subtotal: item.product.preco_aoa * item.quantity
        };
      });
      
      console.log('📦 [CHECKOUT] Order items prepared:', orderItems);

      // 2. Validar estoque antes de criar pedido
      toast.info('Validando estoque...');
      const stockValidation = await validateStock(orderItems);
      if (!stockValidation.valid) {
        toast.error('Estoque insuficiente');
        alert(stockValidation.errors.join('\n'));
        return;
      }

      // 3. Calcular desconto do cupom
      let discountAmount = 0;
      let discountDetails = '';
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
          discountAmount = (safeCartTotal * appliedCoupon.discount_value) / 100;
          discountDetails = `Cupom ${appliedCoupon.code} - ${appliedCoupon.discount_value}% de desconto`;
        } else {
          discountAmount = appliedCoupon.discount_value;
          discountDetails = `Cupom ${appliedCoupon.code} - ${appliedCoupon.discount_value} Kz de desconto`;
        }
      }

      // 4. Preparar endereço de entrega
      const shippingAddress = {
        full_name: formData.nome,
        phone: formData.telefone,
        province: formData.cidade,
        city: formData.cidade,
        address: formData.endereco,
      };

      // 5. Fazer login automático se não estiver autenticado
      let currentUser = user;
      if (!currentUser) {
        console.log('🔵 [CHECKOUT] No user logged in, creating local session...');
        toast.info('Criando sessão...');
        currentUser = await quickLogin(formData.email, formData.nome, formData.telefone);
        console.log('✅ [CHECKOUT] Local session created:', currentUser.id);
      }

      const userId = currentUser?.id || 'guest';
      console.log('🔥 [CHECKOUT] Creating order with user_id:', userId);
      console.log('🔥 [CHECKOUT] User object:', JSON.stringify(currentUser, null, 2));
      console.log('🔥 [CHECKOUT] User email:', formData.email);
      console.log('🔥 [CHECKOUT] User name:', formData.nome);

      toast.info('Criando pedido...');
      const order = await createOrder({
        user_id: userId,
        user_email: formData.email,
        user_name: formData.nome,
        items: orderItems,
        subtotal: safeCartTotal,
        shipping_cost: finalShippingCost,
        discount_amount: discountAmount,
        discount_type: appliedCoupon ? 'coupon' : undefined,
        discount_details: discountDetails || undefined,
        tax_amount: 0,
        total: safeCartTotal + finalShippingCost - discountAmount,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: formData.observacoes || undefined,
      });

      // 6. Aplicar cupom (incrementar contador de uso)
      if (appliedCoupon) {
        try {
          await incrementCouponUsage(appliedCoupon.code);
          console.log('✅ Cupom aplicado com sucesso');
        } catch (error) {
          console.error('❌ Erro ao aplicar cupom:', error);
          // Não bloqueia o fluxo se falhar ao aplicar cupom
        }
      }

      // 7. Sucesso!
      console.log('✅ [CHECKOUT] Order created successfully!');
      console.log('📋 [CHECKOUT] Order number:', order.order_number);
      console.log('📋 [CHECKOUT] Order ID:', order.id);
      console.log('📋 [CHECKOUT] Order user_id:', order.user_id);
      console.log('📋 [CHECKOUT] Full order:', JSON.stringify(order, null, 2));

      setOrderNumber(order.order_number);
      toast.success('Pedido criado com sucesso!');
      setStep('confirmation');
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error);
      toast.error('Erro ao criar pedido. Por favor, tente novamente.');
      alert(error.message || 'Erro ao criar pedido. Por favor, tente novamente.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCopyReference = () => {
    copyToClipboard(orderNumber);
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
      message += `• ${item.product.nome} (${item.quantity}x) - ${(item.product.preco_aoa * item.quantity).toLocaleString('pt-AO')} AOA\n`;
    });
    message += `\n*Subtotal:* ${safeCartTotal.toLocaleString('pt-AO')} AOA\n`;
    message += `*Frete:* ${shippingCost.toLocaleString('pt-AO')} AOA\n`;
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
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="size-4 sm:size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Carrinho</span>
          </button>

          {/* Progress Steps - Mobile Optimized */}
          <div className="flex items-center justify-center gap-1 sm:gap-4 max-w-2xl mx-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 sm:gap-3 flex-1 ${
                  step === s.id ? 'opacity-100' : 
                  steps.findIndex(st => st.id === step) > index ? 'opacity-100' : 
                  'opacity-40'
                }`}>
                  <div className={`size-9 sm:size-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                    step === s.id 
                      ? 'bg-red-600 text-white' 
                      : steps.findIndex(st => st.id === step) > index
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } transition-all`}>
                    {steps.findIndex(st => st.id === step) > index ? (
                      <CheckCircle className="size-4 sm:size-6" />
                    ) : (
                      <s.icon className="size-4 sm:size-6" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500">Passo {index + 1} de 3</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded-full ${
                    steps.findIndex(st => st.id === step) > index ? 'bg-green-600' : 'bg-gray-200'
                  } transition-all`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile Step Label */}
          <p className="md:hidden text-center mt-3 text-sm font-semibold text-gray-700">
            {steps.find(s => s.id === step)?.label} - Passo {steps.findIndex(s => s.id === step) + 1} de 3
          </p>
        </div>
      </div>

      {/* Flash Sale Banner - Only show in info step */}
      {step === 'info' && <FlashSaleBanner onViewProduct={onViewProduct} />}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Customer Information */}
            {step === 'info' && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-gray-100 animate-slide-in-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Informações de Entrega</h2>
                
                {/* Guest checkout notice */}
                {isGuestCheckout && (
                  <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Shield className="size-4 sm:size-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 mb-1 text-sm sm:text-base">✨ Compra Rápida - Sem Cadastro</p>
                        <p className="text-xs sm:text-sm text-green-700">
                          Complete seu pedido sem criar conta. Usaremos seus dados apenas para esta compra e você poderá acompanhar seu pedido por email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User info notice */}
                {user && (
                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <User className="size-4 sm:size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Dados da sua conta</p>
                        <p className="text-xs sm:text-sm text-blue-700">
                          Suas informações foram preenchidas automaticamente. Você pode editá-las se necessário.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmitInfo} className="space-y-4 sm:space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base ${
                          formErrors.nome ? 'border-red-300' : 'border-gray-200'
                        } focus:border-red-600 focus:outline-none transition-all`}
                        placeholder="João Silva"
                      />
                    </div>
                    {formErrors.nome && (
                      <p className="mt-2 text-xs sm:text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Telefone & Email */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base ${
                            formErrors.telefone ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="+244 900 000 000"
                        />
                      </div>
                      {formErrors.telefone && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600">{formErrors.telefone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base ${
                            formErrors.email ? 'border-red-300' : 'border-gray-200'
                          } focus:border-red-600 focus:outline-none transition-all`}
                          placeholder="joao@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Endereço Completo *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-3 sm:top-4 size-4 sm:size-5 text-gray-400" />
                      <textarea
                        value={formData.endereco}
                        onChange={(e) => handleInputChange('endereco', e.target.value)}
                        rows={3}
                        className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base ${
                          formErrors.endereco ? 'border-red-300' : 'border-gray-200'
                        } focus:border-red-600 focus:outline-none transition-all resize-none`}
                        placeholder="Rua, número, bairro..."
                      />
                    </div>
                    {formErrors.endereco && (
                      <p className="mt-2 text-xs sm:text-sm text-red-600">{formErrors.endereco}</p>
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
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="Luanda">Luanda</option>
                      <option value="Benguela">Benguela</option>
                      <option value="Huambo">Huambo</option>
                      <option value="Lobito">Lobito</option>
                      <option value="Cabinda">Cabinda</option>
                      <option value="Lubango">Lubango</option>
                    </select>
                  </div>

                  {/* BUILD 131: Dynamic Shipping Calculator */}
                  {/* Mostra APENAS se: todos produtos são dynamic OU se há mix de tipos SEM paid_fixed */}
                  {!allProductsFreeShipping && !hasFixedShipping && (
                    <ShippingCalculator
                      defaultProvince={formData.cidade}
                      onCalculate={handleShippingCalculated}
                    />
                  )}
                  
                  {/* Indicador de frete grátis */}
                  {allProductsFreeShipping && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Truck className="size-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800">Frete GRÁTIS!</p>
                          <p className="text-sm text-green-600">Todos os produtos têm frete grátis em todo o país</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observações (Opcional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 sm:left-4 top-3 sm:top-4 size-4 sm:size-5 text-gray-400" />
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange('observacoes', e.target.value)}
                        rows={3}
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all resize-none text-sm sm:text-base"
                        placeholder="Instruções especiais de entrega..."
                      />
                    </div>
                  </div>

                  {/* Available Coupons - Compact */}
                  <div className="mt-6 p-3 bg-gradient-to-r from-red-50/50 to-yellow-50/50 rounded-lg border border-red-100">
                    <AvailableCoupons 
                      onApplyCoupon={(code) => {
                        toast.success(`Cupom ${code} copiado!`);
                      }}
                      showApplyButton={false}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold"
                  >
                    Continuar para Pagamento
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 'payment' && (
              <div className="space-y-6 animate-slide-in-left">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-gray-100">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Método de Pagamento</h2>
                  
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
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="size-16 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                      <img 
                        src={item.product.imagem_url} 
                        alt={item.product.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.product.nome}
                      </p>
                      {(item.product as any).is_flash_sale && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold mb-1">
                          ⚡ FLASH SALE
                        </span>
                      )}
                      <p className="text-xs text-gray-600">
                        {item.quantity}x {item.product.preco_aoa.toLocaleString('pt-AO')} AOA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="divider mb-6" />

              {/* Flash Sale Notice */}
              {hasFlashSaleProducts && (
                <div className="mb-6 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚡</span>
                    <div className="text-xs text-gray-700">
                      <p className="font-semibold text-orange-800">Produtos em Flash Sale</p>
                      <p className="mt-1">Você já está aproveitando os melhores preços! Cupons não podem ser combinados com Flash Sales.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="mb-6">
                <CouponInput
                  cartTotal={safeCartTotal}
                  onCouponApply={(coupon: any) => setAppliedCoupon(coupon)}
                  onCouponRemove={() => setAppliedCoupon(null)}
                  appliedCoupon={appliedCoupon}
                  hasFlashSaleProducts={hasFlashSaleProducts}
                />
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{safeCartTotal.toLocaleString('pt-AO')} AOA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4" />
                    <span>Frete</span>
                  </div>
                  {finalShippingCost === 0 ? (
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      🎁 GRÁTIS
                    </span>
                  ) : (
                    <span className="font-semibold">{safeFinalShippingCost.toLocaleString('pt-AO')} AOA</span>
                  )}
                </div>
                
                {/* Discount from coupon */}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4" />
                      <span>Desconto ({appliedCoupon.code})</span>
                    </div>
                    <span className="font-semibold">
                      - {safeDiscountAmount.toLocaleString('pt-AO')} AOA
                    </span>
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
        <AdBanner position="checkout-banner" onNavigateToProduct={onNavigateToProduct} />
      </div>
    </div>
  );
}