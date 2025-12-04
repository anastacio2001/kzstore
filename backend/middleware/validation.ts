import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware de validação usando Zod
 * Valida o body da requisição contra um schema Zod
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida o body da requisição
      const validatedData = await schema.parseAsync(req.body);

      // Substitui o body original com os dados validados e transformados
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata erros de validação de forma amigável
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Dados inválidos fornecidos',
          details: formattedErrors
        });
      }

      // Erro desconhecido
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao validar dados'
      });
    }
  };
};

/**
 * Valida query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Parâmetros de consulta inválidos',
          details: formattedErrors
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao validar parâmetros'
      });
    }
  };
};

/**
 * Valida params (URL parameters)
 */
export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Parâmetros de URL inválidos',
          details: formattedErrors
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao validar parâmetros'
      });
    }
  };
};
