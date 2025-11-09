import { ArrowLeft, Cookie, Eye, BarChart, Target, Settings, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { COMPANY_INFO } from '../config/constants';

type CookiePolicyPageProps = {
  onBack: () => void;
};

export function CookiePolicyPage({ onBack }: CookiePolicyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Voltar
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="size-8 text-[#E31E24]" />
            <h1>Política de Cookies</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="mb-4">O que são Cookies?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) 
                quando você visita um site. Eles são amplamente utilizados para fazer com que os sites funcionem de 
                maneira mais eficiente e fornecer informações aos proprietários do site.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                <p className="text-blue-900 text-sm">
                  💡 <strong>Importante:</strong> Os cookies não danificam o seu dispositivo e não podem ser usados 
                  para executar programas ou transmitir vírus.
                </p>
              </div>
            </section>

            {/* Por que usamos */}
            <section>
              <h2 className="mb-4">Por que a KZSTORE usa Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Utilizamos cookies para melhorar a sua experiência de navegação e compra no nosso site. 
                Eles nos ajudam a:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Eye className="size-5 text-[#E31E24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Lembrar as suas preferências</h3>
                    <p className="text-sm text-gray-600">
                      Como idioma, moeda, produtos no carrinho e itens favoritados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <BarChart className="size-5 text-[#E31E24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Analisar o uso do site</h3>
                    <p className="text-sm text-gray-600">
                      Entender como você navega para melhorar a experiência
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Target className="size-5 text-[#E31E24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Personalizar conteúdo</h3>
                    <p className="text-sm text-gray-600">
                      Mostrar produtos e ofertas relevantes aos seus interesses
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="size-5 text-[#E31E24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Garantir segurança</h3>
                    <p className="text-sm text-gray-600">
                      Proteger a sua conta e prevenir fraudes
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tipos de Cookies */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="size-5 text-[#E31E24]" />
                <h2>Tipos de Cookies que Utilizamos</h2>
              </div>

              <div className="space-y-4">
                {/* Cookies Essenciais */}
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h3 className="font-semibold text-red-900 flex items-center gap-2">
                      🔴 Cookies Estritamente Necessários
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">OBRIGATÓRIO</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">
                      Estes cookies são essenciais para o funcionamento do site. Sem eles, o site não funciona corretamente.
                    </p>
                    <p className="text-gray-700 text-sm mb-2"><strong>Exemplos:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li><strong>session_id:</strong> Mantém você conectado durante a navegação</li>
                      <li><strong>cart_items:</strong> Guarda os produtos no seu carrinho</li>
                      <li><strong>csrf_token:</strong> Proteção contra ataques de segurança</li>
                      <li><strong>auth_token:</strong> Autenticação da sua sessão</li>
                    </ul>
                    <p className="text-red-700 text-sm mt-3 font-medium">
                      ⚠️ Não podem ser desativados pois são necessários para o funcionamento básico do site.
                    </p>
                  </div>
                </div>

                {/* Cookies de Funcionalidade */}
                <div className="border border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      🔵 Cookies de Funcionalidade
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">OPCIONAL</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">
                      Permitem que o site lembre de escolhas que você faz (como preferências) e ofereça recursos aprimorados.
                    </p>
                    <p className="text-gray-700 text-sm mb-2"><strong>Exemplos:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li><strong>language:</strong> Idioma preferido (PT-AO, PT-PT, EN)</li>
                      <li><strong>currency:</strong> Moeda preferida (AOA, EUR, USD)</li>
                      <li><strong>theme:</strong> Tema claro ou escuro (se disponível)</li>
                      <li><strong>wishlist:</strong> Lista de desejos salva</li>
                      <li><strong>recent_views:</strong> Produtos visualizados recentemente</li>
                    </ul>
                  </div>
                </div>

                {/* Cookies de Desempenho */}
                <div className="border border-yellow-200 rounded-lg overflow-hidden">
                  <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                      🟡 Cookies de Desempenho e Análise
                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">OPCIONAL</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">
                      Coletam informações sobre como você usa o site para nos ajudar a melhorar.
                    </p>
                    <p className="text-gray-700 text-sm mb-2"><strong>Exemplos:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li><strong>_ga (Google Analytics):</strong> Estatísticas de uso do site</li>
                      <li><strong>_gid (Google Analytics):</strong> Distingue usuários</li>
                      <li><strong>analytics_session:</strong> Duração da sessão</li>
                      <li><strong>page_views:</strong> Páginas mais visitadas</li>
                    </ul>
                    <p className="text-yellow-700 text-sm mt-3">
                      💡 Estes dados são anônimos e usados apenas para estatísticas.
                    </p>
                  </div>
                </div>

                {/* Cookies de Marketing */}
                <div className="border border-purple-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      🟣 Cookies de Marketing e Publicidade
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">OPCIONAL</span>
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3">
                      Usados para mostrar anúncios relevantes e medir a eficácia de campanhas publicitárias.
                    </p>
                    <p className="text-gray-700 text-sm mb-2"><strong>Exemplos:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li><strong>fbp (Facebook Pixel):</strong> Rastreamento de conversões</li>
                      <li><strong>_gcl (Google Ads):</strong> Campanhas publicitárias</li>
                      <li><strong>retargeting_id:</strong> Anúncios personalizados</li>
                      <li><strong>conversion_track:</strong> Acompanhamento de vendas</li>
                    </ul>
                    <p className="text-purple-700 text-sm mt-3">
                      🎯 Ajudam a mostrar produtos que possam interessar você.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Duração dos Cookies */}
            <section>
              <h2 className="mb-4">Duração dos Cookies</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ⏱️ Cookies de Sessão
                  </h3>
                  <p className="text-gray-600 text-sm">
                    São temporários e expiram quando você fecha o navegador. São usados para manter 
                    sua sessão ativa durante a navegação.
                  </p>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📅 Cookies Persistentes
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Permanecem no seu dispositivo por um período específico (dias, meses ou anos) 
                    até expirarem ou serem excluídos manualmente.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  <strong>Períodos típicos:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4 mt-2">
                  <li>Autenticação: 30 dias</li>
                  <li>Preferências: 1 ano</li>
                  <li>Carrinho de compras: 7 dias</li>
                  <li>Analytics: 2 anos</li>
                  <li>Marketing: 90 dias</li>
                </ul>
              </div>
            </section>

            {/* Cookies de Terceiros */}
            <section>
              <h2 className="mb-4">Cookies de Terceiros</h2>
              <p className="text-gray-600 mb-4">
                Além dos nossos próprios cookies, também utilizamos cookies de parceiros confiáveis:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="size-10 flex-shrink-0">
                    <div className="size-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                      G
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Google Analytics</h3>
                    <p className="text-sm text-gray-600">
                      Análise de tráfego e comportamento dos usuários. 
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#E31E24] hover:underline ml-1">
                        Política de Privacidade do Google
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="size-10 flex-shrink-0">
                    <div className="size-10 rounded bg-blue-700 flex items-center justify-center text-white font-bold">
                      f
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Facebook Pixel</h3>
                    <p className="text-sm text-gray-600">
                      Rastreamento de conversões e remarketing. 
                      <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener noreferrer" className="text-[#E31E24] hover:underline ml-1">
                        Política do Facebook
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="size-10 flex-shrink-0">
                    <div className="size-10 rounded bg-green-600 flex items-center justify-center text-white font-bold">
                      W
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp Business</h3>
                    <p className="text-sm text-gray-600">
                      Chat e atendimento ao cliente integrado.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Como Controlar Cookies */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="size-5 text-[#E31E24]" />
                <h2>Como Controlar ou Remover Cookies</h2>
              </div>

              <p className="text-gray-600 mb-4">
                Você tem o direito de aceitar ou recusar cookies. Você pode configurar seu navegador 
                para recusar todos ou alguns cookies, ou para alertá-lo quando sites definem ou acessam cookies.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg mb-4">
                <p className="text-yellow-900 text-sm">
                  ⚠️ <strong>Atenção:</strong> Se você bloquear ou excluir cookies, algumas funcionalidades 
                  do site podem não funcionar corretamente (como carrinho de compras e login).
                </p>
              </div>

              <div className="space-y-3">
                <details className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-100">
                    🌐 Google Chrome
                  </summary>
                  <div className="p-4 text-sm text-gray-600">
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Clique no menu (três pontos) no canto superior direito</li>
                      <li>Selecione "Configurações"</li>
                      <li>Clique em "Privacidade e segurança"</li>
                      <li>Selecione "Cookies e outros dados do site"</li>
                      <li>Escolha suas preferências</li>
                    </ol>
                  </div>
                </details>

                <details className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-100">
                    🦊 Mozilla Firefox
                  </summary>
                  <div className="p-4 text-sm text-gray-600">
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Clique no menu (três linhas) no canto superior direito</li>
                      <li>Selecione "Configurações"</li>
                      <li>Clique em "Privacidade e Segurança"</li>
                      <li>Em "Cookies e dados de sites", escolha suas preferências</li>
                    </ol>
                  </div>
                </details>

                <details className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-100">
                    🧭 Safari
                  </summary>
                  <div className="p-4 text-sm text-gray-600">
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Vá em "Preferências" no menu Safari</li>
                      <li>Clique na aba "Privacidade"</li>
                      <li>Selecione suas preferências de cookies</li>
                    </ol>
                  </div>
                </details>

                <details className="border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-semibold text-gray-900 hover:bg-gray-100">
                    🔷 Microsoft Edge
                  </summary>
                  <div className="p-4 text-sm text-gray-600">
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Clique no menu (três pontos) no canto superior direito</li>
                      <li>Selecione "Configurações"</li>
                      <li>Clique em "Cookies e permissões do site"</li>
                      <li>Selecione "Cookies e dados armazenados do site"</li>
                    </ol>
                  </div>
                </details>
              </div>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="mb-4">Alterações nesta Política</h2>
              <p className="text-gray-600">
                Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas 
                práticas ou por outras razões operacionais, legais ou regulatórias. Recomendamos que você 
                revise esta página regularmente para estar ciente de quaisquer alterações.
              </p>
            </section>

            {/* Contato */}
            <section className="border-t pt-8">
              <h2 className="mb-4">Dúvidas sobre Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Se você tiver alguma dúvida sobre o uso de cookies no nosso site, entre em contato:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Shield className="size-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Email</p>
                    <p className="text-sm text-blue-700">{COMPANY_INFO.email}</p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Cookie className="size-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">WhatsApp</p>
                    <p className="text-sm text-green-700">{COMPANY_INFO.whatsapp}</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Consentimento */}
            <section className="bg-gradient-to-r from-red-50 to-yellow-50 border-l-4 border-[#E31E24] p-6 rounded-lg">
              <p className="text-gray-900 font-semibold mb-2">
                ✅ Ao continuar a usar o site da KZSTORE, você concorda com o uso de cookies
              </p>
              <p className="text-gray-600 text-sm">
                Ao navegar no nosso site, você aceita automaticamente o uso de cookies essenciais. 
                Para cookies opcionais, você pode gerenciar suas preferências através das configurações 
                do seu navegador ou através do banner de cookies que aparece na primeira visita.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
