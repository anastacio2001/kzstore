import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { COMPANY_INFO } from '../config/constants';

type PrivacyPolicyPageProps = {
  onBack: () => void;
};

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
            <Shield className="size-8 text-[#E31E24]" />
            <h1>Política de Privacidade</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="mb-4">1. Introdução</h2>
              <p className="text-gray-600 leading-relaxed">
                A {COMPANY_INFO.fullName} ("KZSTORE", "nós", "nosso") está comprometida em proteger a privacidade
                dos nossos clientes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e
                protegemos suas informações pessoais quando você utiliza nossa loja online.
              </p>
            </section>

            {/* Informações Coletadas */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="size-5 text-[#E31E24]" />
                <h2>2. Informações que Coletamos</h2>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="text-gray-900 mb-2">2.1 Informações Fornecidas por Você:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Número de telefone/WhatsApp</li>
                    <li>Endereço de entrega</li>
                    <li>Informações de pagamento (processadas de forma segura)</li>
                    <li>Histórico de pedidos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-gray-900 mb-2">2.2 Informações Coletadas Automaticamente:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e dispositivo</li>
                    <li>Páginas visitadas em nosso site</li>
                    <li>Data e hora de acesso</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Como Usamos suas Informações */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="size-5 text-[#E31E24]" />
                <h2>3. Como Usamos suas Informações</h2>
              </div>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Processar e entregar seus pedidos</li>
                <li>Comunicar sobre o status do pedido</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Enviar ofertas e promoções (com seu consentimento)</li>
                <li>Prevenir fraudes e garantir a segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            {/* Compartilhamento de Informações */}
            <section>
              <h2 className="mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-gray-600 mb-3">
                Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas com:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><strong>Processadores de Pagamento:</strong> Para processar transações (Multicaixa, bancos)</li>
                <li><strong>Empresas de Entrega:</strong> Para enviar seus pedidos</li>
                <li><strong>Prestadores de Serviços:</strong> Que nos ajudam a operar o negócio</li>
                <li><strong>Autoridades Legais:</strong> Quando exigido por lei</li>
              </ul>
            </section>

            {/* Segurança */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="size-5 text-[#E31E24]" />
                <h2>5. Segurança dos Dados</h2>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
                contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mt-3">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Armazenamento seguro em servidores protegidos</li>
                <li>Acesso restrito às informações pessoais</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares de dados</li>
              </ul>
            </section>

            {/* Seus Direitos */}
            <section>
              <h2 className="mb-4">6. Seus Direitos</h2>
              <p className="text-gray-600 mb-3">Você tem o direito de:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li><strong>Acessar:</strong> Solicitar cópia das informações que temos sobre você</li>
                <li><strong>Corrigir:</strong> Atualizar informações incorretas ou incompletas</li>
                <li><strong>Excluir:</strong> Solicitar a exclusão de suas informações pessoais</li>
                <li><strong>Revogar Consentimento:</strong> Cancelar a inscrição em comunicações de marketing</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="mb-4">7. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência de navegação. Você pode configurar seu navegador
                para recusar cookies, mas isso pode limitar algumas funcionalidades do site. Usamos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4 mt-3">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento do site</li>
                <li><strong>Cookies de Desempenho:</strong> Para análise e melhoria do site</li>
                <li><strong>Cookies de Funcionalidade:</strong> Para lembrar suas preferências</li>
              </ul>
            </section>

            {/* Retenção de Dados */}
            <section>
              <h2 className="mb-4">8. Retenção de Dados</h2>
              <p className="text-gray-600 leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos
                descritos nesta política, a menos que um período de retenção mais longo seja exigido ou
                permitido por lei.
              </p>
            </section>

            {/* Menores de Idade */}
            <section>
              <h2 className="mb-4">9. Menores de Idade</h2>
              <p className="text-gray-600 leading-relaxed">
                Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente
                informações de menores sem o consentimento dos pais ou responsáveis.
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="mb-4">10. Alterações nesta Política</h2>
              <p className="text-gray-600 leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre
                alterações significativas publicando a nova política em nosso site e atualizando a data
                de "última atualização".
              </p>
            </section>

            {/* Contato */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="size-5 text-[#E31E24]" />
                <h2>11. Entre em Contato</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos,
                entre em contato conosco:
              </p>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <span>{COMPANY_INFO.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  <span>{COMPANY_INFO.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="size-4" />
                  <span>{COMPANY_INFO.address}</span>
                </div>
              </div>
            </section>

            {/* Lei Aplicável */}
            <section>
              <h2 className="mb-4">12. Lei Aplicável</h2>
              <p className="text-gray-600 leading-relaxed">
                Esta Política de Privacidade é regida pelas leis da República de Angola e está em conformidade
                com as regulamentações de proteção de dados aplicáveis.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} {COMPANY_INFO.name}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
