// Types for Advertisement System

export type AdPosition = 
  | 'home-hero-banner'      // Banner grande no topo da home
  | 'home-sidebar'          // Lateral da home
  | 'home-middle-banner'    // Banner no meio da home
  | 'category-top'          // Topo das páginas de categoria
  | 'product-sidebar'       // Lateral das páginas de produto
  | 'checkout-banner'       // Banner no checkout
  | 'blog-sidebar'          // Lateral do blog
  | 'pre-vendas-sidebar'    // Lateral da página de pré-vendas
  | 'footer-banner';        // Banner antes do footer

export type AdType = 'banner' | 'card' | 'sidebar' | 'popup';

export interface Advertisement {
  id: string;
  titulo: string;
  descricao?: string;
  imagem_url: string;
  link_url?: string;
  posicao: AdPosition;
  tipo: AdType;
  ativo: boolean;
  data_inicio: string;
  data_fim?: string;
  cliques: number;
  visualizacoes: number;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AdStats {
  total_ads: number;
  ads_ativos: number;
  total_cliques: number;
  total_visualizacoes: number;
  ctr: number; // Click-through rate
}

// Types for Team Management

export type TeamRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface TeamPermissions {
  criar_anuncios: boolean;
  editar_anuncios: boolean;
  deletar_anuncios: boolean;
  gerir_equipe: boolean;
  gerir_produtos: boolean;
  editar_produtos: boolean;
  deletar_produtos: boolean;
  gerir_pedidos: boolean;
  ver_analytics: boolean;
  gerir_configuracoes: boolean;
}

export interface TeamMember {
  id: string;
  nome: string;
  email: string;
  role: TeamRole;
  permissoes: TeamPermissions;
  ativo: boolean;
  avatar_url?: string;
  ultimo_acesso?: string;
  criado_em: string;
  criado_por: string;
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
  super_admin: {
    criar_anuncios: true,
    editar_anuncios: true,
    deletar_anuncios: true,
    gerir_equipe: true,
    gerir_produtos: true,
    editar_produtos: true,
    deletar_produtos: true,
    gerir_pedidos: true,
    ver_analytics: true,
    gerir_configuracoes: true,
  },
  admin: {
    criar_anuncios: true,
    editar_anuncios: true,
    deletar_anuncios: true,
    gerir_equipe: false,
    gerir_produtos: true,
    editar_produtos: true,
    deletar_produtos: true,
    gerir_pedidos: true,
    ver_analytics: true,
    gerir_configuracoes: false,
  },
  editor: {
    criar_anuncios: true,
    editar_anuncios: true,
    deletar_anuncios: false,
    gerir_equipe: false,
    gerir_produtos: false,
    editar_produtos: true,
    deletar_produtos: false,
    gerir_pedidos: false,
    ver_analytics: false,
    gerir_configuracoes: false,
  },
  viewer: {
    criar_anuncios: false,
    editar_anuncios: false,
    deletar_anuncios: false,
    gerir_equipe: false,
    gerir_produtos: false,
    editar_produtos: false,
    deletar_produtos: false,
    gerir_pedidos: false,
    ver_analytics: false,
    gerir_configuracoes: false,
  },
};

export const ROLE_LABELS: Record<TeamRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
};

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  'home-hero-banner': 'Banner Principal (Home) - 1920×600px',
  'home-sidebar': 'Barra Lateral (Home) - 300×600px',
  'home-middle-banner': 'Banner Central (Home) - 1200×400px',
  'category-top': 'Topo (Categorias) - 1200×300px',
  'product-sidebar': 'Barra Lateral (Produtos) - 300×250px',
  'checkout-banner': 'Banner (Checkout) - 1000×200px',
  'blog-sidebar': 'Barra Lateral (Blog) - 300×600px',
  'pre-vendas-sidebar': 'Barra Lateral (Pré-vendas) - 300×250px',
  'footer-banner': 'Banner (Rodapé) - 1200×150px',
};

export const AD_DIMENSIONS: Record<AdPosition, {width: number; height: number}> = {
  'home-hero-banner': {width: 1920, height: 600},
  'home-sidebar': {width: 300, height: 600},
  'home-middle-banner': {width: 1200, height: 400},
  'category-top': {width: 1200, height: 300},
  'product-sidebar': {width: 300, height: 250},
  'checkout-banner': {width: 1000, height: 200},
  'blog-sidebar': {width: 300, height: 600},
  'pre-vendas-sidebar': {width: 300, height: 250},
  'footer-banner': {width: 1200, height: 150},
};
