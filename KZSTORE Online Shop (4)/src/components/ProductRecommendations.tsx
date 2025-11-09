import { useState, useEffect } from 'react';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { Product } from '../App';

type ProductRecommendationsProps = {
  currentProduct: Product;
  allProducts: Product[];
  onProductClick: (product: Product) => void;
};

export function ProductRecommendations({ currentProduct, allProducts, onProductClick }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, [currentProduct, allProducts]);

  const generateRecommendations = () => {
    // Algorithm: Find products with similar category and tags
    const recommended = allProducts
      .filter(p => p.id !== currentProduct.id) // Exclude current product
      .map(product => {
        let score = 0;
        
        // Same category: +50 points
        if (product.categoria === currentProduct.categoria) {
          score += 50;
        }
        
        // Similar price range (±30%): +20 points
        const priceRatio = product.preco_aoa / currentProduct.preco_aoa;
        if (priceRatio >= 0.7 && priceRatio <= 1.3) {
          score += 20;
        }
        
        // In stock: +15 points
        if (product.estoque > 0) {
          score += 15;
        }
        
        // Similar tags/keywords (if exist): +10 points each
        const currentTags = extractKeywords(currentProduct.nome + ' ' + currentProduct.descricao);
        const productTags = extractKeywords(product.nome + ' ' + product.descricao);
        const commonTags = currentTags.filter(tag => productTags.includes(tag));
        score += commonTags.length * 10;
        
        // Same condition: +10 points
        if (product.condicao === currentProduct.condicao) {
          score += 10;
        }
        
        return { product, score };
      })
      .filter(item => item.score > 30) // Only show if score > 30
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 4) // Top 4
      .map(item => item.product);
    
    setRecommendations(recommended);
  };

  const extractKeywords = (text: string): string[] => {
    const keywords = ['RAM', 'SSD', 'HDD', 'GB', 'TB', 'DDR4', 'DDR5', 'SATA', 'NVMe', 'Intel', 'AMD', 'Samsung', 'Kingston'];
    return keywords.filter(keyword => text.toUpperCase().includes(keyword.toUpperCase()));
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#FDD835] flex items-center justify-center">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recomendações para Você</h3>
          <p className="text-sm text-gray-600">Produtos similares que você pode gostar</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="group bg-gray-50 rounded-xl p-4 hover:bg-white hover:shadow-lg transition-all border-2 border-transparent hover:border-[#E31E24] text-left"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-white mb-3">
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-[#E31E24] transition-colors">
              {product.nome}
            </h4>

            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-lg font-bold text-[#E31E24]">
                {product.preco_aoa.toLocaleString('pt-AO')}
                <span className="text-sm ml-1">AOA</span>
              </p>
            </div>

            {product.estoque > 0 ? (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Em Estoque
              </span>
            ) : (
              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Esgotado
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
