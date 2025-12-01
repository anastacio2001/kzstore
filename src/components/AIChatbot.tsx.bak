/**
 * KZSTORE AI Chatbot Component
 * Chatbot com IA usando Google Gemini diretamente no frontend
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Phone } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: '👋 Bem-vindo à KZSTORE! Sou seu assistente virtual com inteligência artificial! 🤖✨\n\n🎯 **Como posso ajudar hoje?**\n\n• 🔍 Encontrar produtos específicos\n• 💰 Consultar preços e promoções\n• 📦 Verificar disponibilidade em estoque\n• 🚚 Informações sobre entrega e pagamento\n• 💡 Recomendações personalizadas\n\n**💬 Prefere falar com um humano?**\nClique no botão verde do WhatsApp acima para atendimento direto!\n\n📱 +244 931 054 015\n⏰ Seg-Sáb: 8h às 18h\n\nDigite sua pergunta abaixo 👇',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Enviar para backend /api/ai/chat
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10) // Últimas 10 mensagens para contexto
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Adicionar resposta do bot
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Mensagem de erro genérica
      const errorContent = `Ops! Tive uma dificuldade técnica momentânea. 😅\n\n**Não se preocupe!** Nossa equipe está pronta para ajudar:\n\n**💬 WhatsApp (Atendimento Imediato):**\n📱 +244 931 054 015\n⏰ Seg-Sáb: 8h às 18h\n\n**Clique no botão verde** acima para abrir o chat!\n\n✅ Podemos ajudar com:\n• Consulta de produtos\n• Verificação de estoque\n• Processamento de pedidos\n• Suporte técnico\n\nEstamos à disposição! 🎯`;
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    '💾 Memória RAM DDR4',
    '💿 SSD NVMe 256GB',
    '🖥️ Mini PC i5',
    '📹 Câmera IP Wi-Fi',
    '⚡ Produtos em promoção',
    '🚚 Prazos de entrega'
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  return (
    <>
      {/* Floating Button - INFERIOR DIREITO */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed size-14 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Abrir assistente IA"
          style={{ 
            bottom: '20px',
            right: '20px',
            left: 'auto',
            top: 'auto',
            zIndex: 9999,
            position: 'fixed'
          }}
        >
          <Sparkles className="size-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window - INFERIOR DIREITO */}
      {isOpen && (
        <div 
          className="bg-white rounded-2xl shadow-2xl flex flex-col border border-purple-200 overflow-hidden"
          style={{ 
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            left: 'auto',
            top: 'auto',
            width: '90vw',
            maxWidth: '360px',
            height: '70vh',
            maxHeight: '500px',
            zIndex: 9999
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="size-9 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistente IA</h3>
                <div className="flex items-center gap-1.5 text-xs text-purple-100">
                  <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/244931054015?text=Olá!%20Vim%20do%20site%20KZSTORE%20e%20gostaria%20de%20falar%20com%20um%20atendente."
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110"
                title="Falar no WhatsApp"
              >
                <Phone className="size-4" />
              </a>
              
              <button
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Fechar chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-purple-50/30 to-blue-50/30">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="size-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="size-3.5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-white border-2 border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <span className={`text-xs mt-1 block ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-AO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="size-7 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="size-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="size-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t bg-white">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors border border-purple-200"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium hover:scale-105"
              >
                <Send className="size-4" />
              </button>
            </div>
            
            {/* Footer Info */}
            <div className="mt-2 flex items-center justify-center text-xs text-gray-400">
              <p className="flex items-center gap-1">
                <Sparkles className="size-3" />
                Assistente com IA
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}