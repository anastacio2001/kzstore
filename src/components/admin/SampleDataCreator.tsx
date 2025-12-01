import { useState } from 'react';
import { Database, Users, Megaphone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAds } from '../../hooks/useAds';
import { useTeam } from '../../hooks/useTeam';

export function SampleDataCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState('');
  const { createAd } = useAds();
  const { createTeamMember } = useTeam();

  const createSampleAds = async () => {
    const sampleAds = [
      {
        titulo: 'Black Friday KZSTORE 2024',
        descricao: 'Descontos de até 50% em produtos selecionados',
        imagem_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
        link_url: '/products',
        posicao: 'home-hero-banner',
        tipo: 'banner',
        ativo: true,
        data_inicio: new Date().toISOString(),
        data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        titulo: 'Memória RAM DDR5 - Promoção',
        descricao: 'As melhores memórias para servidores com 20% OFF',
        imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
        link_url: '/products',
        posicao: 'category-top',
        tipo: 'banner',
        ativo: true,
        data_inicio: new Date().toISOString()
      },
      {
        titulo: 'Frete Grátis para Luanda',
        descricao: 'Em compras acima de 100.000 Kz',
        imagem_url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=80',
        posicao: 'home-sidebar',
        tipo: 'sidebar',
        ativo: true,
        data_inicio: new Date().toISOString()
      },
      {
        titulo: 'Suporte Técnico Especializado',
        descricao: 'Fale com nossos especialistas via WhatsApp',
        imagem_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
        link_url: 'https://wa.me/244931054015',
        posicao: 'product-sidebar',
        tipo: 'sidebar',
        ativo: true,
        data_inicio: new Date().toISOString()
      },
      {
        titulo: 'Mini PCs em Promoção',
        descricao: 'Perfeitos para escritórios e home office',
        imagem_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
        link_url: '/products',
        posicao: 'home-middle-banner',
        tipo: 'banner',
        ativo: true,
        data_inicio: new Date().toISOString()
      },
      {
        titulo: 'Garanta o seu agora!',
        descricao: 'Finalize seu pedido e receba em 24-48h',
        imagem_url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80',
        posicao: 'checkout-banner',
        tipo: 'banner',
        ativo: true,
        data_inicio: new Date().toISOString()
      }
    ];

    let created = 0;
    for (const ad of sampleAds) {
      try {
        await createAd(ad);
        created++;
        setProgress(`Criando anúncios... ${created}/${sampleAds.length}`);
      } catch (error) {
        console.error('Error creating ad:', error);
      }
    }

    return created;
  };

  const createSampleTeamMembers = async () => {
    const sampleMembers = [
      {
        nome: 'João Silva',
        email: 'joao.silva@kzstore.ao',
        role: 'super_admin',
        ativo: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria.santos@kzstore.ao',
        role: 'admin',
        ativo: true
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro.costa@kzstore.ao',
        role: 'editor',
        ativo: true
      },
      {
        nome: 'Ana Ferreira',
        email: 'ana.ferreira@kzstore.ao',
        role: 'editor',
        ativo: true
      },
      {
        nome: 'Carlos Mendes',
        email: 'carlos.mendes@kzstore.ao',
        role: 'viewer',
        ativo: true
      }
    ];

    let created = 0;
    for (const member of sampleMembers) {
      try {
        await createTeamMember(member);
        created++;
        setProgress(`Criando membros... ${created}/${sampleMembers.length}`);
      } catch (error) {
        console.error('Error creating member:', error);
      }
    }

    return created;
  };

  const handleCreateSampleData = async () => {
    if (!confirm('Tem certeza que deseja criar dados de exemplo?\n\nIsso irá adicionar 6 anúncios e 5 membros de equipe.')) {
      return;
    }

    setIsCreating(true);
    setProgress('Iniciando...');

    try {
      const adsCreated = await createSampleAds();
      const membersCreated = await createSampleTeamMembers();

      setProgress('Concluído!');
      toast.success(`Dados criados com sucesso! ${adsCreated} anúncios e ${membersCreated} membros.`);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Erro ao criar dados de exemplo');
      setProgress('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="size-14 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
          <Database className="size-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Dados de Exemplo
          </h3>
          <p className="text-gray-600">
            Crie dados de exemplo para testar o sistema de publicidade e gestão de equipe
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="size-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Anúncios</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 1 Banner Hero (Home)</li>
            <li>• 1 Banner Categoria</li>
            <li>• 2 Banners Laterais</li>
            <li>• 1 Banner Central (Home)</li>
            <li>• 1 Banner Checkout</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="size-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Equipe</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 1 Super Admin</li>
            <li>• 1 Admin</li>
            <li>• 2 Editores</li>
            <li>• 1 Visualizador</li>
          </ul>
        </div>
      </div>

      {progress && (
        <div className="mb-6 p-4 bg-blue-100 rounded-xl border border-blue-300">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <AlertCircle className="size-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-900">{progress}</p>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900 mb-1">
              Aviso Importante
            </p>
            <p className="text-sm text-yellow-800">
              Esta ação irá criar novos dados no banco. Certifique-se de que não existem dados duplicados.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleCreateSampleData}
        disabled={isCreating}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
      >
        {isCreating ? (
          <>
            <div className="animate-spin">
              <AlertCircle className="size-5" />
            </div>
            Criando dados...
          </>
        ) : (
          <>
            <CheckCircle className="size-5" />
            Criar Dados de Exemplo
          </>
        )}
      </button>
    </div>
  );
}