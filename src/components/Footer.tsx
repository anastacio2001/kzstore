import { useState, useEffect } from 'react';
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Clock,
} from "lucide-react";

interface FooterSettings {
  companyName: string;
  companyDescription: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    workingHours: string;
  };
  socialLinks: Array<{ id: string; platform: string; url: string; icon: string }>;
  quickLinks: Array<{ id: string; title: string; url: string; order: number }>;
  footerPages: Array<{ id: string; title: string; slug: string; content: string; order: number }>;
  copyrightText: string;
  paymentMethods: string[];
}

type FooterProps = {
  onNavigate: (page: 'home' | 'products' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'return' | 'cookie' | 'promocoes' | 'blog' | 'carreiras' | 'devolucao' | 'garantia' | string) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const [settings, setSettings] = useState<FooterSettings>({
    companyName: 'KZSTORE',
    companyDescription: 'A maior loja online de produtos eletrônicos especializados em Angola. Tecnologia de ponta com os melhores preços.',
    contactInfo: {
      address: 'Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda Angola',
      phone: '+244 931 054 015',
      email: 'contato@kzstore.ao',
      workingHours: 'Segunda - Sábado\n8:00 - 17:00'
    },
    socialLinks: [
      { id: '1', platform: 'Facebook', url: 'https://www.facebook.com/share/1CtV3N3FtH/?mibextid=wwXIfr', icon: '📘' },
      { id: '2', platform: 'Instagram', url: 'https://www.instagram.com/kzstoregeral?igsh=MXY3Nzhtc2xzejBrNQ%3D%3D&utm_source=qr', icon: '📷' },
      { id: '3', platform: 'Twitter', url: '#', icon: '🐦' },
      { id: '4', platform: 'LinkedIn', url: '#', icon: '💼' }
    ],
    quickLinks: [
      { id: '1', title: 'Sobre Nós', url: '/sobre', order: 1 },
      { id: '2', title: 'Produtos', url: '/produtos', order: 2 },
      { id: '3', title: 'Promoções', url: '/promocoes', order: 3 },
      { id: '4', title: 'Blog', url: '/blog', order: 4 },
      { id: '5', title: 'Carreiras', url: '/carreiras', order: 5 }
    ],
    footerPages: [
      { id: '1', title: 'Central de Ajuda', slug: 'ajuda', content: '', order: 1 },
      { id: '2', title: 'Política de Devolução', slug: 'devolucao', content: '', order: 2 },
      { id: '3', title: 'Garantia', slug: 'garantia', content: '', order: 3 },
      { id: '4', title: 'Termos de Uso', slug: 'termos', content: '', order: 4 },
      { id: '5', title: 'Política de Privacidade', slug: 'privacidade', content: '', order: 5 }
    ],
    copyrightText: '© 2025 KZSTORE. Todos os direitos reservados.',
    paymentMethods: ['Multicaixa Express', 'Transferência Bancária']
  });

  useEffect(() => {
    // Carregar configurações
    const loadSettings = () => {
      const saved = localStorage.getItem('footerSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
        } catch (error) {
          console.error('Erro ao carregar configurações do footer:', error);
        }
      }
    };

    loadSettings();

    // Escutar atualizações
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener('footerSettingsUpdated' as any, handleSettingsUpdate);

    return () => {
      window.removeEventListener('footerSettingsUpdated' as any, handleSettingsUpdate);
    };
  }, []);

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      'Facebook': Facebook,
      'Instagram': Instagram,
      'Twitter': Twitter,
      'LinkedIn': Linkedin,
      'Linkedin': Linkedin
    };
    return icons[platform] || Facebook;
  };

  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-primary shadow-lg">
                <Package
                  className="size-6 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-gradient">
                  {settings.companyName}
                </span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              {settings.companyDescription}
            </p>
            <div className="flex gap-3">
              {settings.socialLinks.map(social => {
                const IconComponent = getSocialIcon(social.platform);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    className="size-10 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-all"
                    aria-label={social.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              {settings.quickLinks.map(link => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.url.replace('/', ''));
                    }}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service - Footer Pages */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              Atendimento
            </h4>
            <ul className="space-y-3">
              {settings.footerPages.map(page => (
                <li key={page.id}>
                  <a
                    href={`/${page.slug}`}
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(page.slug);
                    }}
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  {settings.contactInfo.address}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${settings.contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="size-5" />
                  <span>{settings.contactInfo.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contactInfo.email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="size-5 text-red-500" />
                  contato@kzstore.ao
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">
                Horário de Atendimento:
              </p>
              <p className="text-white font-medium">
                Segunda - Sábado
              </p>
              <p className="text-gray-400 text-sm">
                8:00 - 17:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm mb-2">
                Métodos de Pagamento
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {settings.paymentMethods.map((method, index) => (
                  <div key={index} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-sm font-medium">
                      {method}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                Entrega Segura
              </p>
              <div className="flex gap-3">
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm font-medium">
                    Envio para toda Angola
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              {settings.copyrightText}
            </p>
            <div className="flex gap-6 text-sm">
              {settings.footerPages.slice(0, 3).map(page => (
                <a
                  key={page.id}
                  href={`/${page.slug}`}
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(page.slug);
                  }}
                >
                  {page.title}
                </a>
              ))}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('terms');
                }}
              >
                Termos de Serviço
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('cookie');
                }}
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}