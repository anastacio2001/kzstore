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

    // Simulate sending (in production, would call an API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Send via WhatsApp
    const message = `*Nova Mensagem do Site*\\n\\n*Nome:* ${formData.nome}\\n*Email:* ${formData.email}\\n*Telefone:* ${formData.telefone}\\n*Assunto:* ${formData.assunto}\\n\\n*Mensagem:*\\n${formData.mensagem}`;
    const whatsappUrl = `https://wa.me/244931054015?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    setIsSubmitting(false);
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
      link: '#',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      link: '#',
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
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Estamos aqui para ajudar! Fale conosco sobre produtos, pedidos ou qualquer dúvida
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="animate-slide-in-left">
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envie sua Mensagem
              </h2>

              {submitted ? (
                <div className="text-center py-12 animate-scale-in">
                  <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 text-green-600 mb-6">
                    <Send className="size-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-700 mb-6">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                      placeholder="João Silva"
                    />
                  </div>

                  {/* Email & Telefone */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                        placeholder="joao@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
                        placeholder="+244 900 000 000"
                      />
                    </div>
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <select
                      required
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-all resize-none"
                      placeholder="Escreva sua mensagem aqui..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="mr-2 size-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8 animate-slide-in-right">
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-red-200 transition-all hover-lift"
                >
                  <div className="flex items-start gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      info.color === 'green' ? 'bg-green-100 text-green-600' :
                      info.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      info.color === 'red' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <info.icon className="size-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-700">{info.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Siga-nos nas Redes Sociais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 ${social.color} text-white px-4 py-3 rounded-xl font-semibold transition-all hover:shadow-lg`}
                  >
                    <social.icon className="size-5" />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-red-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="size-12 text-red-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">Luanda, Angola</p>
                  <p className="text-sm text-gray-600">Mapa em breve</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Precisa de Ajuda Imediata?
            </h3>
            <p className="text-gray-700 mb-6">
              Nossa equipe está disponível no WhatsApp para atendimento rápido e eficiente
            </p>
            <a
              href="https://wa.me/244931054015"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <MessageCircle className="size-5" />
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}