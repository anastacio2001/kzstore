import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Users, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { TeamMember, TeamRole, ROLE_LABELS, DEFAULT_PERMISSIONS } from '../../types/ads';
import { toast } from 'sonner';
import { useTeam } from '../../hooks/useTeam';

export function TeamManager() {
  const { members, loading, fetchMembers, createMember, updateMember, deleteMember, getStats } = useTeam();
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'editor' as TeamRole,
    ativo: true,
    permissoes: DEFAULT_PERMISSIONS.editor
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    await fetchMembers();
    await loadStats();
  };

  const loadStats = async () => {
    const statsData = await getStats();
    setStats(statsData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
        toast.success('Membro atualizado!');
      } else {
        await createMember(formData);
        toast.success('Membro adicionado!');
      }
      loadMembers();
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Erro ao salvar membro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await deleteMember(id);
      toast.success('Membro removido!');
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      nome: member.nome,
      email: member.email,
      role: member.role,
      ativo: member.ativo,
      permissoes: member.permissoes
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      role: 'editor',
      ativo: true,
      permissoes: DEFAULT_PERMISSIONS.editor
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const handleRoleChange = (role: TeamRole) => {
    setFormData({
      ...formData,
      role,
      permissoes: DEFAULT_PERMISSIONS[role]
    });
  };

  const togglePermission = (key: string) => {
    setFormData({
      ...formData,
      permissoes: {
        ...formData.permissoes,
        [key]: !formData.permissoes[key as keyof typeof formData.permissoes]
      }
    });
  };

  const toggleMemberStatus = async (member: TeamMember) => {
    try {
      await updateMember(member.id, { isActive: !member.isActive });
      toast.success(member.isActive ? 'Membro desativado' : 'Membro ativado');
      loadMembers();
    } catch (error) {
      console.error('Error toggling member status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const getRoleColor = (role: TeamRole) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      editor: 'bg-green-100 text-green-700 border-green-200',
      viewer: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[role];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Equipe</h2>
          <p className="text-gray-600 mt-1">Gerir membros e permissões</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <UserPlus className="size-5" />
          Adicionar Membro
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_members}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_members}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="size-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.by_role.super_admin + stats.by_role.admin}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Editores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.by_role.editor}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-6">
              {editingMember ? 'Editar Membro' : 'Adicionar Membro'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="joao@kzstore.ao"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Função / Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(ROLE_LABELS) as TeamRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.role === role
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="size-4" />
                        <span className="font-semibold">{ROLE_LABELS[role]}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {role === 'super_admin' && 'Acesso total ao sistema'}
                        {role === 'admin' && 'Gerir produtos e pedidos'}
                        {role === 'editor' && 'Editar produtos e anúncios'}
                        {role === 'viewer' && 'Apenas visualização'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissões Personalizadas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.permissoes).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => togglePermission(key)}
                        className="size-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="size-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Membro ativo (pode acessar o sistema)
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {editingMember ? 'Atualizar' : 'Adicionar'} Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum membro adicionado ainda
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                          {member.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.nome}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {Object.values(member.permissoes).filter(Boolean).length} de{' '}
                        {Object.keys(member.permissoes).length}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {member.ultimo_acesso
                          ? new Date(member.ultimo_acesso).toLocaleDateString('pt-AO')
                          : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMemberStatus(member)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          member.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.ativo ? (
                          <>
                            <CheckCircle className="size-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}