import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface FooterPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
}

export function FooterPageRenderer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<FooterPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();

    // Escutar atualizações do footer
    const handleFooterUpdate = (event: CustomEvent) => {
      const settings = event.detail;
      const foundPage = settings.footerPages?.find((p: FooterPage) => p.slug === slug);
      if (foundPage) {
        setPage(foundPage);
      }
    };

    window.addEventListener('footerSettingsUpdated' as any, handleFooterUpdate);

    return () => {
      window.removeEventListener('footerSettingsUpdated' as any, handleFooterUpdate);
    };
  }, [slug]);

  const loadPage = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('footerSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        const foundPage = settings.footerPages?.find((p: FooterPage) => p.slug === slug);
        if (foundPage) {
          setPage(foundPage);
        } else {
          setPage(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold">{page.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {page.content ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Esta página ainda não tem conteúdo.</p>
              <p className="text-sm mt-2">
                O administrador pode adicionar conteúdo através do painel admin.
              </p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Se você tiver dúvidas, entre em contato conosco através do WhatsApp ou email.
          </p>
        </div>
      </div>
    </div>
  );
}
