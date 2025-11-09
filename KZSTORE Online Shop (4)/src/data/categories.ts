export type Category = {
  id: string;
  nome: string;
  icon: string;
  subcategorias?: string[];
};

export const categories: Category[] = [
  // Categorias Principais Existentes
  {
    id: 'ram',
    nome: 'Memória RAM',
    icon: '💾',
    subcategorias: ['DDR3', 'DDR4', 'DDR5', 'ECC', 'Non-ECC']
  },
  {
    id: 'hdd',
    nome: 'Hard Disks',
    icon: '💿',
    subcategorias: ['SAS', 'SATA', 'Enterprise', 'Desktop']
  },
  {
    id: 'ssd',
    nome: 'SSD',
    icon: '⚡',
    subcategorias: ['NVMe', 'SATA', 'M.2', 'Enterprise']
  },
  {
    id: 'mini-pc',
    nome: 'Mini PCs',
    icon: '🖥️',
    subcategorias: ['Intel', 'AMD', 'Fanless', 'Industrial']
  },
  {
    id: 'cameras',
    nome: 'Câmeras Wi-Fi',
    icon: '📹',
    subcategorias: ['Indoor', 'Outdoor', 'PTZ', '4K']
  },
  {
    id: 'smartphones',
    nome: 'Telemóveis',
    icon: '📱',
    subcategorias: ['Android', 'iOS', 'Budget', 'Flagship']
  },

  // NOVAS CATEGORIAS - Redes e Internet
  {
    id: 'redes',
    nome: 'Redes e Internet',
    icon: '🌐',
    subcategorias: [
      'Cabos de Rede',
      'Telefones IP',
      'Patch Panel e Passa-Cabos',
      'Adaptadores Wi-Fi',
      'Placas de Rede',
      'Repetidores de Sinal',
      'Access Points',
      'Router e Modem',
      'Armários',
      'Adaptadores de Rede/Poe',
      'Antenas',
      'Ferramentas e Acessórios de Rede',
      'Hub e Switch'
    ]
  },

  // NOVAS CATEGORIAS - Armazenamento
  {
    id: 'armazenamento',
    nome: 'Armazenamento',
    icon: '💽',
    subcategorias: [
      'Discos Externos',
      'Discos Internos',
      'Pen Drive/USB',
      'Cartões de Memória',
      'Caixa de Discos'
    ]
  },

  // NOVAS CATEGORIAS - Software
  {
    id: 'software',
    nome: 'Software',
    icon: '💿',
    subcategorias: [
      'Microsoft - Office / Windows',
      'Antivírus'
    ]
  }
];

export const categoryMap: Record<string, string> = {
  'ram': 'Memória RAM',
  'hdd': 'Hard Disks',
  'ssd': 'SSD',
  'mini-pc': 'Mini PCs',
  'cameras': 'Câmeras Wi-Fi',
  'smartphones': 'Telemóveis',
  'redes': 'Redes e Internet',
  'armazenamento': 'Armazenamento',
  'software': 'Software'
};
