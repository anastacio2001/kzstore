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
