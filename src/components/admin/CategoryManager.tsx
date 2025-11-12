import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, Edit2, Trash2, Eye, EyeOff, Plus, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  color: string;
  display_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  show_in_homepage: boolean;
  meta_title: string;
  meta_description: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('subcategories').select('*').order('display_order')
      ]);

      if (categoriesData.error) throw categoriesData.error;
      if (subcategoriesData.error) throw subcategoriesData.error;

      setCategories(categoriesData.data || []);
      setSubcategories(subcategoriesData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // CATEGORIAS
  const handleSaveCategory = async () => {
    if (!editingCategory) return;

    try {
      const slug = editingCategory.slug || generateSlug(editingCategory.name);

      if (editingCategory.id && !isCreatingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: editingCategory.name,
            slug,
            description: editingCategory.description,
            icon: editingCategory.icon,
            image_url: editingCategory.image_url,
            color: editingCategory.color,
            is_active: editingCategory.is_active,
            show_in_menu: editingCategory.show_in_menu,
            show_in_homepage: editingCategory.show_in_homepage,
            meta_title: editingCategory.meta_title,
            meta_description: editingCategory.meta_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Categoria atualizada!');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: editingCategory.name,
            slug,
            description: editingCategory.description,
            icon: editingCategory.icon,
            image_url: editingCategory.image_url,
            color: editingCategory.color,
            is_active: editingCategory.is_active,
            show_in_menu: editingCategory.show_in_menu,
            show_in_homepage: editingCategory.show_in_homepage,
            meta_title: editingCategory.meta_title,
            meta_description: editingCategory.meta_description,
            display_order: categories.length + 1
          }]);

        if (error) throw error;
        toast.success('Categoria criada!');
      }

      setEditingCategory(null);
      setIsCreatingCategory(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(error.message || 'Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza? Isso excluirá todas as subcategorias também!')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Categoria excluída!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      toast.success(category.is_active ? 'Categoria desativada' : 'Categoria ativada');
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao alterar status');
    }
  };

  // SUBCATEGORIAS
  const handleSaveSubcategory = async () => {
    if (!editingSubcategory) return;

    try {
      const slug = editingSubcategory.slug || generateSlug(editingSubcategory.name);

      if (editingSubcategory.id && !isCreatingSubcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update({
            name: editingSubcategory.name,
            slug,
            description: editingSubcategory.description,
            icon: editingSubcategory.icon,
            image_url: editingSubcategory.image_url,
            is_active: editingSubcategory.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSubcategory.id);

        if (error) throw error;
        toast.success('Subcategoria atualizada!');
      } else {
        const categoryId = editingSubcategory.category_id || selectedCategoryForSub;
        const subs = subcategories.filter(s => s.category_id === categoryId);

        const { error } = await supabase
          .from('subcategories')
          .insert([{
            category_id: categoryId,
            name: editingSubcategory.name,
            slug,
            description: editingSubcategory.description,
            icon: editingSubcategory.icon,
            image_url: editingSubcategory.image_url,
            is_active: editingSubcategory.is_active,
            display_order: subs.length + 1
          }]);

        if (error) throw error;
        toast.success('Subcategoria criada!');
      }

      setEditingSubcategory(null);
      setIsCreatingSubcategory(false);
      setSelectedCategoryForSub('');
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar subcategoria:', error);
      toast.error(error.message || 'Erro ao salvar subcategoria');
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;

    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Subcategoria excluída!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir subcategoria');
    }
  };

  const toggleSubcategoryActive = async (subcategory: Subcategory) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .update({ is_active: !subcategory.is_active })
        .eq('id', subcategory.id);

      if (error) throw error;
      toast.success(subcategory.is_active ? 'Subcategoria desativada' : 'Subcategoria ativada');
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateNewCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      slug: '',
      description: '',
      icon: 'Folder',
      image_url: '',
      color: '#3b82f6',
      display_order: categories.length + 1,
      is_active: true,
      show_in_menu: true,
      show_in_homepage: true,
      meta_title: '',
      meta_description: ''
    });
    setIsCreatingCategory(true);
  };

  const handleCreateNewSubcategory = (categoryId: string) => {
    setSelectedCategoryForSub(categoryId);
    setEditingSubcategory({
      id: '',
      category_id: categoryId,
      name: '',
      slug: '',
      description: '',
      icon: '',
      image_url: '',
      display_order: 0,
      is_active: true
    });
    setIsCreatingSubcategory(true);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h2>
          <p className="text-gray-600">Organize categorias e subcategorias de produtos</p>
        </div>
        <button
          onClick={handleCreateNewCategory}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FolderPlus size={20} />
          Nova Categoria
        </button>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-2">
        {categories.map((category) => {
          const categorySubs = subcategories.filter(s => s.category_id === category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id} className="bg-white border rounded-lg">
              {/* Categoria Principal */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleExpanded(category.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>

                  <div
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Folder size={20} style={{ color: category.color }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {!category.is_active && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          Inativo
                        </span>
                      )}
                      {category.show_in_menu && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Menu
                        </span>
                      )}
                      {category.show_in_homepage && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Home
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{category.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {categorySubs.length} subcategoria(s)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateNewSubcategory(category.id)}
                    className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    title="Adicionar Subcategoria"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => toggleCategoryActive(category)}
                    className={`p-2 rounded ${
                      category.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={category.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {category.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setIsCreatingCategory(false);
                    }}
                    className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Subcategorias */}
              {isExpanded && categorySubs.length > 0 && (
                <div className="border-t bg-gray-50 p-4 space-y-2">
                  {categorySubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full ml-8" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{sub.name}</span>
                            {!sub.is_active && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{sub.description}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSubcategoryActive(sub)}
                          className={`p-2 rounded ${
                            sub.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={sub.is_active ? 'Desativar' : 'Ativar'}
                        >
                          {sub.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSubcategory(sub);
                            setIsCreatingSubcategory(false);
                          }}
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(sub.id)}
                          className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Edição de Categoria */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              {isCreatingCategory ? 'Nova Categoria' : 'Editar Categoria'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Nome da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Auto-gerado se vazio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ícone (Lucide)</label>
                  <input
                    type="text"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Monitor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cor</label>
                  <input
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="w-full p-2 border rounded h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={editingCategory.image_url}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.is_active}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Ativo</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.show_in_menu}
                    onChange={(e) => setEditingCategory({ ...editingCategory, show_in_menu: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Mostrar no Menu</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCategory.show_in_homepage}
                    onChange={(e) => setEditingCategory({ ...editingCategory, show_in_homepage: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Mostrar na Homepage</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCreatingCategory(false);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <X size={18} />
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edição de Subcategoria */}
      {editingSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              {isCreatingSubcategory ? 'Nova Subcategoria' : 'Editar Subcategoria'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={editingSubcategory.name}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Nome da subcategoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={editingSubcategory.slug}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Auto-gerado se vazio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={editingSubcategory.description}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ícone (opcional)</label>
                <input
                  type="text"
                  value={editingSubcategory.icon}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, icon: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Monitor"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSubcategory.is_active}
                    onChange={(e) => setEditingSubcategory({ ...editingSubcategory, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingSubcategory(null);
                  setIsCreatingSubcategory(false);
                  setSelectedCategoryForSub('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <X size={18} />
                Cancelar
              </button>
              <button
                onClick={handleSaveSubcategory}
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
