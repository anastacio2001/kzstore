import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Send, X, Paperclip, Download, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { getTickets, createTicket, getTicketById, addTicketMessage, uploadAttachment, type Ticket, type TicketAttachment } from '../services/ticketsService';
import { toast } from 'sonner';

type SupportTicketsPageProps = {
  onBack: () => void;
};

export function SupportTicketsPage({ onBack }: SupportTicketsPageProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form para novo ticket
  const [formData, setFormData] = useState({
    subject: '',
    category: 'suporte',
    priority: 'normal',
    description: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadTickets();
    }
  }, [user?.id]);

  const loadTickets = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userTickets = await getTickets(user.id);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Faça login para criar um ticket');
      return;
    }

    try {
      await createTicket({
        user_id: user.id,
        user_name: user.name || user.nome || user.email,
        user_email: user.email,
        ...formData,
      });

      toast.success('Ticket criado com sucesso!');
      setShowNewTicket(false);
      setFormData({ subject: '', category: 'suporte', priority: 'normal', description: '' });
      loadTickets();
    } catch (error) {
      toast.error('Erro ao criar ticket');
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      const fullTicket = await getTicketById(ticket.id);
      setSelectedTicket(fullTicket);
    } catch (error) {
      toast.error('Erro ao carregar ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setSending(true);
    try {
      const updated = await addTicketMessage(
        selectedTicket.id,
        newMessage,
        user.id,
        user.name || user.nome || user.email,
        false
      );
      setSelectedTicket(updated);
      setNewMessage('');
      toast.success('Mensagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicket) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      await uploadAttachment(selectedTicket.id, file);
      
      // Recarregar ticket para mostrar anexo
      const updated = await getTicketById(selectedTicket.id);
      setSelectedTicket(updated);
      
      toast.success('Arquivo enviado com sucesso!');
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Aberto',
      in_progress: 'Em Progresso',
      resolved: 'Resolvido',
      closed: 'Fechado',
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      suporte: 'Suporte',
      pedido: 'Pedido',
      produto: 'Produto',
      pagamento: 'Pagamento',
      outros: 'Outros',
    };
    return labels[category] || category;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Necessário</h2>
          <p className="text-gray-600 mb-6">Faça login para acessar seus tickets de suporte</p>
          <Button onClick={onBack}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-[57px] sm:top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="size-5" />
                <span className="font-medium">Voltar</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Meus Tickets</h1>
            </div>
            <Button onClick={() => setShowNewTicket(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="size-4 mr-2" />
              Novo Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Carregando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum ticket ainda</h3>
            <p className="text-gray-600 mb-6">Crie seu primeiro ticket de suporte</p>
            <Button onClick={() => setShowNewTicket(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="size-4 mr-2" />
              Criar Ticket
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-600">
                        #{ticket.ticket_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {Array.isArray(ticket.messages) && ticket.messages.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="size-3" />
                          {ticket.messages.length} mensagens
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Novo Ticket */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Criar Novo Ticket</h2>
              <button onClick={() => setShowNewTicket(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="suporte">Suporte</option>
                    <option value="pedido">Pedido</option>
                    <option value="produto">Produto</option>
                    <option value="pagamento">Pagamento</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                  Criar Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">#{selectedTicket.ticket_number}</h2>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="size-6" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusLabel(selectedTicket.status)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {getCategoryLabel(selectedTicket.category)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">{selectedTicket.subject}</h3>
              <p className="text-gray-600 mt-2">{selectedTicket.description}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {Array.isArray(selectedTicket.messages) && selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-lg p-4 ${
                    msg.is_admin 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-100 border border-gray-200'
                  }`}>
                    <p className="font-semibold text-sm mb-1">
                      {msg.is_admin ? '🛠️ Suporte KZSTORE' : msg.sender_name}
                    </p>
                    <p className="text-gray-900">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Anexos */}
              {Array.isArray(selectedTicket.attachments) && selectedTicket.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Arquivos Anexados</h3>
                  <div className="grid gap-2">
                    {selectedTicket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        download={attachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors group"
                      >
                        <div className="text-gray-600">
                          {getFileIcon(attachment.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input de mensagem e anexos */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-6 border-t space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                    disabled={sending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                
                {/* Upload de arquivo */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    variant="outline"
                    className="text-sm"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    {uploadingFile ? 'Enviando...' : 'Anexar Arquivo'}
                  </Button>
                  <span className="text-xs text-gray-500">Max. 10MB (imagens, PDF, documentos)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
