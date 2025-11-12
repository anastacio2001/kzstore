import React, { useState, useEffect } from 'react';
import { Image, Save, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase/client';

interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  badge_text: string;
  stats_label: string;
  stats_value: string;
  is_active: boolean;
  display_order: number;
}

export default function HeroSectionManager() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HeroSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadHeroSections();
  }, []);

  const loadHeroSections = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHeroSections(data || []);
    } catch (error) {
      console.error('Erro ao carregar hero sections:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSection) return;

    try {
      if (editingSection.id && !isCreating) {
        // Update
        const { error } = await supabase
          .from('hero_sections')
          .update({
            title: editingSection.title,
            subtitle: editingSection.subtitle,
            description: editingSection.description,
            image_url: editingSection.image_url,
            cta_primary_text: editingSection.cta_primary_text,
            cta_primary_link: editingSection.cta_primary_link,
            cta_secondary_text: editingSection.cta_secondary_text,
            cta_secondary_link: editingSection.cta_secondary_link,
            badge_text: editingSection.badge_text,
            stats_label: editingSection.stats_label,
            stats_value: editingSection.stats_value,
            is_active: editingSection.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Banner atualizado com sucesso!');
      } else {
        // Create
        const { error } = await supabase
          .from('hero_sections')
          .insert([{
            title: editingSection.title,
            subtitle: editingSection.subtitle,
            description: editingSection.description,
            image_url: editingSection.image_url,
            cta_primary_text: editingSection.cta_primary_text,
            cta_primary_link: editingSection.cta_primary_link,
            cta_secondary_text: editingSection.cta_secondary_text,
            cta_secondary_link: editingSection.cta_secondary_link,
            badge_text: editingSection.badge_text,
            stats_label: editingSection.stats_label,
            stats_value: editingSection.stats_value,
            is_active: editingSection.is_active,
            display_order: heroSections.length + 1
          }]);

        if (error) throw error;
        toast.success('Banner criado com sucesso!');
      }

      setEditingSection(null);
      setIsCreating(false);
      loadHeroSections();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await supabase
        .from('hero_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Banner excluído com sucesso!');
      loadHeroSections();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir banner');
    }
  };

  const toggleActive = async (section: HeroSection) => {
    try {
      const { error } = await supabase
        .from('hero_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;
      toast.success(section.is_active ? 'Banner desativado' : 'Banner ativado');
      loadHeroSections();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleCreateNew = () => {
    setEditingSection({
      id: '',
      title: 'Tecnologia de',
      subtitle: 'Ponta em Angola',
      description: 'Descrição do banner',
      image_url: '',
      cta_primary_text: 'Ver Produtos',
      cta_primary_link: '/produtos',
      cta_secondary_text: 'Falar com Especialista',
      cta_secondary_link: '/contato',
      badge_text: 'Novidade',
      stats_label: 'Vendas em 2024',
      stats_value: '10k+',
      is_active: true,
      display_order: heroSections.length + 1
    });
    setIsCreating(true);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Banner Principal</h2>
          <p className="text-gray-600">Configure o banner da página inicial</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Novo Banner
        </button>
      </div>

      {/* Lista de Hero Sections */}
      <div className="grid gap-4 mb-6">
        {heroSections.map((section) => (
          <div
            key={section.id}
            className={`bg-white border-2 rounded-lg p-4 ${
              section.is_active ? 'border-green-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {section.title} {section.subtitle}
                  </h3>
                  {section.is_active && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{section.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Badge: {section.badge_text}</span>
                  <span>Stats: {section.stats_value} {section.stats_label}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(section)}
                  className={`p-2 rounded ${
                    section.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={section.is_active ? 'Desativar' : 'Ativar'}
                >
                  {section.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => {
                    setEditingSection(section);
                    setIsCreating(false);
                  }}
                  className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  title="Editar"
                >
                  <Image size={18} />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário de Edição */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              {isCreating ? 'Criar Novo Banner' : 'Editar Banner'}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-1">Título Principal</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Tecnologia de"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={editingSection.subtitle}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Ponta em Angola"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="A maior loja online..."
                />
              </div>

              {/* URL da Imagem */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={editingSection.image_url}
                  onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>

              {/* CTA Primário */}
              <div>
                <label className="block text-sm font-medium mb-1">Botão Primário (Texto)</label>
                <input
                  type="text"
                  value={editingSection.cta_primary_text}
                  onChange={(e) => setEditingSection({ ...editingSection, cta_primary_text: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Botão Primário (Link)</label>
                <input
                  type="text"
                  value={editingSection.cta_primary_link}
                  onChange={(e) => setEditingSection({ ...editingSection, cta_primary_link: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* CTA Secundário */}
              <div>
                <label className="block text-sm font-medium mb-1">Botão Secundário (Texto)</label>
                <input
                  type="text"
                  value={editingSection.cta_secondary_text}
                  onChange={(e) => setEditingSection({ ...editingSection, cta_secondary_text: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Botão Secundário (Link)</label>
                <input
                  type="text"
                  value={editingSection.cta_secondary_link}
                  onChange={(e) => setEditingSection({ ...editingSection, cta_secondary_link: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Badge */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Texto do Badge</label>
                <input
                  type="text"
                  value={editingSection.badge_text}
                  onChange={(e) => setEditingSection({ ...editingSection, badge_text: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Novidade: Novos produtos a cada semana"
                />
              </div>

              {/* Estatísticas */}
              <div>
                <label className="block text-sm font-medium mb-1">Valor Estatística</label>
                <input
                  type="text"
                  value={editingSection.stats_value}
                  onChange={(e) => setEditingSection({ ...editingSection, stats_value: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="10k+"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label Estatística</label>
                <input
                  type="text"
                  value={editingSection.stats_label}
                  onChange={(e) => setEditingSection({ ...editingSection, stats_label: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Vendas em 2024"
                />
              </div>

              {/* Status Ativo */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSection.is_active}
                    onChange={(e) => setEditingSection({ ...editingSection, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Banner Ativo</span>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingSection(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
