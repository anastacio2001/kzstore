import { useEffect } from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
};

export function SEO({
  title = 'KZSTORE - Loja Online de Eletrônicos em Angola',
  description = 'KZSTORE: Sua loja especializada em produtos eletrônicos de alta performance em Angola. Memórias RAM, SSDs, Mini PCs, Câmeras Wi-Fi e Smartphones com entrega rápida.',
  keywords = 'eletrônicos angola, memória RAM servidor, SSD empresarial, mini PC, câmera wifi, smartphones angola, loja tecnologia luanda, KZSTORE',
  image = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=630&fit=crop',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website'
}: SEOProps) {
  
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'KZSTORE' },
      { property: 'og:locale', content: 'pt_AO' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Additional
      { name: 'robots', content: 'index, follow' },
      { name: 'language', content: 'Portuguese' },
      { name: 'revisit-after', content: '7 days' },
      { name: 'author', content: 'KZSTORE' },
      { name: 'theme-color', content: '#E31E24' },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [title, description, keywords, image, url, type]);

  return null;
}

// Predefined SEO configs for different pages
export const seoConfigs = {
  home: {
    title: 'KZSTORE - Loja Online de Eletrônicos em Angola | Tecnologia de Qualidade',
    description: 'Compre eletrônicos originais com entrega rápida em Angola. Memórias RAM para servidores, SSDs, Mini PCs, Câmeras Wi-Fi e mais. Pagamento seguro via Multicaixa.',
    keywords: 'kzstore, eletrônicos angola, loja online luanda, tecnologia angola, comprar eletrônicos'
  },
  products: {
    title: 'Catálogo de Produtos - KZSTORE',
    description: 'Explore nosso catálogo completo de produtos eletrônicos: Memórias RAM DDR4/DDR5, SSDs NVMe, Mini PCs Intel/AMD, Câmeras de Segurança Wi-Fi e Smartphones.',
    keywords: 'catálogo eletrônicos, produtos tecnologia angola, memória RAM, SSD, mini PC'
  },
  cart: {
    title: 'Carrinho de Compras - KZSTORE',
    description: 'Revise seus produtos e finalize sua compra com segurança. Entrega rápida em Luanda e todo Angola.',
    keywords: 'carrinho compras, checkout angola, comprar online'
  },
  about: {
    title: 'Sobre Nós - KZSTORE | Especialistas em Tecnologia',
    description: 'Conheça a KZSTORE: especializada em produtos eletrônicos de alta performance em Angola. Mais de 2000 clientes satisfeitos desde 2023.',
    keywords: 'sobre kzstore, loja tecnologia angola, história kzstore'
  },
  contact: {
    title: 'Contato - KZSTORE | Fale Conosco',
    description: 'Entre em contato com a KZSTORE. Suporte via WhatsApp, email ou telefone. Atendimento de segunda a sábado das 9h às 18h.',
    keywords: 'contato kzstore, suporte técnico angola, atendimento whatsapp'
  },
  faq: {
    title: 'Perguntas Frequentes - KZSTORE',
    description: 'Encontre respostas para as principais dúvidas sobre pedidos, pagamento, entrega e produtos da KZSTORE.',
    keywords: 'FAQ kzstore, dúvidas frequentes, ajuda compras online angola'
  }
};
