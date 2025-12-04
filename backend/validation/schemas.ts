import { z } from 'zod';

// ============================================
// PRODUCT VALIDATION SCHEMAS
// ============================================

export const createProductSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').optional(),
  price: z.number().positive('Preço deve ser positivo'),
  price_usd: z.number().positive('Preço USD deve ser positivo').optional(),
  stock: z.number().int().min(0, 'Stock não pode ser negativo'),
  minimum_stock: z.number().int().min(0).optional(),
  category_id: z.string().uuid('ID de categoria inválido').optional(),
  subcategory_id: z.string().uuid('ID de subcategoria inválido').optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  condition: z.enum(['Novo', 'Usado', 'Refurbished']).optional(),
  featured: z.boolean().optional(),
  image_url: z.string().url('URL de imagem inválida').optional().nullable(),
  specifications: z.record(z.any()).optional(),
  shipping_type: z.enum(['free', 'fixed', 'dynamic']).optional(),
  shipping_cost: z.number().min(0).optional(),
  free_shipping_provinces: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============================================
// ORDER VALIDATION SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  user_id: z.string().optional().nullable(),
  user_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  user_email: z.string().email('Email inválido'),
  user_phone: z.string().min(9, 'Telefone inválido'),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive('Quantidade deve ser positiva'),
    price: z.number().positive()
  })).min(1, 'Pedido deve ter pelo menos 1 item'),
  total_amount: z.number().positive('Total deve ser positivo'),
  shipping_cost: z.number().min(0, 'Custo de envio não pode ser negativo'),
  discount_amount: z.number().min(0).optional(),
  coupon_code: z.string().optional().nullable(),
  payment_method: z.enum(['Multicaixa', 'Transferência Bancária', 'Referência']),
  shipping_address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    province: z.string().min(2),
    postal_code: z.string().optional(),
    country: z.string().default('Angola')
  }),
  notes: z.string().max(500).optional().nullable()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
});

export const updatePaymentStatusSchema = z.object({
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded'])
});

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

export const registerUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos 1 número'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(9, 'Telefone inválido').optional()
});

export const loginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// ============================================
// COUPON VALIDATION SCHEMAS
// ============================================

export const createCouponSchema = z.object({
  code: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Código deve conter apenas letras maiúsculas, números, _ ou -'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive('Desconto deve ser positivo'),
  minimum_purchase: z.number().min(0).optional(),
  maximum_uses: z.number().int().positive().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  active: z.boolean().optional()
});

export const updateCouponSchema = createCouponSchema.partial();

// ============================================
// REVIEW VALIDATION SCHEMAS
// ============================================

export const createReviewSchema = z.object({
  product_id: z.string().uuid('ID de produto inválido'),
  user_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  user_email: z.string().email('Email inválido'),
  rating: z.number().int().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(1000),
  verified_purchase: z.boolean().optional()
});

// ============================================
// NEWSLETTER VALIDATION SCHEMAS
// ============================================

export const subscribeNewsletterSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2).optional()
});

// ============================================
// TICKET VALIDATION SCHEMAS
// ============================================

export const createTicketSchema = z.object({
  user_email: z.string().email('Email inválido'),
  user_name: z.string().min(2),
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres').max(200),
  message: z.string().min(20, 'Mensagem deve ter pelo menos 20 caracteres').max(2000),
  category: z.enum(['pedidos', 'produtos', 'pagamento', 'suporte', 'outros']),
  priority: z.enum(['baixa', 'media', 'alta']).optional()
});

// ============================================
// ANALYTICS VALIDATION SCHEMAS
// ============================================

export const analyticsDateRangeSchema = z.object({
  start_date: z.string().datetime('Data inicial inválida'),
  end_date: z.string().datetime('Data final inválida'),
  metric: z.enum(['revenue', 'orders', 'customers', 'conversion', 'clv']).optional()
});

// ============================================
// INVENTORY VALIDATION SCHEMAS
// ============================================

export const stockUpdateSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(3).max(200),
  warehouse_id: z.string().uuid().optional()
});

export const lowStockAlertSchema = z.object({
  product_id: z.string().uuid(),
  threshold: z.number().int().positive(),
  notify_emails: z.array(z.string().email()).min(1)
});

// ============================================
// BULK OPERATIONS VALIDATION
// ============================================

export const bulkProductUpdateSchema = z.object({
  product_ids: z.array(z.string().uuid()).min(1),
  updates: z.object({
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional()
  })
});

// Helper type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
