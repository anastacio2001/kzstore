import { ArrowLeft, RotateCcw, Package, Calendar, CheckCircle, XCircle, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { COMPANY_INFO } from '../config/constants';

type ReturnPolicyPageProps = {
  onBack: () => void;
};

export function ReturnPolicyPage({ onBack }: ReturnPolicyPageProps) {
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
            <RotateCcw className="size-8 text-[#E31E24]" />
            <h1>Política de Devolução e Troca</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="mb-4">Satisfação Garantida</h2>
              <p className="text-gray-600 leading-relaxed">
                Na {COMPANY_INFO.fullName}, a sua satisfação é a nossa prioridade. Entendemos que por vezes 
                um produto pode não atender às suas expectativas. Por isso, oferecemos uma política de devolução 
                e troca justa e transparente para garantir a sua tranquilidade na compra.
              </p>
            </section>

            {/* Prazo de Devolução */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="size-5 text-[#E31E24]" />
                <h2>Prazo para Devolução ou Troca</h2>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-yellow-50 border-l-4 border-[#E31E24] p-6 rounded-lg mb-4">
                <p className="text-gray-900 font-semibold mb-2">
                  ✅ Você tem 7 dias corridos para solicitar devolução ou troca
                </p>
                <p className="text-gray-600 text-sm">
                  O prazo é contado a partir da data de recebimento do produto, conforme a Lei de Defesa do Consumidor angolana.
                </p>
              </div>

              <div className="space-y-3 text-gray-600">
                <p><strong>Importante:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>A solicitação deve ser feita dentro do prazo de 7 dias</li>
                  <li>O produto deve estar nas condições originais</li>
                  <li>Embalagem, acessórios e manuais devem estar completos</li>
                  <li>A nota fiscal/recibo deve acompanhar o produto</li>
                </ul>
              </div>
            </section>

            {/* Condições para Devolução */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="size-5 text-green-600" />
                <h2>Produtos que Aceitamos para Devolução</h2>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <p><strong>Aceitamos devoluções quando:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-green-700">
                  <li>Produto recebido com defeito de fabricação</li>
                  <li>Produto danificado durante o transporte</li>
                  <li>Produto diferente do pedido</li>
                  <li>Produto não corresponde à descrição no site</li>
                  <li>Desistência da compra (direito de arrependimento - 7 dias)</li>
                  <li>Problemas de compatibilidade não informados</li>
                </ul>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                  <p className="text-green-900">
                    <strong>💡 Dica:</strong> Grave um vídeo ao abrir o pacote. Isso agiliza o processo 
                    caso haja algum problema com o produto.
                  </p>
                </div>
              </div>
            </section>

            {/* Produtos NÃO Aceitos */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="size-5 text-red-600" />
                <h2>Produtos que NÃO Aceitamos para Devolução</h2>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-red-900">
                  <li>Produtos com embalagem violada ou danificada pelo cliente</li>
                  <li>Produtos com sinais de uso indevido ou mau uso</li>
                  <li>Produtos personalizados ou sob encomenda</li>
                  <li>Produtos sem a embalagem original ou acessórios</li>
                  <li>Produtos com lacres de garantia rompidos (quando aplicável)</li>
                  <li>Software ou licenças digitais já ativadas</li>
                  <li>Produtos em promoção ou liquidação (exceto defeitos)</li>
                </ul>
              </div>
            </section>

            {/* Como Solicitar */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="size-5 text-[#E31E24]" />
                <h2>Como Solicitar Devolução ou Troca</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="size-8 rounded-full bg-[#E31E24] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Entre em Contato</h3>
                    <p className="text-gray-600 text-sm">
                      Envie uma mensagem via WhatsApp para <strong>{COMPANY_INFO.whatsapp}</strong> informando:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-4">
                      <li>Número do pedido</li>
                      <li>Motivo da devolução/troca</li>
                      <li>Fotos ou vídeos do produto (se aplicável)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="size-8 rounded-full bg-[#E31E24] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Aguarde Aprovação</h3>
                    <p className="text-gray-600 text-sm">
                      Nossa equipe analisará o seu pedido em até 24 horas úteis e retornará com as instruções.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="size-8 rounded-full bg-[#E31E24] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Envio do Produto</h3>
                    <p className="text-gray-600 text-sm">
                      Após aprovação, você receberá um código de autorização (RMA). Envie o produto com:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-4">
                      <li>Embalagem original</li>
                      <li>Todos os acessórios</li>
                      <li>Nota fiscal/recibo</li>
                      <li>Código RMA (impresso ou escrito)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="size-8 rounded-full bg-[#E31E24] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Recebimento e Análise</h3>
                    <p className="text-gray-600 text-sm">
                      Ao recebermos o produto, faremos a análise técnica em até 3 dias úteis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="size-8 rounded-full bg-[#E31E24] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Resolução</h3>
                    <p className="text-gray-600 text-sm">
                      Se aprovado, você poderá escolher entre:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-4">
                      <li><strong>Reembolso:</strong> Devolução do valor em até 7 dias úteis</li>
                      <li><strong>Troca:</strong> Envio de produto similar ou outro de sua escolha</li>
                      <li><strong>Crédito:</strong> Crédito na loja para compras futuras</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Custos de Frete */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-5 text-[#FDD835]" />
                <h2>Custos de Envio na Devolução</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-900">
                    <strong>✅ Frete GRÁTIS na devolução quando:</strong>
                  </p>
                  <ul className="list-disc list-inside text-green-800 mt-2 ml-4">
                    <li>Produto com defeito de fabricação</li>
                    <li>Produto errado enviado por nossa culpa</li>
                    <li>Produto danificado no transporte</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-900">
                    <strong>💰 Frete por conta do cliente quando:</strong>
                  </p>
                  <ul className="list-disc list-inside text-yellow-800 mt-2 ml-4">
                    <li>Desistência da compra (direito de arrependimento)</li>
                    <li>Produto não atende às expectativas (sem defeito)</li>
                    <li>Erro na escolha do produto pelo cliente</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prazo de Reembolso */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="size-5 text-[#E31E24]" />
                <h2>Prazo de Reembolso</h2>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <p className="text-blue-900 mb-3">
                  <strong>Após aprovação da devolução:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-blue-800">
                  <li><strong>Multicaixa Express:</strong> 3 a 7 dias úteis</li>
                  <li><strong>Transferência Bancária:</strong> 3 a 5 dias úteis</li>
                  <li><strong>Crédito na Loja:</strong> Imediato</li>
                </ul>
                <p className="text-blue-700 text-sm mt-4">
                  💡 O crédito na loja é a opção mais rápida e pode ser usado imediatamente em qualquer compra.
                </p>
              </div>
            </section>

            {/* Garantia */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="size-5 text-[#E31E24]" />
                <h2>Garantia de Produtos</h2>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  Todos os produtos vendidos na KZSTORE possuem garantia, que varia conforme o tipo e condição:
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <h3 className="text-green-900 font-semibold mb-2">🆕 Produtos Novos</h3>
                    <p className="text-green-800 text-sm">
                      <strong>Garantia do Fabricante:</strong><br />
                      12 a 36 meses (conforme especificação)
                    </p>
                  </div>

                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-blue-900 font-semibold mb-2">🔄 Produtos Refurbished</h3>
                    <p className="text-blue-800 text-sm">
                      <strong>Garantia KZSTORE:</strong><br />
                      6 a 12 meses
                    </p>
                  </div>

                  <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-orange-900 font-semibold mb-2">♻️ Produtos Usados</h3>
                    <p className="text-orange-800 text-sm">
                      <strong>Garantia KZSTORE:</strong><br />
                      3 a 6 meses
                    </p>
                  </div>
                </div>

                <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">
                    ⚠️ A garantia NÃO cobre:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                    <li>Danos causados por mau uso, quedas ou líquidos</li>
                    <li>Desgaste natural do produto</li>
                    <li>Modificações ou reparos não autorizados</li>
                    <li>Uso inadequado ou fora das especificações</li>
                    <li>Problemas elétricos externos (quedas de tensão)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contato */}
            <section className="border-t pt-8">
              <h2 className="mb-4">Precisa de Ajuda?</h2>
              <p className="text-gray-600 mb-4">
                Nossa equipe de atendimento está pronta para ajudar com qualquer dúvida sobre devoluções, 
                trocas ou garantia.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Package className="size-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">WhatsApp</p>
                    <p className="text-sm text-green-700">{COMPANY_INFO.whatsapp}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <AlertTriangle className="size-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Email</p>
                    <p className="text-sm text-blue-700">{COMPANY_INFO.email}</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Nota Legal */}
            <section className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg">
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Nota Legal:</strong> Esta política de devolução está em conformidade com a Lei de Defesa 
                do Consumidor de Angola e pode ser alterada sem aviso prévio. Recomendamos que consulte esta 
                página periodicamente para estar atualizado sobre nossas políticas.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
