import { Product } from '../App';

export const products: Product[] = [
  // Memória RAM
  {
    id: '1',
    nome: 'Memória RAM DDR4 16GB ECC - HP ProLiant',
    descricao: 'Memória RAM DDR4 de 16GB com suporte ECC para servidores HP ProLiant. Ideal para ambientes corporativos que exigem alta confiabilidade.',
    categoria: 'RAM',
    preco_aoa: 45000,
    peso_kg: 0.05,
    estoque: 25,
    imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    especificacoes: {
      'Tipo': 'DDR4',
      'Capacidade': '16GB',
      'ECC': 'Sim',
      'Velocidade': '2666MHz',
      'Compatibilidade': 'HP ProLiant, Dell PowerEdge'
    }
  },
  {
    id: '2',
    nome: 'Memória RAM DDR3 8GB UDIMM',
    descricao: 'Memória RAM DDR3 de 8GB UDIMM para servidores e estações de trabalho. Excelente custo-benefício.',
    categoria: 'RAM',
    preco_aoa: 25000,
    peso_kg: 0.05,
    estoque: 40,
    imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    especificacoes: {
      'Tipo': 'DDR3',
      'Capacidade': '8GB',
      'ECC': 'Não',
      'Velocidade': '1600MHz'
    }
  },
  {
    id: '3',
    nome: 'Memória RAM DDR5 32GB - Dell PowerEdge',
    descricao: 'Memória RAM DDR5 de última geração com 32GB. Alta performance para servidores Dell PowerEdge.',
    categoria: 'RAM',
    preco_aoa: 120000,
    peso_kg: 0.05,
    estoque: 15,
    imagem_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    especificacoes: {
      'Tipo': 'DDR5',
      'Capacidade': '32GB',
      'ECC': 'Sim',
      'Velocidade': '4800MHz',
      'Compatibilidade': 'Dell PowerEdge G15+'
    }
  },
  
  // Hard Disks
  {
    id: '4',
    nome: 'HDD SAS 2TB 7200RPM - Enterprise',
    descricao: 'Hard disk SAS de 2TB com 7200 RPM. Ideal para servidores e storage empresarial.',
    categoria: 'HDD',
    preco_aoa: 85000,
    peso_kg: 0.6,
    estoque: 30,
    imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    especificacoes: {
      'Interface': 'SAS',
      'Capacidade': '2TB',
      'Velocidade': '7200 RPM',
      'Cache': '128MB',
      'Uso': 'Enterprise'
    }
  },
  {
    id: '5',
    nome: 'SSD NVMe 512GB - Alta Performance',
    descricao: 'SSD NVMe M.2 de 512GB com velocidades de leitura de até 3500MB/s. Perfeito para sistemas que exigem rapidez.',
    categoria: 'SSD',
    preco_aoa: 55000,
    peso_kg: 0.02,
    estoque: 50,
    imagem_url: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500',
    especificacoes: {
      'Interface': 'NVMe M.2',
      'Capacidade': '512GB',
      'Leitura': '3500 MB/s',
      'Escrita': '3000 MB/s',
      'Fator de forma': 'M.2 2280'
    }
  },
  {
    id: '6',
    nome: 'SSD SATA 1TB - 2.5"',
    descricao: 'SSD SATA de 1TB no formato 2.5". Upgrade essencial para melhorar a performance do seu servidor.',
    categoria: 'SSD',
    preco_aoa: 75000,
    peso_kg: 0.1,
    estoque: 35,
    imagem_url: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500',
    especificacoes: {
      'Interface': 'SATA III',
      'Capacidade': '1TB',
      'Leitura': '550 MB/s',
      'Escrita': '520 MB/s',
      'Fator de forma': '2.5"'
    }
  },
  
  // Mini PCs
  {
    id: '7',
    nome: 'Mini PC Intel i5 - 8GB RAM 256GB SSD',
    descricao: 'Mini PC compacto com processador Intel Core i5, 8GB RAM e 256GB SSD. Ideal para escritório e uso corporativo.',
    categoria: 'Mini PC',
    preco_aoa: 320000,
    peso_kg: 1.2,
    estoque: 12,
    imagem_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500',
    especificacoes: {
      'Processador': 'Intel Core i5-10210U',
      'RAM': '8GB DDR4',
      'Armazenamento': '256GB SSD',
      'Conectividade': 'Wi-Fi, Bluetooth, HDMI, USB 3.0',
      'Sistema': 'Windows 11 Pro'
    }
  },
  {
    id: '8',
    nome: 'Mini PC AMD Ryzen 5 - 16GB RAM 512GB SSD',
    descricao: 'Mini PC potente com AMD Ryzen 5, 16GB RAM e 512GB SSD. Excelente para multitarefa e produtividade.',
    categoria: 'Mini PC',
    preco_aoa: 450000,
    peso_kg: 1.3,
    estoque: 8,
    imagem_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500',
    especificacoes: {
      'Processador': 'AMD Ryzen 5 5600U',
      'RAM': '16GB DDR4',
      'Armazenamento': '512GB NVMe SSD',
      'Conectividade': 'Wi-Fi 6, Bluetooth 5.0, HDMI, USB-C',
      'Sistema': 'Windows 11 Pro'
    }
  },
  
  // Câmeras Wi-Fi
  {
    id: '9',
    nome: 'Câmera Wi-Fi HD 1080p - Visão Noturna',
    descricao: 'Câmera de segurança Wi-Fi com resolução Full HD, visão noturna e detecção de movimento. Controle via app móvel.',
    categoria: 'Câmera',
    preco_aoa: 35000,
    peso_kg: 0.3,
    estoque: 60,
    imagem_url: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500',
    especificacoes: {
      'Resolução': '1080p Full HD',
      'Conectividade': 'Wi-Fi 2.4GHz',
      'Recursos': 'Visão noturna, Detecção de movimento, Áudio bidirecional',
      'Armazenamento': 'MicroSD até 128GB',
      'App': 'iOS e Android'
    }
  },
  {
    id: '10',
    nome: 'Câmera Wi-Fi 360° - 2K Panorâmica',
    descricao: 'Câmera Wi-Fi com visão panorâmica 360°, resolução 2K e rastreamento automático de movimento.',
    categoria: 'Câmera',
    preco_aoa: 55000,
    peso_kg: 0.4,
    estoque: 40,
    imagem_url: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500',
    especificacoes: {
      'Resolução': '2K (2304x1296)',
      'Visão': '360° panorâmica',
      'Recursos': 'Rastreamento automático, Visão noturna, Zoom digital',
      'Conectividade': 'Wi-Fi 2.4GHz/5GHz',
      'Armazenamento': 'Cloud e MicroSD'
    }
  },
  
  // Ratos sem fio
  {
    id: '11',
    nome: 'Rato Sem Fio Ergonômico - USB',
    descricao: 'Rato sem fio ergonômico com receptor USB. Ideal para uso diário em escritório.',
    categoria: 'Periférico',
    preco_aoa: 12000,
    peso_kg: 0.1,
    estoque: 100,
    imagem_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    especificacoes: {
      'Conectividade': 'Wireless 2.4GHz USB',
      'DPI': '1000/1600',
      'Bateria': 'AAA x2 (até 12 meses)',
      'Compatibilidade': 'Windows, macOS, Linux'
    }
  },
  {
    id: '12',
    nome: 'Rato Gamer RGB - 6400 DPI',
    descricao: 'Rato gamer com iluminação RGB, 6400 DPI ajustável e 7 botões programáveis.',
    categoria: 'Periférico',
    preco_aoa: 28000,
    peso_kg: 0.15,
    estoque: 45,
    imagem_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    especificacoes: {
      'Conectividade': 'Wireless 2.4GHz + Bluetooth',
      'DPI': 'Até 6400 DPI',
      'Botões': '7 programáveis',
      'Iluminação': 'RGB customizável',
      'Bateria': 'Recarregável (até 70h)'
    }
  },
  
  // Telemóveis
  {
    id: '13',
    nome: 'Smartphone Android 5G - 128GB',
    descricao: 'Smartphone Android com conectividade 5G, 6GB RAM, 128GB armazenamento e câmera tripla de 48MP.',
    categoria: 'Telemóvel',
    preco_aoa: 180000,
    peso_kg: 0.2,
    estoque: 20,
    imagem_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    especificacoes: {
      'Tela': '6.5" AMOLED',
      'Processador': 'Octa-core 2.4GHz',
      'RAM': '6GB',
      'Armazenamento': '128GB (expansível)',
      'Câmera': '48MP + 8MP + 2MP',
      'Bateria': '5000mAh',
      '5G': 'Sim'
    }
  },
  {
    id: '14',
    nome: 'Smartphone Premium - 256GB Dual SIM',
    descricao: 'Smartphone premium com 8GB RAM, 256GB armazenamento, câmera de 64MP e carregamento rápido 65W.',
    categoria: 'Telemóvel',
    preco_aoa: 320000,
    peso_kg: 0.19,
    estoque: 15,
    imagem_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    especificacoes: {
      'Tela': '6.7" AMOLED 120Hz',
      'Processador': 'Snapdragon 888',
      'RAM': '8GB',
      'Armazenamento': '256GB',
      'Câmera': '64MP + 12MP + 5MP',
      'Bateria': '4500mAh (Carregamento 65W)',
      '5G': 'Sim',
      'Dual SIM': 'Sim'
    }
  },
  
  // Periféricos
  {
    id: '15',
    nome: 'Teclado Mecânico RGB - Switch Blue',
    descricao: 'Teclado mecânico com iluminação RGB, switches blue e layout QWERTY. Ideal para gaming e digitação.',
    categoria: 'Periférico',
    preco_aoa: 65000,
    peso_kg: 0.8,
    estoque: 30,
    imagem_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
    especificacoes: {
      'Switch': 'Mecânico Blue',
      'Iluminação': 'RGB por tecla',
      'Conectividade': 'USB-C',
      'Layout': 'QWERTY Full Size',
      'Recursos': 'Anti-ghosting, N-Key Rollover'
    }
  },
  {
    id: '16',
    nome: 'Webcam Full HD 1080p - Microfone Integrado',
    descricao: 'Webcam Full HD com microfone stereo integrado. Perfeita para videoconferências e streaming.',
    categoria: 'Periférico',
    preco_aoa: 38000,
    peso_kg: 0.2,
    estoque: 55,
    imagem_url: 'https://images.unsplash.com/photo-1585867643126-6e0bc7c9b709?w=500',
    especificacoes: {
      'Resolução': '1080p Full HD',
      'FPS': '30fps',
      'Microfone': 'Stereo integrado',
      'Conectividade': 'USB 2.0',
      'Compatibilidade': 'Windows, macOS, Linux'
    }
  },
  
  // Acessórios
  {
    id: '17',
    nome: 'Cabo HDMI 2.1 - 2 metros 8K',
    descricao: 'Cabo HDMI 2.1 de alta velocidade, suporta 8K@60Hz e 4K@120Hz. Compatível com PS5 e Xbox Series X.',
    categoria: 'Acessório',
    preco_aoa: 15000,
    peso_kg: 0.15,
    estoque: 80,
    imagem_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    especificacoes: {
      'Versão': 'HDMI 2.1',
      'Resolução': '8K@60Hz, 4K@120Hz',
      'Comprimento': '2 metros',
      'Recursos': 'eARC, HDR, VRR, ALLM'
    }
  },
  {
    id: '18',
    nome: 'Carregador Universal USB-C 65W',
    descricao: 'Carregador USB-C de 65W com Power Delivery. Compatível com laptops, tablets e smartphones.',
    categoria: 'Acessório',
    preco_aoa: 25000,
    peso_kg: 0.2,
    estoque: 70,
    imagem_url: 'https://images.unsplash.com/photo-1591290619762-c588f3272f37?w=500',
    especificacoes: {
      'Potência': '65W',
      'Portas': 'USB-C (1x), USB-A (1x)',
      'Tecnologia': 'Power Delivery 3.0',
      'Proteções': 'Sobrecarga, curto-circuito, superaquecimento',
      'Compatibilidade': 'Universal'
    }
  },

  // REDES E INTERNET
  {
    id: '19',
    nome: 'Cabo de Rede Cat6 UTP - 305 metros',
    descricao: 'Rolo de cabo de rede Cat6 UTP de 305 metros para instalações de rede estruturada. Alta qualidade.',
    categoria: 'Redes e Internet',
    preco_aoa: 95000,
    peso_kg: 12,
    estoque: 15,
    imagem_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
    especificacoes: {
      'Categoria': 'Cat6 UTP',
      'Comprimento': '305 metros',
      'Velocidade': 'Até 1 Gbps',
      'Blindagem': 'Não blindado (UTP)',
      'Uso': 'Interno'
    }
  },
  {
    id: '20',
    nome: 'Switch Gigabit 24 Portas - Gerenciável',
    descricao: 'Switch gerenciável de 24 portas Gigabit Ethernet. Ideal para redes empresariais médias.',
    categoria: 'Redes e Internet',
    preco_aoa: 180000,
    peso_kg: 3.5,
    estoque: 8,
    imagem_url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    especificacoes: {
      'Portas': '24x Gigabit Ethernet',
      'Tipo': 'Gerenciável',
      'Velocidade': '10/100/1000 Mbps',
      'Recursos': 'VLAN, QoS, SNMP',
      'Montagem': 'Rack 19"'
    }
  },
  {
    id: '21',
    nome: 'Access Point Wi-Fi 6 - Dual Band',
    descricao: 'Access Point Wi-Fi 6 (802.11ax) dual band com cobertura de até 150m². PoE integrado.',
    categoria: 'Redes e Internet',
    preco_aoa: 120000,
    peso_kg: 0.8,
    estoque: 20,
    imagem_url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    especificacoes: {
      'Padrão': 'Wi-Fi 6 (802.11ax)',
      'Bandas': 'Dual Band 2.4GHz + 5GHz',
      'Velocidade': 'Até 1800 Mbps',
      'PoE': 'Sim (802.3af)',
      'Cobertura': 'Até 150m²'
    }
  },
  {
    id: '22',
    nome: 'Router Profissional Dual WAN - Gigabit',
    descricao: 'Router profissional com suporte a Dual WAN, 5 portas Gigabit e VPN integrada.',
    categoria: 'Redes e Internet',
    preco_aoa: 145000,
    peso_kg: 1.2,
    estoque: 12,
    imagem_url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    especificacoes: {
      'WAN': 'Dual WAN (balanceamento)',
      'Portas LAN': '5x Gigabit',
      'VPN': 'IPSec, PPTP, L2TP',
      'Firewall': 'SPI, DoS protection',
      'Recursos': 'QoS, VLAN, Load Balance'
    }
  },
  {
    id: '23',
    nome: 'Patch Panel 24 Portas Cat6',
    descricao: 'Patch panel de 24 portas Cat6 para rack 19". Instalação profissional de redes estruturadas.',
    categoria: 'Redes e Internet',
    preco_aoa: 35000,
    peso_kg: 2,
    estoque: 25,
    imagem_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
    especificacoes: {
      'Portas': '24x RJ45',
      'Categoria': 'Cat6',
      'Montagem': 'Rack 19" 1U',
      'Material': 'Aço com pintura eletrostática',
      'Uso': 'Profissional'
    }
  },
  {
    id: '24',
    nome: 'Adaptador USB Wi-Fi Dual Band - AC1200',
    descricao: 'Adaptador USB Wi-Fi dual band AC1200 com antena de alto ganho. Plug and play.',
    categoria: 'Redes e Internet',
    preco_aoa: 18000,
    peso_kg: 0.05,
    estoque: 60,
    imagem_url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
    especificacoes: {
      'Padrão': '802.11ac',
      'Velocidade': '1200 Mbps (867+300)',
      'Bandas': 'Dual Band 2.4GHz + 5GHz',
      'Interface': 'USB 3.0',
      'Compatibilidade': 'Windows, macOS, Linux'
    }
  },

  // ARMAZENAMENTO
  {
    id: '25',
    nome: 'HD Externo 2TB USB 3.0 - Portátil',
    descricao: 'HD externo portátil de 2TB com USB 3.0. Compacto e resistente para backup e armazenamento móvel.',
    categoria: 'Armazenamento',
    preco_aoa: 65000,
    peso_kg: 0.25,
    estoque: 45,
    imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    especificacoes: {
      'Capacidade': '2TB',
      'Interface': 'USB 3.0',
      'Velocidade': 'Até 5 Gbps',
      'Alimentação': 'USB (sem fonte externa)',
      'Compatibilidade': 'Windows, macOS, Linux'
    }
  },
  {
    id: '26',
    nome: 'Pen Drive 128GB USB 3.2 - Alta Velocidade',
    descricao: 'Pen drive de 128GB com USB 3.2 Gen 1. Velocidades de leitura de até 150MB/s.',
    categoria: 'Armazenamento',
    preco_aoa: 22000,
    peso_kg: 0.01,
    estoque: 100,
    imagem_url: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=500',
    especificacoes: {
      'Capacidade': '128GB',
      'Interface': 'USB 3.2 Gen 1',
      'Leitura': 'Até 150 MB/s',
      'Escrita': 'Até 60 MB/s',
      'Formato': 'Compacto retrátil'
    }
  },
  {
    id: '27',
    nome: 'Cartão SD 256GB Classe 10 - UHS-I',
    descricao: 'Cartão de memória SD de 256GB Classe 10 UHS-I. Ideal para câmeras e drones.',
    categoria: 'Armazenamento',
    preco_aoa: 38000,
    peso_kg: 0.002,
    estoque: 70,
    imagem_url: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=500',
    especificacoes: {
      'Capacidade': '256GB',
      'Classe': 'Classe 10',
      'Velocidade': 'UHS-I U3',
      'Leitura': 'Até 100 MB/s',
      'Uso': 'Câmeras, Drones, Gravadores'
    }
  },
  {
    id: '28',
    nome: 'Case para HD/SSD 2.5" - USB 3.0',
    descricao: 'Case externo para HDD ou SSD 2.5" com conexão USB 3.0. Transforme seu disco em HD externo.',
    categoria: 'Armazenamento',
    preco_aoa: 12000,
    peso_kg: 0.1,
    estoque: 55,
    imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    especificacoes: {
      'Compatibilidade': 'HDD/SSD 2.5" SATA',
      'Interface': 'USB 3.0',
      'Instalação': 'Tool-free (sem ferramentas)',
      'Material': 'Alumínio',
      'Espessura': 'Até 9.5mm'
    }
  },
  {
    id: '29',
    nome: 'HD Interno 4TB - 7200 RPM Desktop',
    descricao: 'HD interno de 4TB para desktop com 7200 RPM. Grande capacidade para armazenamento massivo.',
    categoria: 'Armazenamento',
    preco_aoa: 95000,
    peso_kg: 0.65,
    estoque: 30,
    imagem_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    especificacoes: {
      'Capacidade': '4TB',
      'Interface': 'SATA III 6Gb/s',
      'Velocidade': '7200 RPM',
      'Cache': '256MB',
      'Fator de forma': '3.5"'
    }
  },

  // SOFTWARE
  {
    id: '30',
    nome: 'Microsoft Office 2021 Professional Plus',
    descricao: 'Licença Microsoft Office 2021 Professional Plus. Inclui Word, Excel, PowerPoint, Outlook e mais.',
    categoria: 'Software',
    preco_aoa: 145000,
    peso_kg: 0,
    estoque: 50,
    imagem_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    especificacoes: {
      'Versão': 'Office 2021 Professional Plus',
      'Licença': 'Perpétua (1 PC)',
      'Aplicativos': 'Word, Excel, PowerPoint, Outlook, Access, Publisher',
      'Sistema': 'Windows 10/11',
      'Entrega': 'Digital (chave de ativação)'
    }
  },
  {
    id: '31',
    nome: 'Windows 11 Pro - Licença Original',
    descricao: 'Licença original do Windows 11 Professional. Sistema operacional completo para uso corporativo.',
    categoria: 'Software',
    preco_aoa: 120000,
    peso_kg: 0,
    estoque: 60,
    imagem_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    especificacoes: {
      'Versão': 'Windows 11 Professional',
      'Licença': 'Original OEM',
      'Arquitetura': '64-bit',
      'Idioma': 'Português',
      'Entrega': 'Digital (chave de ativação + ISO)'
    }
  },
  {
    id: '32',
    nome: 'Antivírus Kaspersky Total Security - 3 Dispositivos',
    descricao: 'Kaspersky Total Security para 3 dispositivos, 1 ano. Proteção completa contra vírus e malware.',
    categoria: 'Software',
    preco_aoa: 45000,
    peso_kg: 0,
    estoque: 40,
    imagem_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500',
    especificacoes: {
      'Produto': 'Kaspersky Total Security',
      'Dispositivos': '3',
      'Validade': '1 ano',
      'Plataformas': 'Windows, macOS, Android, iOS',
      'Recursos': 'Antivírus, Firewall, Anti-phishing, VPN, Controle Parental',
      'Entrega': 'Digital (código de ativação)'
    }
  },
  {
    id: '33',
    nome: 'Antivírus Norton 360 Premium - 10 Dispositivos',
    descricao: 'Norton 360 Premium para 10 dispositivos com VPN ilimitada e 75GB de backup na nuvem.',
    categoria: 'Software',
    preco_aoa: 65000,
    peso_kg: 0,
    estoque: 35,
    imagem_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500',
    especificacoes: {
      'Produto': 'Norton 360 Premium',
      'Dispositivos': '10',
      'Validade': '1 ano',
      'Backup': '75GB na nuvem',
      'VPN': 'Ilimitada',
      'Recursos': 'Antivírus, Firewall, Dark Web Monitoring, Controle Parental',
      'Entrega': 'Digital (código de ativação)'
    }
  }
];

export const categories = [
  { id: 'all', nome: 'Todos os Produtos', icon: '🛒' },
  { id: 'RAM', nome: 'Memória RAM', icon: '💾' },
  { id: 'HDD', nome: 'Hard Disks', icon: '💿' },
  { id: 'SSD', nome: 'SSDs', icon: '⚡' },
  { id: 'Mini PC', nome: 'Mini PCs', icon: '🖥️' },
  { id: 'Câmera', nome: 'Câmeras Wi-Fi', icon: '📷' },
  { id: 'Periférico', nome: 'Periféricos', icon: '⌨️' },
  { id: 'Telemóvel', nome: 'Telemóveis', icon: '📱' },
  { id: 'Acessório', nome: 'Acessórios', icon: '🔌' },
  // NOVAS CATEGORIAS
  { id: 'Redes e Internet', nome: 'Redes e Internet', icon: '🌐' },
  { id: 'Armazenamento', nome: 'Armazenamento', icon: '💽' },
  { id: 'Software', nome: 'Software', icon: '📀' }
];
