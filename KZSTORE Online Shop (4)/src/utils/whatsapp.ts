import { COMPANY_INFO } from '../config/constants';

// Funções utilitárias para WhatsApp

export function formatWhatsAppNumber(number: string): string {
  // Remove todos os caracteres não numéricos
  return number.replace(/\D/g, '');
}

export function getWhatsAppLink(message?: string): string {
  const number = formatWhatsAppNumber(COMPANY_INFO.whatsappFormatted);
  const baseUrl = `https://wa.me/${number}`;
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
}

export function openWhatsApp(message?: string): void {
  const url = getWhatsAppLink(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getWhatsAppOrderMessage(orderNumber: string, items: any[], total: number, customer: any): string {
  let message = `*Novo Pedido - KZSTORE*\n\n`;
  message += `*Pedido:* ${orderNumber}\n\n`;
  message += `*Cliente:*\n`;
  message += `Nome: ${customer.nome}\n`;
  message += `Email: ${customer.email}\n`;
  message += `Telefone: ${customer.telefone}\n`;
  message += `Endereço: ${customer.endereco}, ${customer.cidade}\n\n`;
  message += `*Itens:*\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product_nome} - ${item.quantity}x ${item.preco_aoa.toLocaleString('pt-AO')} Kz\n`;
  });
  
  message += `\n*Total:* ${total.toLocaleString('pt-AO')} Kz\n\n`;
  
  if (customer.observacoes) {
    message += `*Observações:* ${customer.observacoes}\n\n`;
  }
  
  message += `Aguardo confirmação para processar o pedido. Obrigado!`;
  
  return message;
}
