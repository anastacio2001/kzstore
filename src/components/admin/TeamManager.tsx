import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Users, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { TeamMember, TeamRole, ROLE_LABELS, DEFAULT_PERMISSIONS } from '../../types/ads';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    loadStats();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database fields to component format
      const mappedMembers = (data || []).map((member: any) => ({
        ...member,
        nome: member.name,
        ativo: member.is_active,
        permissoes: member.permissions
      }));

      console.log('✅ Team members loaded:', mappedMembers);
      setMembers(mappedMembers);
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      toast.error('Erro ao carregar equipe');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: allMembers, error } = await supabase
        .from('team_members')
        .select('role, is_active');

      if (error) throw error;

      const total_members = allMembers?.length || 0;
      const active_members = allMembers?.filter(m => m.is_active).length || 0;
      const super_admins = allMembers?.filter(m => m.role === 'super_admin').length || 0;
      const admins = allMembers?.filter(m => m.role === 'admin').length || 0;
      const editors = allMembers?.filter(m => m.role === 'editor').length || 0;

      setStats({
        total_members,
        active_members,
        by_role: {
          super_admin: super_admins,
          admin: admins,
          editor: editors
        }
      });

      console.log('✅ Stats calculated:', { total_members, active_members, super_admins, admins, editors });
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Definir stats padrão em caso de erro
      setStats({
        total_members: 0,
        active_members: 0,
        by_role: {
          super_admin: 0,
          admin: 0,
          editor: 0
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const memberData = {
        name: formData.nome,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissoes,
        is_active: formData.ativo
      };

      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;

        console.log('✅ Member updated:', editingMember.id);
        toast.success('Membro atualizado!');
      } else {
        // Create new member
        const { error } = await supabase
          .from('team_members')
          .insert(memberData);

        if (error) throw error;

        console.log('✅ Member created');
        toast.success('Membro adicionado!');
      }

      loadMembers();
      loadStats();
      resetForm();
    } catch (error: any) {
      console.error('❌ Error saving member:', error);
      toast.error(error.message || 'Erro ao salvar membro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Member deleted:', id);
      toast.success('Membro removido!');
      loadMembers();
      loadStats();
    } catch (error: any) {
      console.error('❌ Error deleting member:', error);
      toast.error(error.message || 'Erro ao remover membro');
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
      const { error } = await supabase
        .from('team_members')
        .update({ 
          is_active: !member.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (error) throw error;

      console.log('✅ Member status toggled:', member.id, !member.ativo);
      toast.success(member.ativo ? 'Membro desativado' : 'Membro ativado');
      loadMembers();
      loadStats();
    } catch (error) {
      console.error('❌ Error toggling member status:', error);
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
      {stats && stats.by_role && (
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
                  {(stats.by_role?.super_admin || 0) + (stats.by_role?.admin || 0)}
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
                <p className="text-2xl font-bold text-gray-900">{stats.by_role?.editor || 0}</p>
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
              {isLoading ? (
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
