import { Shield, CheckCircle, Clock, FileText, AlertCircle, Wrench } from 'lucide-react';

type GarantiaPageProps = {
  onBack?: () => void;
};

export function GarantiaPage({ onBack }: GarantiaPageProps) {
  const warrantyTypes = [
    {
      category: 'Memórias RAM',
      warranty: ' 3 semanas ',
      details: 'Garantia do fabricante contra defeitos de fabricação'
    },
    {
      category: 'SSDs e Hard Disks',
      warranty: ' Duas semanas ',
      details: 'Varia conforme fabricante (Samsung, WD, Seagate, etc.)'
    },
    {
      category: 'Mini PCs',
      warranty: ' Duas semanas ',
      details: 'Garantia de fábrica contra defeitos de fabricação'
    },
    {
      category: 'Câmeras Wi-Fi',
      warranty: 'Duas semanas',
      details: 'Garantia do fabricante para defeitos de hardware'
    },
    {
      category: 'Telemóveis',
      warranty: '1 semana',
      details: 'Garantia de fábrica (não cobre danos físicos)'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="size-8 text-[#E31E24]" />
            <h1 className="text-[#1a1a2e]">Garantia KZSTORE</h1>
          </div>
          <p className="text-gray-600">
            Sua tranquilidade é nossa prioridade. Conheça nossa política de garantia.
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Shield className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">100% Original</h3>
            <p className="text-gray-600 text-sm">Produtos com garantia de fábrica</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Wrench className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">Suporte Técnico</h3>
            <p className="text-gray-600 text-sm">Assistência especializada</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircle className="size-8 text-[#E31E24] mx-auto mb-3" />
            <h3 className="text-[#1a1a2e] mb-2">Troca Rápida</h3>
            <p className="text-gray-600 text-sm">Processo ágil e transparente</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">1. Cobertura de Garantia</h2>
            <p className="text-gray-600 mb-6">
              Todos os produtos vendidos pela KZSTORE possuem garantia de fábrica contra defeitos 
              de fabricação. Os prazos variam conforme a categoria do produto:
            </p>
            
            <div className="space-y-3">
              {warrantyTypes.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#E31E24] transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-[#1a1a2e] mb-1">{item.category}</h3>
                      <p className="text-gray-600 text-sm">{item.details}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="bg-[#E31E24] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.warranty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">2. O que a Garantia Cobre</h2>
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Defeitos de fabricação identificados durante o período de garantia</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Mau funcionamento sem causa aparente ou uso indevido</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Componentes com defeito original de fábrica</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Problemas de hardware não relacionados ao uso inadequado</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">3. O que a Garantia NÃO Cobre</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">
                  <strong>Importante:</strong> A garantia é anulada em caso de uso indevido ou danos físicos.
                </div>
              </div>
            </div>
            
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Danos causados por queda, impacto, umidade ou líquidos</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Uso inadequado, mau uso ou negligência</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Tentativa de reparo por terceiros não autorizados</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Remoção de lacres de garantia ou etiquetas</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Problemas de software, vírus ou configurações incorretas</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Desgaste natural pelo uso (baterias, telas, etc.)</span>
              </li>
              <li className="flex gap-3 text-gray-600">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Sobretensão elétrica ou descargas elétricas</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">4. Como Acionar a Garantia</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Contate o Suporte</h3>
                  <p className="text-gray-600 text-sm">
                    WhatsApp: <a href="tel:+244931054015" className="text-[#E31E24] hover:underline">+244 931 054 015</a><br />
                    Email: <a href="mailto:garantia@kzstore.ao" className="text-[#E31E24] hover:underline">garantia@kzstore.ao</a>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Documentação Necessária</h3>
                  <p className="text-gray-600 text-sm">
                    • Nota fiscal ou comprovante de compra<br />
                    • Descrição detalhada do problema<br />
                    • Fotos ou vídeos do defeito (se possível)<br />
                    • Número de série do produto
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Análise Técnica</h3>
                  <p className="text-gray-600 text-sm">
                    Nossa equipe técnica irá avaliar o produto em até 5 dias úteis
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-[#1a1a2e] mb-1">Resolução</h3>
                  <p className="text-gray-600 text-sm">
                    Reparo, troca por produto novo ou reembolso (conforme análise)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">5. Prazos de Atendimento</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-5 text-[#E31E24]" />
                  <h3 className="text-[#1a1a2e]">Análise Inicial</h3>
                </div>
                <p className="text-gray-600 text-sm">Até 24 horas para resposta inicial</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-5 text-[#E31E24]" />
                  <h3 className="text-[#1a1a2e]">Avaliação Técnica</h3>
                </div>
                <p className="text-gray-600 text-sm">Até 5 dias úteis após recebimento</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-5 text-[#E31E24]" />
                  <h3 className="text-[#1a1a2e]">Reparo</h3>
                </div>
                <p className="text-gray-600 text-sm">Até 15 dias úteis (varia conforme defeito)</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-5 text-[#E31E24]" />
                  <h3 className="text-[#1a1a2e]">Troca/Reembolso</h3>
                </div>
                <p className="text-gray-600 text-sm">Até 7 dias úteis após aprovação</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">6. Garantia Estendida</h2>
            <p className="text-gray-600 mb-4">
              Para alguns produtos, oferecemos opção de garantia estendida com cobertura adicional. 
              Consulte disponibilidade no momento da compra.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-[#1a1a2e] mb-2">Vantagens da Garantia Estendida:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Prazo de garantia ampliado em até 2 anos adicionais</li>
                <li>✓ Cobertura para desgaste natural de componentes</li>
                <li>✓ Prioridade no atendimento técnico</li>
                <li>✓ Possibilidade de cobertura para danos acidentais</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-[#1a1a2e] mb-4">7. Dicas para Preservar a Garantia</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Guarde sempre a nota fiscal e comprovante de compra</li>
              <li>✓ Não remova etiquetas, lacres ou selos de garantia</li>
              <li>✓ Utilize o produto conforme instruções do manual</li>
              <li>✓ Evite exposição a temperaturas extremas</li>
              <li>✓ Não tente reparos por conta própria</li>
              <li>✓ Mantenha o produto em local seguro e protegido</li>
              <li>✓ Em caso de problemas, contate imediatamente o suporte</li>
            </ul>
          </section>

          {/* Contact */}
          <div className="bg-[#E31E24]/10 border border-[#E31E24]/20 rounded-lg p-6 mt-8">
            <h3 className="text-[#1a1a2e] mb-3">🛡️ Central de Garantias</h3>
            <p className="text-gray-600 mb-4">
              Nossa equipe técnica está à disposição para auxiliá-lo!
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                📱 WhatsApp: <a href="tel:+244931054015" className="text-[#E31E24] hover:underline font-semibold">+244 931 054 015</a>
              </p>
              <p className="text-gray-700">
                📧 Email: <a href="mailto:garantia@kzstore.ao" className="text-[#E31E24] hover:underline font-semibold">garantia@kzstore.ao</a>
              </p>
              <p className="text-gray-700">
                🕐 Horário: Segunda a Sexta, 8h às 18h | Sábado, 8h às 13h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
