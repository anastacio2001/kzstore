/**
 * Utility para paginação consistente em toda a API
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Extrai parâmetros de paginação da query string
 */
export function getPaginationParams(query: any): Required<PaginationParams> {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20)); // Max 100 items
  const sort = (query.sort as string) || 'created_at';
  const order = (query.order as 'asc' | 'desc') === 'asc' ? 'asc' : 'desc';

  return { page, limit, sort, order };
}

/**
 * Calcula offset para queries SQL
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Cria objeto de resposta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Valida parâmetros de paginação
 */
export function validatePaginationParams(params: PaginationParams): boolean {
  if (params.page && (params.page < 1 || !Number.isInteger(params.page))) {
    return false;
  }

  if (params.limit && (params.limit < 1 || params.limit > 100 || !Number.isInteger(params.limit))) {
    return false;
  }

  if (params.order && !['asc', 'desc'].includes(params.order)) {
    return false;
  }

  return true;
}

/**
 * Cria objeto Prisma para orderBy baseado em sort/order
 */
export function createOrderBy(sort: string, order: 'asc' | 'desc'): Record<string, 'asc' | 'desc'> {
  return { [sort]: order };
}

/**
 * Middleware Express para validar paginação
 */
export function paginationMiddleware(req: any, res: any, next: any) {
  const params = getPaginationParams(req.query);

  if (!validatePaginationParams(params)) {
    return res.status(400).json({
      error: 'Invalid pagination parameters',
      message: 'page e limit devem ser inteiros positivos, limit máximo é 100'
    });
  }

  // Adiciona parâmetros validados ao request
  req.pagination = params;
  next();
}
