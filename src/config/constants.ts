// KZSTORE - Configurações e Constantes da Aplicação
// ⚠️ IMPORTANTE: Atualize estas informações com os dados reais da empresa

export const COMPANY_INFO = {
  name: 'KZSTORE',
  fullName: 'KwanzaStore - Revenda Técnica de Eletrônicos',
  whatsapp: '+244931054015',
  whatsappFormatted: '244931054015',
  email: 'kstoregeral@gmail.com',
  supportEmail: 'kstoregeral@gmail.com',
  phone: '+244 931 054 015',
  address: 'Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda',
  nif: '', // NIF será adicionado quando disponível
  
  // Horários de atendimento
  businessHours: {
    weekdays: 'Segunda a Sexta: 9h às 18h',
    saturday: 'Sábado: 9h às 13h',
    sunday: 'Domingo: Fechado'
  },

  // Redes sociais
  social: {
    facebook: 'https://facebook.com/kzstore',
    instagram: 'https://instagram.com/kzstore',
    linkedin: 'https://linkedin.com/company/kzstore'
  }
} as const;

export const SHIPPING = {
  luanda: {
    name: 'Luanda',
    cost: 2500,
    deliveryTime: 'até 48h'
  },
  otherProvinces: {
    name: 'Outras Províncias',
    cost: 5000,
    deliveryTime: '3-5 dias úteis'
  }
} as const;

export const PAYMENT_METHODS = {
  multicaixa: {
    id: 'multicaixa',
    name: 'Multicaixa Express',
    icon: '💳',
    description: 'Pagamento instantâneo via Multicaixa'
  },
  bankTransfer: {
    id: 'bank_transfer',
    name: 'Transferência Bancária',
    icon: '🏦',
    description: 'BAI, BFA, Atlântico, etc.'
  },
  bankReference: {
    id: 'reference',
    name: 'Referência Bancária',
    icon: '📄',
    description: 'Gere uma referência para pagamento'
  }
} as const;

export const BANK_ACCOUNTS = {
  bai: {
    name: 'Banco Angolano de Investimentos (BAI)',
    titular: 'Ladislau Segunda Anastácio',
    iban: 'AO06.0040.0000.3514.1269.1010.8',
    account: '0040.0000.3514.1269.1010.8' // Extraído do IBAN
  },
  bfa: {
    name: 'Banco de Fomento Angola (BFA)',
    titular: 'Em configuração',
    account: '', // Adicionar quando disponível
    iban: '' // Adicionar quando disponível
  }
} as const;

// URLs da API
export const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : '';

// Feature Flags
export const FEATURES = {
  chatbotAI: true, // Chatbot com IA Google Gemini
  emailNotifications: true, // Notificações por email
  analytics: true, // Google Analytics
  errorMonitoring: true, // Monitoramento de erros
  backupSystem: true // Sistema de backup automático
} as const;

// Limites e validações
export const LIMITS = {
  maxCartItems: 50,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxProductNameLength: 200,
  maxDescriptionLength: 2000,
  minPasswordLength: 8,
  rateLimit: {
    requests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutos
  }
} as const;