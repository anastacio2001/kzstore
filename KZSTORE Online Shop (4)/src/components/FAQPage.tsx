import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'Pedidos',
      question: 'Como faço um pedido na KZSTORE?',
      answer: 'É muito simples! Navegue pelo catálogo, adicione produtos ao carrinho, preencha seus dados de entrega e escolha o método de pagamento. Você receberá todas as instruções por WhatsApp e email.'
    },
    {
      category: 'Pedidos',
      question: 'Posso cancelar meu pedido?',
      answer: 'Sim, você pode cancelar seu pedido antes do pagamento ser confirmado. Após a confirmação do pagamento, entre em contato conosco via WhatsApp para verificar se ainda é possível cancelar.'
    },
    {
      category: 'Pagamento',
      question: 'Quais são as formas de pagamento aceitas?',
      answer: 'Aceitamos Multicaixa Express, Transferência Bancária e Referência Bancária. Todas as opções são seguras e você recebe instruções detalhadas após fazer o pedido.'
    },
    {
      category: 'Pagamento',
      question: 'Quanto tempo leva para confirmar o pagamento?',
      answer: 'Normalmente confirmamos pagamentos em até 2 horas úteis. Você receberá uma notificação por WhatsApp assim que o pagamento for confirmado.'
    },
    {
      category: 'Pagamento',
      question: 'Posso pagar em prestações?',
      answer: 'No momento não trabalhamos com pagamento parcelado. Todos os pagamentos devem ser feitos à vista.'
    },
    {
      category: 'Entrega',
      question: 'Qual o prazo de entrega?',
      answer: 'Em Luanda, entregamos em 24-48 horas úteis após confirmação do pagamento. Para outras províncias, o prazo pode variar de 3 a 7 dias úteis.'
    },
    {
      category: 'Entrega',
      question: 'Quanto custa o frete?',
      answer: 'O frete é calculado automaticamente baseado no peso dos produtos e destino. Em Luanda, o frete mínimo é de 5.000 AOA.'
    },
    {
      category: 'Entrega',
      question: 'Como acompanho minha entrega?',
      answer: 'Você receberá atualizações por WhatsApp sobre o status da sua entrega. Também pode entrar em contato conosco a qualquer momento para verificar o andamento.'
    },
    {
      category: 'Produtos',
      question: 'Os produtos são originais?',
      answer: 'Sim! Todos os nossos produtos são 100% originais e vêm com garantia do fabricante. Trabalhamos apenas com fornecedores certificados.'
    },
    {
      category: 'Produtos',
      question: 'Qual é o período de garantia?',
      answer: 'Todos os produtos têm garantia mínima de 12 meses do fabricante. Alguns produtos podem ter garantia estendida, verifique na descrição do produto.'
    },
    {
      category: 'Produtos',
      question: 'Posso trocar ou devolver um produto?',
      answer: 'Sim, você tem até 7 dias após o recebimento para trocar ou devolver produtos com defeito ou divergência. O produto deve estar na embalagem original e sem sinais de uso.'
    },
    {
      category: 'Produtos',
      question: 'E se o produto chegar com defeito?',
      answer: 'Entre em contato imediatamente via WhatsApp com fotos do defeito. Faremos a troca sem custo adicional ou reembolso total conforme sua preferência.'
    },
    {
      category: 'Estoque',
      question: 'Como sei se um produto está disponível?',
      answer: 'A disponibilidade é atualizada em tempo real no site. Se o produto mostrar "Em estoque", está disponível para compra imediata.'
    },
    {
      category: 'Estoque',
      question: 'Posso encomendar produtos fora de estoque?',
      answer: 'Sim! Entre em contato conosco via WhatsApp para encomendar produtos esgotados. Informaremos o prazo de disponibilidade e valores.'
    },
    {
      category: 'Conta',
      question: 'Preciso criar uma conta para comprar?',
      answer: 'Não é obrigatório criar conta, mas recomendamos para acompanhar seus pedidos e receber ofertas exclusivas.'
    },
    {
      category: 'Suporte',
      question: 'Como entro em contato com o suporte?',
      answer: 'Você pode nos contatar via WhatsApp (número no rodapé do site) ou email. Respondemos em horário comercial de segunda a sábado.'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const filteredFaqs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <HelpCircle className="size-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Encontre respostas para as dúvidas mais comuns
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pergunta..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:bg-white/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <span
              key={category}
              className="px-4 py-2 bg-white rounded-lg border-2 border-gray-100 text-gray-700 font-semibold"
            >
              {category}
            </span>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                Nenhuma pergunta encontrada para "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all hover:border-red-200 animate-slide-in-bottom"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === index ? null : index)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50 transition-all"
                >
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold uppercase mb-2">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedId === index ? (
                      <ChevronUp className="size-6 text-red-600" />
                    ) : (
                      <ChevronDown className="size-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedId === index && (
                  <div className="px-6 pb-6 animate-slide-down">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Não encontrou sua resposta?
          </h3>
          <p className="text-gray-700 mb-6">
            Nossa equipe está pronta para ajudar você com qualquer dúvida.
          </p>
          <a
            href="https://wa.me/244931054015"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
          >
            <MessageCircle className="size-5" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}