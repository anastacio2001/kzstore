import { Briefcase, MapPin, Clock, ArrowRight, Users, TrendingUp, Award, Heart } from 'lucide-react';
import { Button } from './ui/button';

type CarreirasPageProps = {
  onBack?: () => void;
};

export function CarreirasPage({ onBack }: CarreirasPageProps) {
  const openPositions = [
    {
      id: '1',
      title: 'Técnico de Suporte IT',
      department: 'Suporte Técnico',
      location: 'Luanda',
      type: 'Tempo Integral',
      description: 'Buscamos profissional para suporte técnico em hardware e software, atendimento ao cliente e manutenção de equipamentos.'
    },
    {
      id: '2',
      title: 'Vendedor(a) Comercial',
      department: 'Vendas',
      location: 'Luanda',
      type: 'Tempo Integral',
      description: 'Profissional com experiência em vendas B2B, conhecimento em produtos de tecnologia e excelente comunicação.'
    },
    {
      id: '3',
      title: 'Gestor de Logística',
      department: 'Logística',
      location: 'Luanda',
      type: 'Tempo Integral',
      description: 'Responsável pela gestão de estoque, coordenação de entregas e otimização de processos logísticos.'
    },
    {
      id: '4',
      title: 'Desenvolvedor Web',
      department: 'TI',
      location: 'Remoto',
      type: 'Freelance',
      description: 'Desenvolvedor com experiência em React, TypeScript e integração com APIs para manutenção e evolução da plataforma.'
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Crescimento Profissional',
      description: 'Oportunidades de desenvolvimento e progressão de carreira'
    },
    {
      icon: Award,
      title: 'Ambiente Colaborativo',
      description: 'Trabalhe com uma equipe apaixonada por tecnologia'
    },
    {
      icon: Heart,
      title: 'Benefícios Competitivos',
      description: 'Salário justo, bônus por desempenho e benefícios'
    },
    {
      icon: Users,
      title: 'Cultura Inclusiva',
      description: 'Valorizamos diversidade e inclusão em nosso time'
    }
  ];

  const values = [
    {
      title: 'Inovação',
      description: 'Buscamos sempre as melhores soluções tecnológicas'
    },
    {
      title: 'Excelência',
      description: 'Comprometimento com qualidade em tudo que fazemos'
    },
    {
      title: 'Integridade',
      description: 'Transparência e honestidade em todas as relações'
    },
    {
      title: 'Cliente em Primeiro',
      description: 'Foco total na satisfação dos nossos clientes'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="size-8 text-[#E31E24]" />
            <h1 className="text-[#1a1a2e]">Carreiras na KZSTORE</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Junte-se à equipe líder em distribuição de tecnologia em Angola. 
            Construa sua carreira conosco!
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#E31E24] to-[#c41a1f] rounded-2xl p-12 text-white mb-16 text-center">
          <h2 className="text-white mb-4">Por que trabalhar na KZSTORE?</h2>
          <p className="text-white/90 max-w-3xl mx-auto text-lg">
            Somos uma empresa em crescimento, com ambiente dinâmico e oportunidades 
            reais de desenvolvimento. Aqui você faz parte de algo maior!
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-[#1a1a2e] text-center mb-10">Nossos Benefícios</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center">
                  <div className="w-12 h-12 bg-[#E31E24]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="size-6 text-[#E31E24]" />
                  </div>
                  <h3 className="text-[#1a1a2e] text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <h2 className="text-[#1a1a2e] text-center mb-10">Nossos Valores</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#E31E24] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-[#1a1a2e] mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-[#1a1a2e] mb-8">Vagas Abertas</h2>
          
          {openPositions.length > 0 ? (
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div key={position.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[#1a1a2e] text-xl mb-2">{position.title}</h3>
                      <p className="text-gray-600 mb-4">{position.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4" />
                          <span>{position.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4" />
                          <span>{position.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button className="bg-[#E31E24] hover:bg-[#c41a1f] text-white">
                        Candidatar-se
                        <ArrowRight className="size-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="size-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-600 mb-2">Nenhuma vaga disponível no momento</h3>
              <p className="text-gray-500 text-sm">
                Mas você pode enviar seu currículo para futuras oportunidades!
              </p>
            </div>
          )}
        </div>

        {/* Spontaneous Application */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] rounded-2xl p-12 text-white text-center">
          <h2 className="text-white mb-4">Não encontrou a vaga ideal?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Envie seu currículo para nosso banco de talentos e seja o primeiro 
            a saber quando surgir uma oportunidade que combine com seu perfil!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-[#E31E24] hover:bg-[#c41a1f] text-white px-8">
              Enviar Currículo
            </Button>
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8">
              Fale Conosco
            </Button>
          </div>
        </div>

        {/* Process */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-[#1a1a2e] text-center mb-10">Processo de Seleção</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#E31E24] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h4 className="text-[#1a1a2e] mb-2">Candidatura</h4>
              <p className="text-gray-600 text-sm">Envie seu currículo</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#E31E24] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h4 className="text-[#1a1a2e] mb-2">Triagem</h4>
              <p className="text-gray-600 text-sm">Análise de perfil</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#E31E24] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h4 className="text-[#1a1a2e] mb-2">Entrevista</h4>
              <p className="text-gray-600 text-sm">Bate-papo com RH</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[#E31E24] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h4 className="text-[#1a1a2e] mb-2">Contratação</h4>
              <p className="text-gray-600 text-sm">Bem-vindo ao time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
