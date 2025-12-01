import { ArrowLeft, FileText, ShoppingCart, Package, CreditCard, AlertCircle, Scale } from 'lucide-react';
import { Button } from './ui/button';
import { COMPANY_INFO } from '../config/constants';

type TermsOfServicePageProps = {
  onBack: () => void;
};

export function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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
            <FileText className="size-8 text-[#E31E24]" />
            <h1>Termos e Condições de Uso</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-600 leading-relaxed">
                Bem-vindo à {COMPANY_INFO.fullName}. Ao acessar e usar este site, você concorda em cumprir e
                estar vinculado aos seguintes termos e condições de uso. Se você não concordar com estes termos,
                não utilize nosso site ou serviços.
              </p>
            </section>

            {/* Definições */}
            <section>
              <h2 className="mb-4">2. Definições</h2>
              <ul className="space-y-2 text-gray-600">
                <li><strong>"Nós", "Nosso":</strong> Refere-se à {COMPANY_INFO.name}</li>
                <li><strong>"Você", "Usuário", "Cliente":</strong> Refere-se à pessoa que acessa nosso site</li>
                <li><strong>"Produtos":</strong> Itens disponíveis para compra em nossa loja</li>
                <li><strong>"Serviços":</strong> Todos os serviços oferecidos através do nosso site</li>
                <li><strong>"Conta":</strong> Cadastro criado pelo usuário em nosso sistema</li>
              </ul>
            </section>

            {/* Uso do Site */}
            <section>
              <h2 className="mb-4">3. Uso do Site</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong>3.1 Elegibilidade:</strong> Você deve ter pelo menos 18 anos para fazer compras em nosso site.</p>
                <p><strong>3.2 Cadastro:</strong> Algumas funcionalidades requerem criação de conta. Você é responsável por manter a confidencialidade de suas credenciais.</p>
                <p><strong>3.3 Uso Proibido:</strong> Você concorda em não usar nosso site para:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Atividades ilegais ou fraudulentas</li>
                  <li>Violar direitos de terceiros</li>
                  <li>Transmitir vírus ou códigos maliciosos</li>
                  <li>Fazer engenharia reversa do site</li>
                  <li>Coletar dados de outros usuários sem autorização</li>
                </ul>
              </div>
            </section>

            {/* Produtos e Preços */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="size-5 text-[#E31E24]" />
                <h2>4. Produtos e Preços</h2>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p><strong>4.1 Disponibilidade:</strong> Todos os produtos estão sujeitos a disponibilidade. Reservamo-nos o direito de limitar quantidades.</p>
                <p><strong>4.2 Preços:</strong> Todos os preços estão em Kwanzas (AOA) e incluem IVA quando aplicável. Reservamo-nos o direito de alterar preços sem aviso prévio.</p>
                <p><strong>4.3 Descrições:</strong> Fazemos o possível para descrever produtos com precisão, mas não garantimos que descrições sejam 100% exatas.</p>
                <p><strong>4.4 Imagens:</strong> Imagens são ilustrativas. Cores podem variar dependendo da configuração do seu monitor.</p>
              </div>
            </section>

            {/* Pedidos */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="size-5 text-[#E31E24]" />
                <h2>5. Pedidos e Confirmação</h2>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p><strong>5.1 Processo:</strong> Ao fazer um pedido, você faz uma oferta para comprar o produto. Reservamo-nos o direito de aceitar ou recusar qualquer pedido.</p>
                <p><strong>5.2 Confirmação:</strong> Você receberá confirmação do pedido por e-mail/WhatsApp após a conclusão da compra.</p>
                <p><strong>5.3 Cancelamento:</strong> Podemos cancelar pedidos em caso de:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Produto indisponível</li>
                  <li>Erro de preço</li>
                  <li>Suspeita de fraude</li>
                  <li>Impossibilidade de validar informações de pagamento</li>
                </ul>
                <p><strong>5.4 Cancelamento pelo Cliente:</strong> Você pode cancelar seu pedido antes do envio entrando em contato conosco.</p>
              </div>
            </section>

            {/* Pagamento */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="size-5 text-[#E31E24]" />
                <h2>6. Pagamento</h2>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p><strong>6.1 Métodos Aceitos:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Multicaixa Express</li>
                  <li>Transferência Bancária (BAI, BFA, Atlântico)</li>
                  <li>Referência Bancária</li>
                </ul>
                <p><strong>6.2 Processamento:</strong> Pedidos só serão processados após confirmação do pagamento.</p>
                <p><strong>6.3 Segurança:</strong> Usamos sistemas seguros para processar pagamentos. Nunca armazenamos informações completas de cartão.</p>
              </div>
            </section>

            {/* Entrega */}
            <section>
              <h2 className="mb-4">7. Entrega</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong>7.1 Áreas de Entrega:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Luanda: 24-48 horas (taxa de 2.500 Kz)</li>
                  <li>Outras Províncias: 3-5 dias úteis (taxa a partir de 5.000 Kz)</li>
                </ul>
                <p><strong>7.2 Prazos:</strong> Os prazos são estimativas e podem variar por circunstâncias imprevistas.</p>
                <p><strong>7.3 Recebimento:</strong> É necessário apresentar documento de identificação no momento da entrega.</p>
                <p><strong>7.4 Extravio:</strong> Não nos responsabilizamos por endereços incorretos fornecidos pelo cliente.</p>
              </div>
            </section>

            {/* Garantia e Devoluções */}
            <section>
              <h2 className="mb-4">8. Garantia e Devoluções</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong>8.1 Garantia:</strong> Produtos novos têm garantia do fabricante conforme especificado.</p>
                <p><strong>8.2 Prazo de Devolução:</strong> Você tem 7 dias corridos para devolver produtos com defeito de fabricação.</p>
                <p><strong>8.3 Condições:</strong> Produtos devem estar na embalagem original, sem uso e com todos os acessórios.</p>
                <p><strong>8.4 Procedimento:</strong> Entre em contato conosco antes de enviar qualquer devolução.</p>
                <p><strong>8.5 Não Aceito:</strong> Produtos com dano causado por mau uso não serão aceitos em devolução.</p>
              </div>
            </section>

            {/* Propriedade Intelectual */}
            <section>
              <h2 className="mb-4">9. Propriedade Intelectual</h2>
              <p className="text-gray-600 leading-relaxed">
                Todo conteúdo do site (textos, gráficos, logos, imagens, software) é propriedade da {COMPANY_INFO.name}
                ou de seus fornecedores e é protegido por leis de direitos autorais. É proibido reproduzir, distribuir
                ou modificar qualquer conteúdo sem autorização expressa.
              </p>
            </section>

            {/* Limitação de Responsabilidade */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="size-5 text-[#E31E24]" />
                <h2>10. Limitação de Responsabilidade</h2>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p>Na máxima extensão permitida por lei, a {COMPANY_INFO.name} não se responsabiliza por:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Danos indiretos, incidentais ou consequenciais</li>
                  <li>Perda de lucros ou dados</li>
                  <li>Interrupções de serviço</li>
                  <li>Uso indevido de produtos</li>
                  <li>Incompatibilidade técnica não informada pelo cliente</li>
                </ul>
                <p className="mt-3">
                  Nossa responsabilidade total não excederá o valor pago pelo produto em questão.
                </p>
              </div>
            </section>

            {/* Privacidade */}
            <section>
              <h2 className="mb-4">11. Privacidade</h2>
              <p className="text-gray-600 leading-relaxed">
                O uso de informações pessoais é regido pela nossa Política de Privacidade, que faz parte
                integrante destes Termos.
              </p>
            </section>

            {/* Modificações */}
            <section>
              <h2 className="mb-4">12. Modificações dos Termos</h2>
              <p className="text-gray-600 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entram em vigor
                imediatamente após publicação. O uso continuado do site após alterações constitui aceitação dos
                novos termos.
              </p>
            </section>

            {/* Lei Aplicável */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="size-5 text-[#E31E24]" />
                <h2>13. Lei Aplicável e Jurisdição</h2>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Estes termos são regidos pelas leis da República de Angola. Qualquer disputa será resolvida
                nos tribunais competentes de Luanda, Angola.
              </p>
            </section>

            {/* Contato */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="mb-4">14. Contato</h2>
              <p className="text-gray-600 mb-4">
                Para questões sobre estes Termos e Condições, entre em contato:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> {COMPANY_INFO.email}</p>
                <p><strong>WhatsApp:</strong> {COMPANY_INFO.phone}</p>
                <p><strong>Endereço:</strong> {COMPANY_INFO.address}</p>
              </div>
            </section>

            {/* Aceitação */}
            <section className="border-t pt-6">
              <div className="bg-[#E31E24]/10 p-4 rounded-lg">
                <p className="text-gray-900 text-center">
                  <strong>Ao usar nosso site e serviços, você confirma que leu, compreendeu e concordou
                  com estes Termos e Condições.</strong>
                </p>
              </div>
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
