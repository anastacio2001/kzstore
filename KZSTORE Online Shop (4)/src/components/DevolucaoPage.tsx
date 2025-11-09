import { RefreshCw, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type DevolucaoPageProps = {
  onBack?: () => void;
};

export function DevolucaoPage({ onBack }: DevolucaoPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RefreshCw className="size-8 text-[#E31E24]" />
            <h1 className="text-[#1a1a2e]">Política de Devolução</h1>
          </div>
          <p className="text-gray-600">
            Atualizado em: 07 de Novembro de 2024
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Clock className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">7 Dias</h3>
            <p className="text-gray-600 text-sm">Prazo para devolução</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Package className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">Embalagem Original</h3>
            <p className="text-gray-600 text-sm">Produto deve estar lacrado</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircle className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">Garantia de Qualidade</h3>
            <p className="text-gray-600 text-sm">100% dos seus direitos</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">1. Direito de Arrependimento</h2>
            <p className="text-gray-600 mb-4">
              De acordo com a legislação angolana de proteção ao consumidor, você tem o direito de 
              desistir da compra em até <strong className="text-[#E31E24]">7 (sete) dias corridos</strong> a 
              partir da data de recebimento do produto, sem necessidade de justificativa.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <strong>Importante:</strong> O produto deve estar em perfeitas condições, sem sinais de uso, 
                  com embalagem original, lacres, manuais, cabos e todos os acessórios que acompanham o produto.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">2. Produtos com Defeito</h2>
            <p className="text-gray-600 mb-4">
              Se o produto apresentar defeito de fabricação ou vícios de qualidade, você pode solicitar:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Troca:</strong> Por produto equivalente ou similar</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Reparo:</strong> Conserto do produto sem custos adicionais</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Devolução:</strong> Reembolso integral do valor pago</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">3. Como Solicitar Devolução</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Entre em Contato</h3>
                  <p className="text-gray-600 text-sm">
                    WhatsApp: <a href="tel:+244931054015" className="text-[#E31E24] hover:underline">+244 931 054 015</a><br />
                    Email: <a href="mailto:devolucoes@kzstore.ao" className="text-[#E31E24] hover:underline">devolucoes@kzstore.ao</a>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Forneça Informações</h3>
                  <p className="text-gray-600 text-sm">
                    Número do pedido, motivo da devolução e fotos do produto (se defeito)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Aguarde Aprovação</h3>
                  <p className="text-gray-600 text-sm">
                    Nossa equipe analisará em até 24h úteis e enviará instruções
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Envie o Produto</h3>
                  <p className="text-gray-600 text-sm">
                    Embale adequadamente e envie para o endereço fornecido
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Receba Reembolso ou Troca</h3>
                  <p className="text-gray-600 text-sm">
                    Após inspeção, processaremos reembolso em até 7 dias úteis
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">4. Produtos Não Aceitos para Devolução</h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-600">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Produtos com embalagem violada ou lacres rompidos (exceto defeito)</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Produtos com sinais de uso, arranhões ou danos causados pelo cliente</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Produtos sem nota fiscal ou comprovante de compra</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Produtos fora do prazo de devolução (7 dias)</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Softwares ou licenças digitais já ativadas</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">5. Reembolso</h2>
            <p className="text-gray-600 mb-4">
              O reembolso será realizado através do mesmo meio de pagamento utilizado na compra:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Multicaixa Express:</strong> Reembolso em até 5 dias úteis</li>
              <li>• <strong>Transferência Bancária:</strong> Reembolso em até 7 dias úteis</li>
              <li>• <strong>Pagamento na Entrega:</strong> Reembolso via transferência bancária</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">6. Custos de Envio</h2>
            <p className="text-gray-600 mb-4">
              <strong>Arrependimento:</strong> O custo de devolução é de responsabilidade do cliente.<br />
              <strong>Defeito de Fabricação:</strong> A KZSTORE assume todos os custos de envio.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">7. Endereço para Devolução</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
              <p className="font-semibold">KZSTORE - Central de Devoluções</p>
              <p>Luanda, Angola</p>
              <p className="text-sm text-gray-500 mt-2">
                * Endereço específico será fornecido após aprovação da solicitação
              </p>
            </div>
          </section>

          {/* Contact */}
          <div className="bg-[#E31E24]/10 border border-[#E31E24]/20 rounded-lg p-6 mt-8">
            <h3 className="text-[#1a1a2e] mb-3">💬 Dúvidas sobre Devolução?</h3>
            <p className="text-gray-600 mb-4">
              Nossa equipe está pronta para ajudar você!
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                📱 WhatsApp: <a href="tel:+244931054015" className="text-[#E31E24] hover:underline font-semibold">+244 931 054 015</a>
              </p>
              <p className="text-gray-700">
                📧 Email: <a href="mailto:devolucoes@kzstore.ao" className="text-[#E31E24] hover:underline font-semibold">devolucoes@kzstore.ao</a>
              </p>
              <p className="text-gray-700">
                🕐 Horário: Segunda a Sexta, 8h às 18h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
