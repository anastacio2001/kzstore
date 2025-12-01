import { Home, Search, Package, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

type NotFoundPageProps = {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
};

export function NotFoundPage({ onNavigateHome, onNavigateProducts }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] md:text-[250px] font-black text-gradient leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-32 sm:size-40 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Search className="size-16 sm:size-20 text-red-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Página Não Encontrada
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Oops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            onClick={onNavigateHome}
            className="group bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
          >
            <Home className="mr-2 size-5" />
            Voltar à Página Inicial
            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            onClick={onNavigateProducts}
            variant="outline"
            className="px-8 py-6 rounded-xl border-2 text-lg font-semibold hover:bg-gray-50"
          >
            <Package className="mr-2 size-5" />
            Ver Produtos
          </Button>
        </div>

        {/* Popular Links */}
        <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-6">Links Populares</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={onNavigateProducts}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-200 border-2 border-transparent transition-all text-left group"
            >
              <div className="size-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Catálogo</p>
                <p className="text-sm text-gray-600">Ver todos produtos</p>
              </div>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-200 border-2 border-transparent transition-all text-left group"
            >
              <div className="size-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Início</p>
                <p className="text-sm text-gray-600">Página principal</p>
              </div>
            </button>

            <a
              href="https://wa.me/244931054015"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-semibold"
            >
              <div className="size-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Suporte</p>
                <p className="text-sm text-gray-600">Fale conosco</p>
              </div>
            </a>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-yellow-50 hover:border-yellow-200 border-2 border-transparent transition-all text-left group"
            >
              <div className="size-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Promoções</p>
                <p className="text-sm text-gray-600">Ofertas especiais</p>
              </div>
            </button>
          </div>
        </div>

        {/* Fun Message */}
        <p className="mt-8 text-sm text-gray-500">
          Código de erro: <span className="font-mono font-semibold">404_PAGE_NOT_FOUND</span>
        </p>
      </div>
    </div>
  );
}