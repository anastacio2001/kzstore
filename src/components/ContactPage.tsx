import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

export function ContactPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Enviar para API
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      setSubmitted(true);
      
      // Reset form
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente ou entre em contato via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone / WhatsApp',
      content: '+244 931 054 015',
      link: 'https://wa.me/244931054015',
      color: 'green'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contato@kzstore.ao',
      link: 'mailto:contato@kzstore.ao',
      color: 'blue'
    },
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'Luanda, Angola',
      color: 'red'
    },
    {
      icon: Clock,
      title: 'Horário de Atendimento',
      content: 'Seg-Sáb: 9h às 18h',
      color: 'yellow'
    }
  ];

  const socialLinks = [
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      link: 'https://wa.me/244931054015',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      link: 'https://www.facebook.com/share/1CtV3N3FtH/?mibextid=wwXIfr',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      link: 'https://www.instagram.com/kzstoregeral?igsh=MXY3Nzhtc2xzejBrNQ%3D%3D&utm_source=qr',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      link: '#',
      color: 'bg-blue-700 hover:bg-blue-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white relative">
        {/* Overlay escuro para melhor contraste */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-6">
            Entre em Contato
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Fale conosco sobre produtos, pedidos ou qualquer dúvida
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form - Mobile Optimized */}
          <div className="animate-slide-in-left">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 sm:border-2 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Envie sua Mensagem
              </h2>

              {submitted ? (
                <div className="text-center py-8 sm:py-12 animate-scale-in">
                  <div className="inline-flex items-center justify-center size-16 sm:size-20 rounded-full bg-green-100 text-green-600 mb-4 sm:mb-6">
                    <Send className="size-8 sm:size-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                    Recebemos sua mensagem e entraremos em contato em breve.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        nome: '',
                        email: '',
                        telefone: '',
                        assunto: '',
                        mensagem: ''
                      });
                    }}
                    variant="outline"
                  >
                    Enviar Nova Mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 focus:border-red-600 focus:outline-none transition-all text-sm sm:text-base"
                      placeholder="João Silva"
                    />
                  </div>

                  {/* Email & Telefone */}
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 focus:border-red-600 focus:outline-none transition-all text-sm sm:text-base"
                        placeholder="joao@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 focus:border-red-600 focus:outline-none transition-all text-sm sm:text-base"
                        placeholder="+244 900 000 000"
                      />
                    </div>
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Assunto *
                    </label>
                    <select
                      required
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 focus:border-red-600 focus:outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="Dúvidas sobre Produtos">Dúvidas sobre Produtos</option>
                      <option value="Acompanhamento de Pedido">Acompanhamento de Pedido</option>
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Parcerias">Parcerias</option>
                      <option value="Reclamações">Reclamações</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-gray-200 sm:border-2 focus:border-red-600 focus:outline-none transition-all resize-none text-sm sm:text-base"
                      placeholder="Escreva sua mensagem aqui..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-base sm:text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="mr-2 size-4 sm:size-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info - Mobile Optimized */}
          <div className="space-y-6 sm:space-y-8 animate-slide-in-right">
            {/* Contact Cards */}
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 sm:border-2 p-4 sm:p-6 hover:border-red-200 transition-all hover-lift"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`size-10 sm:size-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      info.color === 'green' ? 'bg-green-100 text-green-600' :
                      info.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      info.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <info.icon className="size-5 sm:size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base break-all"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm sm:text-base">{info.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media - Compact Mobile */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 sm:border-2 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Siga-nos nas Redes Sociais
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 ${social.color} text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all hover:shadow-lg text-xs sm:text-sm`}
                  >
                    <social.icon className="size-4 sm:size-5" />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Map Placeholder - Compact Mobile */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 sm:border-2 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-red-100 to-blue-100 flex items-center justify-center">
                <div className="text-center px-4">
                  <MapPin className="size-10 sm:size-12 text-red-600 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-700 font-semibold text-sm sm:text-base">Luanda, Angola</p>
                  <p className="text-xs sm:text-sm text-gray-600">Mapa em breve</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Section - Compact Mobile */}
        <div className="mt-8 sm:mt-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-blue-200 sm:border-2">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Precisa de Ajuda Imediata?
            </h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              Nossa equipe está disponível no WhatsApp para atendimento rápido e eficiente
            </p>
            <a
              href="https://wa.me/244931054015"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-sm sm:text-base"
            >
              <MessageCircle className="size-4 sm:size-5" />
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}