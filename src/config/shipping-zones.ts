/**
 * Configuração de Zonas de Envio - Angola
 * Migrado de Cloud SQL MySQL para configuração estática
 * Data: 8 de dezembro de 2025
 */

export interface ShippingZone {
  name: string;
  province: string;
  municipalities: string[];
  cost: number; // Em AOA (Kwanzas)
  estimated_days: number;
  is_active: boolean;
}

export const SHIPPING_ZONES: Record<string, ShippingZone> = {
  "Bengo": {
    name: "Bengo",
    province: "Bengo",
    municipalities: [],
    cost: 4000,
    estimated_days: 3,
    is_active: true
  },
  "Benguela": {
    name: "Benguela",
    province: "Benguela",
    municipalities: [],
    cost: 5000,
    estimated_days: 5,
    is_active: true
  },
  "Bié": {
    name: "Bié",
    province: "Bié",
    municipalities: [],
    cost: 6000,
    estimated_days: 7,
    is_active: true
  },
  "Cabinda": {
    name: "Cabinda",
    province: "Cabinda",
    municipalities: [],
    cost: 7000,
    estimated_days: 8,
    is_active: true
  },
  "Cuando Cubango": {
    name: "Cuando Cubango",
    province: "Cuando Cubango",
    municipalities: [],
    cost: 8000,
    estimated_days: 10,
    is_active: true
  },
  "Cuanza Norte": {
    name: "Cuanza Norte",
    province: "Cuanza Norte",
    municipalities: [],
    cost: 4500,
    estimated_days: 4,
    is_active: true
  },
  "Cuanza Sul": {
    name: "Cuanza Sul",
    province: "Cuanza Sul",
    municipalities: [],
    cost: 5000,
    estimated_days: 5,
    is_active: true
  },
  "Cunene": {
    name: "Cunene",
    province: "Cunene",
    municipalities: [],
    cost: 7000,
    estimated_days: 8,
    is_active: true
  },
  "Huambo": {
    name: "Huambo",
    province: "Huambo",
    municipalities: [],
    cost: 5500,
    estimated_days: 6,
    is_active: true
  },
  "Huíla": {
    name: "Huíla",
    province: "Huíla",
    municipalities: [],
    cost: 6000,
    estimated_days: 7,
    is_active: true
  },
  "Luanda": {
    name: "Luanda",
    province: "Luanda",
    municipalities: [],
    cost: 3500, // Mais barato por ser capital
    estimated_days: 2,
    is_active: true
  },
  "Lunda Norte": {
    name: "Lunda Norte",
    province: "Lunda Norte",
    municipalities: [],
    cost: 7500,
    estimated_days: 10,
    is_active: true
  },
  "Lunda Sul": {
    name: "Lunda Sul",
    province: "Lunda Sul",
    municipalities: [],
    cost: 7500,
    estimated_days: 10,
    is_active: true
  },
  "Malanje": {
    name: "Malanje",
    province: "Malanje",
    municipalities: [],
    cost: 5500,
    estimated_days: 6,
    is_active: true
  },
  "Moxico": {
    name: "Moxico",
    province: "Moxico",
    municipalities: [],
    cost: 7000,
    estimated_days: 9,
    is_active: true
  },
  "Namibe": {
    name: "Namibe",
    province: "Namibe",
    municipalities: [],
    cost: 6500,
    estimated_days: 7,
    is_active: true
  },
  "Uíge": {
    name: "Uíge",
    province: "Uíge",
    municipalities: [],
    cost: 5500,
    estimated_days: 6,
    is_active: true
  },
  "Zaire": {
    name: "Zaire",
    province: "Zaire",
    municipalities: [],
    cost: 6000,
    estimated_days: 7,
    is_active: true
  }
};

/**
 * Obtém custo de frete para uma província específica
 */
export function getShippingCost(province: string): number {
  const zone = SHIPPING_ZONES[province];
  return zone?.is_active ? zone.cost : 0;
}

/**
 * Obtém dias estimados de entrega para uma província
 */
export function getEstimatedDays(province: string): number {
  const zone = SHIPPING_ZONES[province];
  return zone?.is_active ? zone.estimated_days : 0;
}

/**
 * Obtém todas as províncias disponíveis para envio
 */
export function getAvailableProvinces(): string[] {
  return Object.keys(SHIPPING_ZONES).filter(
    province => SHIPPING_ZONES[province].is_active
  );
}

/**
 * Verifica se frete é grátis para Luanda (opcional - configurável)
 */
export function isFreeShipping(province: string, orderTotal: number): boolean {
  if (province === "Luanda" && orderTotal >= 50000) {
    return true; // Frete grátis para pedidos acima de 50.000 AOA em Luanda
  }
  return false;
}

/**
 * Calcula custo total de frete considerando regras especiais
 */
export function calculateShipping(province: string, orderTotal: number): {
  cost: number;
  estimatedDays: number;
  isFree: boolean;
} {
  const zone = SHIPPING_ZONES[province];
  
  if (!zone || !zone.is_active) {
    return { cost: 0, estimatedDays: 0, isFree: false };
  }

  const isFree = isFreeShipping(province, orderTotal);
  
  return {
    cost: isFree ? 0 : zone.cost,
    estimatedDays: zone.estimated_days,
    isFree
  };
}
