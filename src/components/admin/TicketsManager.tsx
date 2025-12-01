import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Ticket, MessageSquare, Clock, Download, FileText, Image as ImageIcon, File as FileIcon, Paperclip, X } from 'lucide-react';
import { getTickets, getTicketById, addTicketMessage, updateTicketStatus, uploadAttachment, assignTicket, type Ticket as TicketType, type TicketAttachment } from '../../services/ticketsService';
import { toast } from 'sonner';

const statusConfig: any = {
  open: { label: 'Aberto', color: 'bg-blue-500' },
  in_progress: { label: 'Em Progresso', color: 'bg-yellow-500' },
  resolved: { label: 'Resolvido', color: 'bg-green-500' },
  closed: { label: 'Fechado', color: 'bg-gray-500' },
};

const priorityConfig: any = {
  urgente: { label: 'Urgente', color: 'bg-red-600' },
  alta: { label: 'Alta', color: 'bg-orange-500' },
  normal: { label: 'Normal', color: 'bg-blue-500' },
  baixa: { label: 'Baixa', color: 'bg-green-500' },
};

const categoryConfig: any = {
  suporte: { label: 'Suporte', icon: MessageSquare },
  pedido: { label: 'Pedido', icon: Ticket },
  produto: { label: 'Produto', icon: FileIcon },
  pagamento: { label: 'Pagamento', icon: Clock },
  outros: { label: 'Outros', icon: FileIcon },
};

interface TicketsManagerProps {
  accessToken?: string;
}

export default function TicketsManager({ accessToken }: TicketsManagerProps) {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<TicketType | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!viewing || !response.trim()) return;
    
    try {
      const updated = await addTicketMessage(
        viewing.id,
        response,
        'admin',
        'Suporte KZSTORE',
        true
      );
      setViewing(updated);
      setResponse('');
      toast.success('Resposta enviada!');
      loadTickets();
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      const updated = await updateTicketStatus(ticketId, status);
      setViewing(updated);
      toast.success('Status atualizado!');
      loadTickets();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewing) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      await uploadAttachment(viewing.id, file);
      const updated = await getTicketById(viewing.id);
      setViewing(updated);
      toast.success('Arquivo enviado com sucesso!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const openTicket = async (ticket: TicketType) => {
    try {
      const fullTicket = await getTicketById(ticket.id);
      setViewing(fullTicket);
      setNewStatus(fullTicket.status);
    } catch (error) {
      toast.error('Erro ao carregar ticket');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-3"><CardDescription>Total</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Abertos</CardDescription><CardTitle className="text-3xl text-blue-600">{stats.open}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Em Progresso</CardDescription><CardTitle className="text-3xl text-yellow-600">{stats.inProgress}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Resolvidos</CardDescription><CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Tickets</CardTitle>
          <CardDescription>Gerencie tickets de suporte dos clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ticket encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Ticket className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium">{ticket.ticket_number}</h4>
                          <Badge className={`${statusConfig[ticket.status]?.color || 'bg-gray-500'} text-white`}>
                            {statusConfig[ticket.status]?.label || ticket.status}
                          </Badge>
                          <Badge className={`${priorityConfig[ticket.priority]?.color || 'bg-gray-500'} text-white`}>
                            {priorityConfig[ticket.priority]?.label || ticket.priority}
                          </Badge>
                        </div>
                        <p className="font-medium mb-2">{ticket.subject}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div><span className="font-medium">Cliente:</span> {ticket.user_name}</div>
                          <div><span className="font-medium">Email:</span> {ticket.user_email}</div>
                          <div><span className="font-medium">Categoria:</span> {categoryConfig[ticket.category]?.label || ticket.category}</div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => openTicket(ticket)}>
                            <MessageSquare className="h-4 w-4 mr-1" /> Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {viewing ? `${viewing.ticket_number} - ${viewing.subject}` : 'Carregando...'}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {viewing && viewing.id === ticket.id && (
                            <>
                              <div className="space-y-4">
                                {/* Descrição */}
                                <div className="p-3 bg-gray-50 rounded">
                                  <p className="text-sm font-medium mb-1">Descrição:</p>
                                  <p className="text-sm">{viewing.description}</p>
                                </div>

                                {/* Mensagens */}
                                <div className="space-y-3">
                                  <p className="text-sm font-medium">Conversa:</p>
                                  {Array.isArray(viewing.messages) && viewing.messages.map((msg: any) => (
                                    <div key={msg.id} className={`p-3 rounded ${msg.is_admin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'}`}>
                                      <p className="text-sm font-medium mb-1">
                                        {msg.is_admin ? '🛠️ ' + msg.sender_name : '👤 ' + msg.sender_name}
                                      </p>
                                      <p className="text-sm">{msg.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString('pt-BR')}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Anexos */}
                                {Array.isArray(viewing.attachments) && viewing.attachments.length > 0 && (
                                  <div className="border-t pt-4">
                                    <p className="text-sm font-medium mb-3">Arquivos Anexados:</p>
                                    <div className="grid gap-2">
                                      {viewing.attachments.map((att: TicketAttachment) => (
                                        <a
                                          key={att.id}
                                          href={att.url}
                                          download={att.name}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded border transition-colors group"
                                        >
                                          <div className="text-gray-600">{getFileIcon(att.type)}</div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{att.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                                          </div>
                                          <Download className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Responder */}
                                {viewing.status !== 'closed' && (
                                  <div className="border-t pt-4 space-y-3">
                                    <Textarea 
                                      value={response} 
                                      onChange={(e) => setResponse(e.target.value)} 
                                      placeholder="Digite sua resposta..." 
                                      rows={3} 
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button onClick={handleRespond} disabled={!response.trim()}>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Enviar Resposta
                                      </Button>
                                      
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
                                      >
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        {uploadingFile ? 'Enviando...' : 'Anexar'}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Atualizar Status */}
                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium mb-3">Gerenciar Ticket:</p>
                                  <div className="flex gap-2">
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Aberto</SelectItem>
                                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                                        <SelectItem value="resolved">Resolvido</SelectItem>
                                        <SelectItem value="closed">Fechado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      onClick={() => handleStatusChange(viewing.id, newStatus)}
                                      disabled={newStatus === viewing.status}
                                    >
                                      Atualizar Status
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}