import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Product } from '../App';

type ProductFormProps = {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nome: product?.nome || '',
    descricao: product?.descricao || '',
    categoria: product?.categoria || 'Mini PCs',
    preco_aoa: product?.preco_aoa || 0,
    peso_kg: product?.peso_kg || 0,
    estoque: product?.estoque || 0,
    imagem_url: product?.imagem_url || '',
    condicao: product?.condicao || 'Novo' as 'Novo' | 'Usado' | 'Refurbished'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome do Produto</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <select
            id="categoria"
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="Mini PCs">Mini PCs</option>
            <option value="Memória RAM">Memória RAM</option>
            <option value="Hard Disks">Hard Disks</option>
            <option value="Câmeras Wi-Fi">Câmeras Wi-Fi</option>
            <option value="Telemóveis">Telemóveis</option>
            <option value="Acessórios">Acessórios</option>
          </select>
        </div>

        <div>
          <Label htmlFor="condicao">Condição</Label>
          <select
            id="condicao"
            value={formData.condicao}
            onChange={(e) => handleChange('condicao', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="Novo">Novo</option>
            <option value="Usado">Usado</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="preco">Preço (Kz)</Label>
          <Input
            id="preco"
            type="number"
            value={formData.preco_aoa}
            onChange={(e) => handleChange('preco_aoa', parseFloat(e.target.value))}
            required
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.01"
            value={formData.peso_kg}
            onChange={(e) => handleChange('peso_kg', parseFloat(e.target.value))}
            required
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="estoque">Estoque</Label>
          <Input
            id="estoque"
            type="number"
            value={formData.estoque}
            onChange={(e) => handleChange('estoque', parseInt(e.target.value))}
            required
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imagem_url">URL da Imagem</Label>
        <Input
          id="imagem_url"
          value={formData.imagem_url}
          onChange={(e) => handleChange('imagem_url', e.target.value)}
          required
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? 'Atualizar' : 'Criar'} Produto
        </Button>
      </div>
    </form>
  );
}
