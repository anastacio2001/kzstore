import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

type FooterProps = {
  onNavigate: (page: 'home' | 'products' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | 'return' | 'cookie' | 'promocoes' | 'blog' | 'carreiras' | 'devolucao' | 'garantia') => void;
};

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

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
                  KZSTORE
                </span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              A maior loja online de produtos eletrônicos
              especializados em Angola. Tecnologia de ponta com
              os melhores preços.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="size-10 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href="#"
                className="size-10 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="#"
                className="size-10 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-all"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="size-10 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('products');
                  }}
                >
                  Produtos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('promocoes');
                  }}
                >
                  Promoções
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('blog');
                  }}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('carreiras');
                  }}
                >
                  Carreiras
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              Atendimento
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('faq');
                  }}
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('devolucao');
                  }}
                >
                  Política de Devolução
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('garantia');
                  }}
                >
                  Garantia
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('terms');
                  }}
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('privacy');
                  }}
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Sector D, Quarteirão 7, Av. 21 de Janeiro,
                  Luanda
                  <br />
                  Angola
                </span>
              </li>
              <li>
                <a
                  href="tel:+244931054015"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="size-5" />
                  <span>+244 931 054 015</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@kzstore.ao"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="size-5 text-red-500" />
                  kzstoregeral@gmail.com
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
              <div className="flex gap-3">
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm font-medium">
                    Multicaixa Express
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm font-medium">
                    Transferência Bancária
                  </span>
                </div>
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
              © {currentYear} KZSTORE. Todos os direitos
              reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('privacy');
                }}
              >
                Política de Privacidade
              </a>
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