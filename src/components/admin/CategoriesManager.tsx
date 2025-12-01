import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Edit2, Trash2, FolderPlus, Folder, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Subcategory {
  id: string;
  name: string;
  icon?: string;
  parentId: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  subcategories?: Subcategory[];
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', icon: '', parentId: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const saved = localStorage.getItem('productCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCategories(parsed);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        loadDefaultCategories();
      }
    } else {
      loadDefaultCategories();
    }
  };

  const loadDefaultCategories = () => {
    const defaultCategories: Category[] = [
      {
        id: 'ram',
        name: 'Memória RAM',
        icon: '💾',
        order: 1,
        subcategories: [
          { id: 'ram-ddr4', name: 'DDR4', parentId: 'ram', order: 1 },
          { id: 'ram-ddr5', name: 'DDR5', parentId: 'ram', order: 2 },
          { id: 'ram-server', name: 'Servidor', parentId: 'ram', order: 3 },
        ]
      },
      {
        id: 'storage',
        name: 'Armazenamento',
        icon: '💽',
        order: 2,
        subcategories: [
          { id: 'storage-ssd', name: 'SSD', parentId: 'storage', order: 1 },
          { id: 'storage-hdd', name: 'HDD', parentId: 'storage', order: 2 },
          { id: 'storage-nvme', name: 'NVMe', parentId: 'storage', order: 3 },
        ]
      },
      {
        id: 'minipc',
        name: 'Mini PCs',
        icon: '🖥️',
        order: 3,
        subcategories: [
          { id: 'minipc-intel', name: 'Intel', parentId: 'minipc', order: 1 },
          { id: 'minipc-amd', name: 'AMD', parentId: 'minipc', order: 2 },
        ]
      },
      {
        id: 'camera',
        name: 'Câmeras Wi-Fi',
        icon: '📹',
        order: 4,
        subcategories: [
          { id: 'camera-indoor', name: 'Indoor', parentId: 'camera', order: 1 },
          { id: 'camera-outdoor', name: 'Outdoor', parentId: 'camera', order: 2 },
        ]
      },
      {
        id: 'network',
        name: 'Redes e Internet',
        icon: '🌐',
        order: 5,
        subcategories: [
          { id: 'network-router', name: 'Roteadores', parentId: 'network', order: 1 },
          { id: 'network-switch', name: 'Switches', parentId: 'network', order: 2 },
        ]
      },
      {
        id: 'software',
        name: 'Software',
        icon: '📀',
        order: 6,
        subcategories: [
          { id: 'software-os', name: 'Sistemas Operacionais', parentId: 'software', order: 1 },
          { id: 'software-office', name: 'Office', parentId: 'software', order: 2 },
        ]
      },
      {
        id: 'mobile',
        name: 'Telemóveis',
        icon: '📱',
        order: 7,
        subcategories: [
          { id: 'mobile-android', name: 'Android', parentId: 'mobile', order: 1 },
          { id: 'mobile-ios', name: 'iOS', parentId: 'mobile', order: 2 },
        ]
      },
      {
        id: 'accessories',
        name: 'Acessórios',
        icon: '🔌',
        order: 8,
        subcategories: [
          { id: 'accessories-cables', name: 'Cabos', parentId: 'accessories', order: 1 },
          { id: 'accessories-adapters', name: 'Adaptadores', parentId: 'accessories', order: 2 },
        ]
      }
    ];
    setCategories(defaultCategories);
    saveCategories(defaultCategories);
  };

  const saveCategories = (cats: Category[]) => {
    localStorage.setItem('productCategories', JSON.stringify(cats));
    // Disparar evento para atualizar formulário de produtos
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: cats }));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    const newCategory: Category = {
      id: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: categoryForm.name,
      icon: categoryForm.icon || '📦',
      order: categories.length + 1,
      subcategories: []
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    saveCategories(updated);
    setCategoryForm({ name: '', icon: '' });
    setShowCategoryForm(false);
    toast.success('Categoria criada com sucesso!');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    const updated = categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: categoryForm.name, icon: categoryForm.icon }
        : cat
    );
    setCategories(updated);
    saveCategories(updated);
    setEditingCategory(null);
    setCategoryForm({ name: '', icon: '' });
    toast.success('Categoria atualizada!');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todas as subcategorias também serão excluídas.')) {
      return;
    }

    const updated = categories.filter(cat => cat.id !== categoryId);
    setCategories(updated);
    saveCategories(updated);
    toast.success('Categoria excluída!');
  };

  const handleCreateSubcategory = (parentId: string) => {
    if (!subcategoryForm.name.trim()) {
      toast.error('Nome da subcategoria é obrigatório');
      return;
    }

    const parent = categories.find(cat => cat.id === parentId);
    if (!parent) return;

    const newSubcategory: Subcategory = {
      id: `${parentId}-${subcategoryForm.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: subcategoryForm.name,
      icon: subcategoryForm.icon,
      parentId: parentId,
      order: (parent.subcategories?.length || 0) + 1
    };

    const updated = categories.map(cat => {
      if (cat.id === parentId) {
        return {
          ...cat,
          subcategories: [...(cat.subcategories || []), newSubcategory]
        };
      }
      return cat;
    });

    setCategories(updated);
    saveCategories(updated);
    setSubcategoryForm({ name: '', icon: '', parentId: '' });
    setShowSubcategoryForm(null);
    toast.success('Subcategoria criada com sucesso!');
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory) return;

    const updated = categories.map(cat => {
      if (cat.id === editingSubcategory.parentId) {
        return {
          ...cat,
          subcategories: cat.subcategories?.map(sub =>
            sub.id === editingSubcategory.id
              ? { ...sub, name: subcategoryForm.name, icon: subcategoryForm.icon }
              : sub
          )
        };
      }
      return cat;
    });

    setCategories(updated);
    saveCategories(updated);
    setEditingSubcategory(null);
    setSubcategoryForm({ name: '', icon: '', parentId: '' });
    toast.success('Subcategoria atualizada!');
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) {
      return;
    }

    const updated = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories?.filter(sub => sub.id !== subcategoryId)
        };
      }
      return cat;
    });

    setCategories(updated);
    saveCategories(updated);
    toast.success('Subcategoria excluída!');
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, icon: category.icon || '' });
    setShowCategoryForm(true);
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({ 
      name: subcategory.name, 
      icon: subcategory.icon || '', 
      parentId: subcategory.parentId 
    });
    setShowSubcategoryForm(subcategory.parentId);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setShowCategoryForm(false);
    setShowSubcategoryForm(null);
    setCategoryForm({ name: '', icon: '' });
    setSubcategoryForm({ name: '', icon: '', parentId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Categorias</h2>
          <p className="text-gray-500">Gerencie categorias e subcategorias de produtos</p>
        </div>
        <Button onClick={() => setShowCategoryForm(true)} disabled={showCategoryForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-gray-500">Categorias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FolderPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Subcategorias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FolderPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {categories.length + categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Formulário Nova Categoria */}
      {showCategoryForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Categoria *</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ex: Eletrônicos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ícone (Emoji)</label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Ex: 📱"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingCategory ? 'Atualizar' : 'Criar'}
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Categorias */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Categorias Cadastradas</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg">
              {/* Categoria Principal */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      {category.subcategories?.length || 0} subcategorias
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSubcategoryForm(category.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Subcategoria
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditCategory(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Formulário Subcategoria */}
              {showSubcategoryForm === category.id && (
                <div className="px-4 pb-4 bg-gray-50 border-t">
                  <div className="p-4 bg-white rounded-lg mt-4">
                    <h4 className="font-semibold mb-3">
                      {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <input
                          type="text"
                          value={subcategoryForm.name}
                          onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Ex: Smartphones"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ícone</label>
                        <input
                          type="text"
                          value={subcategoryForm.icon}
                          onChange={(e) => setSubcategoryForm({ ...subcategoryForm, icon: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Ex: 📱"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={
                          editingSubcategory
                            ? handleUpdateSubcategory
                            : () => handleCreateSubcategory(category.id)
                        }
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {editingSubcategory ? 'Atualizar' : 'Criar'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subcategorias */}
              {expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0 && (
                <div className="px-4 pb-4 bg-gray-50 border-t">
                  <div className="space-y-2 mt-2">
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {subcategory.icon && <span className="text-xl">{subcategory.icon}</span>}
                          <span className="font-medium">{subcategory.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditSubcategory(subcategory)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma categoria cadastrada</p>
            <p className="text-sm">Clique em "Nova Categoria" para começar</p>
          </div>
        )}
      </Card>
    </div>
  );
}
