import { useState } from 'react';
import { ArrowLeft, Plus, MessageCircle, Clock, CheckCircle, XCircle, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useTickets, Ticket } from '../hooks/useTickets';
import { TicketDetail } from './TicketDetail';

interface MyTicketsPageProps {
  onBack: () => void;
}

export function MyTicketsPage({ onBack }: MyTicketsPageProps) {
  const { tickets, loading, createTicket, loadMyTickets } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ticket = await createTicket(formData);
    
    if (ticket) {
      alert('Ticket criado com sucesso!');
      setShowForm(false);
      setFormData({
        subject: '',
        description: '',
        category: 'other',
        priority: 'medium',
      });
      await loadMyTickets();
    }
  };

  // Se um ticket está selecionado, mostrar detalhes
  if (selectedTicket) {
    return (
      <TicketDetail 
        ticket={selectedTicket} 
        onBack={() => setSelectedTicket(null)} 
      />
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageCircle className="size-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="size-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'closed':
        return <XCircle className="size-5 text-gray-500" />;
      default:
        return <MessageCircle className="size-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'Aberto',
      in_progress: 'Em Andamento',
      waiting_customer: 'Aguardando Resposta',
      resolved: 'Resolvido',
      closed: 'Fechado',
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };
    return priorityMap[priority] || priority;
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      technical: 'Técnico',
      billing: 'Faturamento',
      product: 'Produto',
      shipping: 'Envio',
      returns: 'Devoluções',
      other: 'Outro',
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Meus Tickets</h1>
            <p className="text-gray-600">Gerencie suas solicitações de suporte</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#E31E24] hover:bg-[#C71A1F]"
        >
          <Plus className="mr-2 size-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Formulário de Novo Ticket */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-[#E31E24]">
          <h2 className="text-xl font-bold mb-4">Criar Novo Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Assunto *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                placeholder="Ex: Problema com meu pedido #123"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                placeholder="Descreva seu problema em detalhes..."
                rows={4}
                required
              />
            </div>

            {/* Categoria e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                  required
                >
                  <option value="technical">Técnico</option>
                  <option value="billing">Faturamento</option>
                  <option value="product">Produto</option>
                  <option value="shipping">Envio</option>
                  <option value="returns">Devoluções</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#E31E24] focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="bg-[#E31E24] hover:bg-[#C71A1F]"
              >
                Criar Ticket
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31E24] mb-4"></div>
              <p className="text-gray-600">Carregando tickets...</p>
            </div>
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageCircle className="mx-auto mb-4 size-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum ticket criado
            </h3>
            <p className="text-gray-500 mb-4">
              Crie seu primeiro ticket para obter suporte!
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#E31E24] hover:bg-[#C71A1F]"
            >
              <Plus className="mr-2 size-4" />
              Criar Primeiro Ticket
            </Button>
          </div>
        )}

        {!loading && tickets.length > 0 && tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#E31E24] hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(ticket.status)}
                  <h3 className="text-xl font-bold">{ticket.subject}</h3>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2">
                  {ticket.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityText(ticket.priority)}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {getCategoryText(ticket.category)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {getStatusText(ticket.status)}
                  </span>
                </div>

                {/* Data */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Criado: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  {ticket.resolved_at && (
                    <span>
                      Resolvido: {new Date(ticket.resolved_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {ticket.satisfaction_rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-4 ${
                          star <= ticket.satisfaction_rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      Avaliação: {ticket.satisfaction_rating}/5
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="ml-4">
                <ArrowLeft className="size-6 text-gray-400 rotate-180" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
