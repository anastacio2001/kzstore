import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Product } from '../App';
import { products as allProducts } from '../data/products';

type Message = {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  options?: string[];
  products?: Product[];
};

type ChatState = 'initial' | 'category' | 'ram-compatibility' | 'recommendation' | 'delivery' | 'general';

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>('initial');
  const [userContext, setUserContext] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendWelcomeMessage();
    }
  }, [isOpen]);

  const sendWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: '👋 Olá! Sou o assistente técnico da KZSTORE. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date(),
      options: [
        '💾 Memória RAM',
        '💿 Hard disk / SSD',
        '🖥️ Mini PC',
        '📹 Câmera Wi-Fi',
        '🌐 Redes e Internet',
        '💽 Armazenamento',
        '📀 Software',
        '⌨️ Periféricos',
        '📱 Telemóveis',
        '🛒 Ver todos produtos'
      ]
    };
    setMessages([welcomeMessage]);
    setChatState('category');
  };

  const handleOptionClick = (option: string) => {
    // Send user message
    addUserMessage(option);

    // Process based on current state
    if (chatState === 'category') {
      handleCategorySelection(option);
    } else if (chatState === 'ram-compatibility') {
      handleRamCompatibility(option);
    } else if (chatState === 'recommendation') {
      handleRecommendation(option);
    }
  };

  const handleCategorySelection = (option: string) => {
    let category = '';
    let message = '';
    let filteredProducts: Product[] = [];

    if (option.includes('RAM')) {
      category = 'RAM';
      setChatState('ram-compatibility');
      const ramProducts = allProducts.filter(p => p.categoria === 'RAM');
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Encontrei ${ramProducts.length} opções de memória RAM. \n\nPara melhor recomendação, me diga:\n\n🔹 Qual modelo de servidor você usa?\n(ex: HPE ProLiant, Dell PowerEdge, Supermicro)\n\n🔹 Deseja DDR3, DDR4 ou DDR5?\n\n🔹 Precisa ECC ou UDIMM?`,
        sender: 'bot',
        timestamp: new Date(),
        products: ramProducts,
        options: ['DDR3', 'DDR4', 'DDR5', 'Ver todos RAM', 'Voltar ao menu']
      };
      setMessages(prev => [...prev, botMessage]);
      return;
    }

    const categoryMap: Record<string, string> = {
      'Hard disk': 'HDD',
      'SSD': 'SSD',
      'Mini PC': 'Mini PC',
      'Câmera': 'Câmera',
      'Redes e Internet': 'Redes e Internet',
      'Armazenamento': 'Armazenamento',
      'Software': 'Software',
      'Periféricos': 'Periférico',
      'Telemóveis': 'Telemóvel'
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (option.includes(key)) {
        category = value;
        break;
      }
    }

    if (category) {
      filteredProducts = allProducts.filter(p => p.categoria === category);
      message = `Temos ${filteredProducts.length} produtos em ${category}:`;
    } else if (option.includes('todos')) {
      filteredProducts = allProducts.slice(0, 6);
      message = `Aqui estão alguns dos nossos produtos em destaque:`;
    }

    const botMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'bot',
      timestamp: new Date(),
      products: filteredProducts,
      options: ['🎁 Ver combos e promoções', '📦 Simular entrega', '🔙 Voltar ao menu']
    };

    setMessages(prev => [...prev, botMessage]);
    setChatState('recommendation');
  };

  const handleRamCompatibility = (option: string) => {
    if (option === 'Voltar ao menu') {
      sendWelcomeMessage();
      return;
    }

    let ddrType = '';
    if (option.includes('DDR3')) ddrType = 'DDR3';
    else if (option.includes('DDR4')) ddrType = 'DDR4';
    else if (option.includes('DDR5')) ddrType = 'DDR5';

    if (ddrType) {
      const ramProducts = allProducts.filter(p => 
        p.categoria === 'RAM' && 
        p.especificacoes?.['Tipo']?.includes(ddrType)
      );

      const botMessage: Message = {
        id: Date.now().toString(),
        text: `✅ Produtos compatíveis ${ddrType}:\n\nTodos com garantia e pronta entrega!`,
        sender: 'bot',
        timestamp: new Date(),
        products: ramProducts,
        options: ['🎁 Ver combos', '💬 Falar com especialista', '🔙 Voltar ao menu']
      };

      setMessages(prev => [...prev, botMessage]);
      setChatState('recommendation');
    } else if (option === 'Ver todos RAM') {
      const ramProducts = allProducts.filter(p => p.categoria === 'RAM');
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `📦 Toda nossa linha de memória RAM:`,
        sender: 'bot',
        timestamp: new Date(),
        products: ramProducts,
        options: ['🎁 Ver combos', '💬 Falar com especialista', '🔙 Voltar ao menu']
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleRecommendation = (option: string) => {
    if (option.includes('combos')) {
      const combos = [
        {
          name: '🎁 Combo RAM + HDD',
          description: 'Memória RAM DDR4 16GB + HDD SAS 2TB',
          discount: '10% de desconto',
          price: 117000 // 45000 + 85000 - 10%
        },
        {
          name: '🎁 Combo Mini PC Completo',
          description: 'Mini PC + Rato sem fio + Teclado',
          discount: '15% de desconto',
          price: 341000 // 320000 + 12000 + 65000 - 15%
        },
        {
          name: '🎁 Combo Segurança Total',
          description: 'Câmera Wi-Fi 360° + Cartão SD 256GB',
          discount: 'Entrega gratuita',
          price: 93000 // 55000 + 38000
        }
      ];

      let comboText = '🎁 **COMBOS ESPECIAIS** com descontos exclusivos:\n\n';
      combos.forEach((combo, i) => {
        comboText += `${i + 1}. **${combo.name}**\n`;
        comboText += `   ${combo.description}\n`;
        comboText += `   ${combo.discount}\n`;
        comboText += `   💰 ${combo.price.toLocaleString('pt-AO')} Kz\n\n`;
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        text: comboText + 'Deseja reservar algum combo?',
        sender: 'bot',
        timestamp: new Date(),
        options: ['✅ Sim, reservar combo', '📦 Simular entrega', '💬 Falar com vendedor', '🔙 Voltar']
      };

      setMessages(prev => [...prev, botMessage]);
    } else if (option.includes('entrega')) {
      handleDeliverySimulation();
    } else if (option.includes('especialista') || option.includes('vendedor')) {
      const whatsappNumber = '244931054015'; // Número real KZSTORE
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Perfeito! Vou conectar você com nossa equipe de especialistas agora mesmo! 🤝`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } else if (option === '🔙 Voltar ao menu' || option.includes('Voltar')) {
      sendWelcomeMessage();
    } else if (option.includes('WhatsApp')) {
      window.open(`https://wa.me/244931054015?text=Olá, vim do chatbot da KZSTORE!`, '_blank');
    }
  };

  const handleDeliverySimulation = () => {
    const deliveryText = `📦 **SIMULAÇÃO DE ENTREGA**\n\n` +
      `📍 **Luanda**: Entrega em até 48h via motoboy\n` +
      `   Taxa: 2.500 Kz\n\n` +
      `📍 **Outras províncias**: 3-5 dias úteis\n` +
      `   Taxa: A partir de 5.000 Kz\n\n` +
      `💳 **FORMAS DE PAGAMENTO**:\n` +
      `✅ Multicaixa Express\n` +
      `✅ Referência Bancária\n` +
      `✅ Transferência (BAI, BFA, Atlântico)\n\n` +
      `Deseja gerar uma fatura?`;

    const botMessage: Message = {
      id: Date.now().toString(),
      text: deliveryText,
      sender: 'bot',
      timestamp: new Date(),
      options: ['✅ Sim, gerar fatura', '📱 Finalizar no WhatsApp', '🔙 Voltar']
    };

    setMessages(prev => [...prev, botMessage]);
    setChatState('delivery');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    
    // Simple AI response based on keywords
    const lowerInput = inputValue.toLowerCase();
    let botResponse = '';

    if (lowerInput.includes('preço') || lowerInput.includes('custa') || lowerInput.includes('valor')) {
      botResponse = '💰 Para consultar preços específicos, por favor selecione uma categoria acima ou me diga qual produto lhe interessa!';
    } else if (lowerInput.includes('entrega') || lowerInput.includes('envio')) {
      handleDeliverySimulation();
      setInputValue('');
      return;
    } else if (lowerInput.includes('garantia')) {
      botResponse = '🛡️ Todos os produtos têm garantia de 6 a 12 meses. Produtos importados possuem garantia internacional!';
    } else if (lowerInput.includes('stock') || lowerInput.includes('estoque')) {
      botResponse = '📦 Temos a maioria dos produtos em stock para pronta entrega! Qual produto específico você procura?';
    } else if (lowerInput.includes('pagamento')) {
      botResponse = '💳 Aceitamos:\n✅ Multicaixa Express\n✅ Referência Bancária\n✅ Transferência (BAI, BFA, Atlântico)\n\nTodos os pagamentos são 100% seguros!';
    } else {
      botResponse = 'Entendi! Para melhor atendê-lo, por favor selecione uma das opções acima ou me diga mais sobre o que procura. 😊';
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
      options: chatState === 'initial' ? undefined : ['🔙 Voltar ao menu principal']
    };

    setMessages(prev => [...prev, botMessage]);
    setInputValue('');
  };

  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('pt-AO')} Kz`;
  };

  return (
    <>
      {/* Floating Button - Mobile Optimized */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl transition-all hover:scale-110 animate-bounce"
        >
          <MessageCircle className="size-5 sm:size-6" />
          <span className="hidden sm:inline font-semibold">Chat com IA</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-green-600"></span>
          </span>
        </button>
      )}

      {/* Chat Window - Mobile Optimized - Smaller Size */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full sm:w-96 h-[80vh] sm:h-[500px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col border-t sm:border border-gray-200 overflow-hidden">
          {/* Header - Mobile Optimized */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-3 flex items-center justify-between flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="size-8 sm:size-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="size-4 sm:size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base truncate">Assistente KZSTORE</h3>
                <p className="text-[10px] sm:text-xs text-green-100">🟢 Online - Resposta imediata</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors flex-shrink-0"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Messages - Mobile Optimized */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="size-6 sm:size-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="size-3.5 sm:size-5 text-green-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="size-6 sm:size-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <User className="size-3.5 sm:size-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Products Display - Mobile Optimized */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-2 sm:mt-3 ml-8 sm:ml-10 space-y-2">
                    {message.products.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
                      >
                        <div className="flex gap-2 sm:gap-3">
                          <img
                            src={product.imagem_url}
                            alt={product.nome}
                            className="size-12 sm:size-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                              {product.nome}
                            </h4>
                            <p className="text-sm sm:text-lg font-bold text-green-600 mt-0.5">
                              {formatPrice(product.preco_aoa)}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                              {product.estoque > 0 ? '✅ Em stock' : '❌ Sob encomenda'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {message.products.length > 3 && (
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center py-1">
                        + {message.products.length - 3} produtos
                      </p>
                    )}
                  </div>
                )}

                {/* Options - Mobile Optimized */}
                {message.options && message.options.length > 0 && (
                  <div className="mt-2 sm:mt-3 ml-8 sm:ml-10 grid grid-cols-1 gap-1.5 sm:gap-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="bg-white hover:bg-green-50 text-green-700 border border-green-200 hover:border-green-400 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm transition-all text-left font-medium"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Mobile Optimized */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-green-500 hover:bg-green-600 text-white p-2 sm:p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="size-4 sm:size-5" />
              </button>
            </div>
            {/* AI Badge */}
            <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
              <Bot className="size-3" />
              Atendimento automatizado com IA 🤖
            </p>
          </div>
        </div>
      )}
    </>
  );
}