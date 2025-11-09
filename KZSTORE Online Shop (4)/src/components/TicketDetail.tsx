import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Star, AlertCircle, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Ticket, TicketMessage, useTickets } from '../hooks/useTickets';
import { useKZStore } from '../hooks/useKZStore';
import { FileUpload } from './FileUpload';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  isAdminMode?: boolean;
}

export function TicketDetail({ ticket, onBack, isAdminMode = false }: TicketDetailProps) {
  const { loadTicketMessages, addMessage, addRating, updateTicketStatus } = useTickets();
  const { user } = useKZStore();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [attachments, setAttachments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await loadTicketMessages(ticket.id);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && attachments.length === 0) return;

    console.log('📤 Sending message with attachments:', attachments);
    console.log('📤 Attachments array:', JSON.stringify(attachments));

    setSending(true);
    const success = await addMessage(ticket.id, {
      message: newMessage.trim() || '(arquivo anexado)',
      is_admin: isAdminMode,
      attachments: attachments, // Enviar o array direto (pode ser vazio ou com URLs)
    });

    if (success) {
      console.log('✅ Message sent, reloading...');
      setNewMessage('');
      setAttachments([]); // Limpar anexos após enviar
      
      // Pequeno delay para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadMessages(); // Recarregar mensagens
      console.log('🔄 Messages reloaded');
    }
    setSending(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus(ticket.id, newStatus);
      setCurrentStatus(newStatus);
      alert(`Status alterado para: ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do ticket');
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    const success = await addRating(ticket.id, {
      rating,
      comment: ratingComment || undefined,
    });

    if (success) {
      alert('Avaliação enviada com sucesso!');
      setShowRating(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700';
      case 'waiting_customer':
        return 'bg-purple-100 text-purple-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'Aberto',
      in_progress: 'Em Andamento',
      waiting_customer: 'Aguardando Sua Resposta',
      resolved: 'Resolvido',
      closed: 'Fechado',
    };
    return statusMap[status] || status;
  };

  const getStatusLabel = (status: string) => {
    return getStatusText(status);
  };

  const canAddRating = 
    (ticket.status === 'resolved' || ticket.status === 'closed') && 
    !ticket.satisfaction_rating;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          Voltar para Tickets
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
              <p className="text-gray-600 mb-4">{ticket.description}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </span>
              {isAdminMode && (
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Atendimento</option>
                  <option value="waiting_customer">Aguardando Cliente</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                </select>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500">Ticket ID</p>
              <p className="font-semibold text-sm">#{ticket.id.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-semibold text-sm capitalize">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prioridade</p>
              <p className="font-semibold text-sm capitalize">{ticket.priority}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Criado em</p>
              <p className="font-semibold text-sm">
                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Rating existente */}
          {ticket.satisfaction_rating && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Sua Avaliação:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-5 ${
                      star <= ticket.satisfaction_rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold">
                  {ticket.satisfaction_rating}/5
                </span>
              </div>
              {ticket.satisfaction_comment && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  "{ticket.satisfaction_comment}"
                </p>
              )}
            </div>
          )}

          {/* Botão para avaliar */}
          {canAddRating && !showRating && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => setShowRating(true)}
                variant="outline"
                className="border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white"
              >
                <Star className="mr-2 size-4" />
                Avaliar Atendimento
              </Button>
            </div>
          )}

          {/* Formulário de avaliação */}
          {showRating && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-3">Avaliar Atendimento</h3>
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 && `${rating}/5`}
                </span>
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Comentário adicional (opcional)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent mb-3"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitRating}
                  className="bg-[#E31E24] hover:bg-[#C71A1F]"
                >
                  Enviar Avaliação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRating(false);
                    setRating(0);
                    setRatingComment('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat/Mensagens */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#E31E24] text-white px-6 py-3">
          <h2 className="font-semibold">Conversa</h2>
        </div>

        {/* Lista de Mensagens */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#E31E24]"></div>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma mensagem ainda. Envie a primeira!
            </div>
          )}

          {!loading && messages.map((message) => {
            console.log('📨 Rendering message:', message.id, 'Attachments:', message.attachments);
            return (
            <div
              key={message.id}
              className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.is_admin
                    ? 'bg-white border border-gray-200'
                    : 'bg-[#E31E24] text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">
                    {message.is_admin ? 'Suporte KZSTORE' : 'Você'}
                  </span>
                  <span className={`text-xs ${message.is_admin ? 'text-gray-500' : 'text-red-100'}`}>
                    {new Date(message.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((url, index) => {
                      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      return (
                        <div key={index}>
                          {isImage ? (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={`Anexo ${index + 1}`}
                                className="max-w-full rounded border border-gray-300 hover:opacity-90 transition-opacity cursor-pointer"
                                style={{ maxHeight: '200px' }}
                              />
                            </a>
                          ) : (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 px-3 py-2 rounded border ${
                                message.is_admin
                                  ? 'border-gray-300 hover:bg-gray-50'
                                  : 'border-red-400 hover:bg-red-600'
                              } transition-colors`}
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">Arquivo anexado</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de Nova Mensagem */}
        {ticket.status !== 'closed' && (
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white space-y-3">
            {/* FileUpload Component */}
            <FileUpload
              onFilesUploaded={(urls) => setAttachments(urls)}
              maxFiles={3}
              acceptedTypes="image/*,.pdf,.doc,.docx,.txt"
            />
            
            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                className="bg-[#E31E24] hover:bg-[#C71A1F]"
              >
                {sending ? (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {ticket.status === 'closed' && (
          <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">
            Este ticket está fechado. Não é possível enviar novas mensagens.
          </div>
        )}
      </div>
    </div>
  );
}
