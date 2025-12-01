import { Target, Award, Users, Zap, Shield, Clock, TrendingUp, Heart, Package, Truck } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Qualidade Garantida',
      description: 'Produtos 100% originais com garantia oficial do fabricante',
      color: 'blue'
    },
    {
      icon: Zap,
      title: 'Entrega Rápida',
      description: '24-48h em Luanda com acompanhamento em tempo real',
      color: 'yellow'
    },
    {
      icon: Award,
      title: 'Excelência',
      description: 'Atendimento diferenciado e suporte técnico especializado',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Comprometimento',
      description: 'Focados na satisfação e sucesso dos nossos clientes',
      color: 'red'
    }
  ];

  const stats = [
    { value: '5000+', label: 'Produtos Vendidos', icon: Package },
    { value: '2000+', label: 'Clientes Satisfeitos', icon: Users },
    { value: '24/48h', label: 'Entrega em Luanda', icon: Truck },
    { value: '4.9/5', label: 'Avaliação Média', icon: Award }
  ];

  const timeline = [
    {
      year: '2023',
      title: 'Fundação da KZSTORE',
      description: 'Iniciamos com o objetivo de democratizar o acesso a tecnologia de qualidade em Angola'
    },
    {
      year: '2023',
      title: 'Expansão do Catálogo',
      description: 'Adicionamos linhas especializadas: memórias RAM para servidores, SSDs empresariais e Mini PCs'
    },
    {
      year: '2024',
      title: 'Novos Serviços',
      description: 'Lançamento de câmeras Wi-Fi domésticas e smartphones, ampliando nossa oferta'
    },
    {
      year: '2024',
      title: 'Crescimento Exponencial',
      description: 'Mais de 2000 clientes atendidos com excelência e satisfação'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-primary text-white relative">
        {/* Overlay escuro para melhor contraste */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-slide-in-left">
              Sobre a KZSTORE
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 leading-relaxed animate-slide-in-left" style={{ animationDelay: '100ms' }}>
              Sua loja especializada em produtos eletrônicos de alta performance em Angola. 
              Conectando tecnologia e inovação para impulsionar negócios e residências.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="animate-slide-in-left">
            <div className="inline-flex items-center justify-center size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-red-100 text-red-600 mb-4 sm:mb-6">
              <Target className="size-6 sm:size-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nossa Missão
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
              Fornecer produtos eletrônicos de alta qualidade e performance técnica, 
              com atendimento especializado e entrega rápida, tornando a tecnologia 
              acessível para empresas e pessoas em Angola.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Acreditamos que tecnologia de qualidade não deve ser privilégio de poucos. 
              Por isso, trabalhamos com os melhores fornecedores internacionais para trazer 
              produtos originais com preços justos e suporte técnico diferenciado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 animate-slide-in-right">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 sm:border-2 hover:border-red-200 transition-all hover-lift"
              >
                <div className={`inline-flex items-center justify-center size-10 sm:size-12 rounded-lg sm:rounded-xl mb-3 sm:mb-4 ${
                  value.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  value.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  value.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <value.icon className="size-5 sm:size-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 sm:mb-2">{value.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile Optimized */}
      <div className="bg-white py-8 sm:py-16 border-y border-gray-100 sm:border-y-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-red-100 text-red-600 mb-2 sm:mb-4">
                  <stat.icon className="size-6 sm:size-8" />
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</p>
                <p className="text-xs sm:text-base text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Nossa História
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Uma jornada de crescimento e inovação no mercado angolano de tecnologia
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-yellow-600 to-blue-600 transform -translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`inline-block bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-red-200 transition-all hover-lift animate-slide-in-${index % 2 === 0 ? 'left' : 'right'}`}>
                    <span className="inline-block px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-sm mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-700">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:block relative">
                  <div className="size-6 rounded-full bg-red-600 border-4 border-white shadow-lg" />
                </div>

                {/* Spacer */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
            <Users className="size-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nossa Equipe
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Somos um time apaixonado por tecnologia, formado por especialistas em hardware, 
            logística e atendimento ao cliente. Cada membro da KZSTORE está comprometido em 
            proporcionar a melhor experiência de compra e suporte pós-venda.
          </p>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Nossa equipe de suporte técnico está sempre disponível para tirar dúvidas, 
            ajudar na escolha do produto ideal e garantir que você tenha sucesso com sua aquisição.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por Que Escolher a KZSTORE?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-red-200 transition-all hover-lift text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-100 text-red-600 mb-6">
              <Package className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Produtos Especializados
            </h3>
            <p className="text-gray-700">
              Focamos em produtos técnicos de nicho: memórias para servidores, 
              SSDs empresariais, Mini PCs e tecnologia de ponta.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-red-200 transition-all hover-lift text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-blue-100 text-blue-600 mb-6">
              <Clock className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Entrega Expressa
            </h3>
            <p className="text-gray-700">
              Entregamos em Luanda em 24-48h e mantemos você informado sobre 
              cada etapa do processo de entrega.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-red-200 transition-all hover-lift text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-green-100 text-green-600 mb-6">
              <TrendingUp className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Crescimento Constante
            </h3>
            <p className="text-gray-700">
              Estamos sempre expandindo nosso catálogo e melhorando nossos 
              serviços para atender melhor você.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Explore nosso catálogo e descubra produtos que vão transformar seu negócio ou casa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '#products'}
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Ver Catálogo
            </button>
            <a
              href="https://wa.me/244931054015"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}