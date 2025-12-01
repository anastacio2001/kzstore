/**
 * Tipos compartilhados da aplicação KZSTORE
 * Atualizado para compatibilidade com API V2
 */

// Flash Sale type
export interface FlashSale {
  id?: string;
  product_id: string;
  title: string;
  description?: string;
  product_name?: string;
  original_price?: number;
  sale_price?: number;
  discount_percentage: number;
  stock_limit: number;
  stock_sold: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Product type - compatível com API V2
export type Product = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  condicao?: 'Novo' | 'Usado' | 'Refurbished';
  preco_aoa: number;
  preco_usd?: number;
  custo_aoa?: number;
  margem_lucro?: number;
  estoque: number;
  estoque_minimo?: number;
  peso_kg?: number;
  imagem_url?: string;
  imagens?: string[];
  especificacoes?: Record<string, any>;
  marca?: string;
  modelo?: string;
  sku?: string;
  codigo_barras?: string;
  dimensoes?: Record<string, any>;
  ativo?: boolean;
  destaque?: boolean;
  is_featured?: boolean;
  featured_order?: number;
  fornecedor?: string;
  tags?: string[];
  category_id?: string;
  subcategory_id?: string;
  created_at?: string;
  updated_at?: string;
  flash_sale?: FlashSale | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

// Order Item type
export interface OrderItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export type Order = {
  id: string;
  order_number: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  discount_type?: string;
  discount_details?: string;
  shipping_cost: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: Address;
  status: string;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
};

export type Customer = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  created_at: string;
};

// Review type
export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment?: string;
  is_approved?: boolean;
  is_verified_purchase?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Coupon type
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  minimum_order_value?: number;
  usage_limit?: number;
  used_count?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}

// Address type
export interface Address {
  nome: string;
  telefone: string;
  provincia: string;
  municipio: string;
  bairro: string;
  rua: string;
  casa?: string;
  referencia?: string;
}

// Blog Post type
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  author_name?: string;
  author_email?: string;
  author_avatar?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  published_at?: string;
  views_count?: number;
  likes_count?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  created_at?: string;
  updated_at?: string;
}