/**
 * AI Chat Routes - Gemini Integration
 * Rotas para integração com Google Gemini AI
 */

import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Obter a API key do Gemini
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * POST /api/ai/chat
 * Endpoint para chat com IA
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    console.log('🤖 [AI Chat] Recebida mensagem:', message);

    // Verificar se a API key está configurada
    if (!GEMINI_API_KEY) {
      console.error('❌ [AI Chat] GEMINI_API_KEY não configurada');
      return res.status(500).json({ 
        error: 'Assistente IA não configurado. Entre em contato com o suporte.' 
      });
    }

    // Obter modelo Gemini (versão compatível com v1beta)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Contexto do sistema
    const systemContext = `Você é um assistente virtual da KZSTORE, uma loja online de eletrônicos em Angola.
Suas responsabilidades:
- Ajudar clientes com dúvidas sobre produtos
- Fornecer informações sobre pré-vendas e promoções
- Auxiliar no processo de compra
- Responder perguntas sobre entrega e pagamento
- Ser sempre educado e prestativo

Informações da loja:
- Localização: Sector D, Quarteirão 7, Av. 21 de Janeiro, Luanda Sul, Angola
- WhatsApp: +244931054015
- Email: info@kzstore.ao
- Oferecemos: Eletrônicos, acessórios, pré-vendas com 30% de sinal
- Formas de pagamento: Transferência bancária, Multicaixa, pagamento na entrega

${context ? `\n\nContexto adicional:\n${context}` : ''}

Responda de forma clara, objetiva e em português de Angola.`;

    // Gerar resposta
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido! Estou pronto para ajudar os clientes da KZSTORE. Como posso ajudar?' }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    console.log('✅ [AI Chat] Resposta gerada com sucesso');

    res.json({ 
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [AI Chat] Erro:', error);
    
    // Verificar se é erro de quota/API key
    if (error.message?.includes('API key') || error.message?.includes('quota')) {
      return res.status(503).json({ 
        error: 'Serviço temporariamente indisponível. Por favor, tente novamente mais tarde ou entre em contato via WhatsApp.' 
      });
    }

    res.status(500).json({ 
      error: 'Erro ao processar sua mensagem. Por favor, tente novamente.' 
    });
  }
});

/**
 * GET /api/ai/status
 * Verificar status da IA
 */
router.get('/status', (req: Request, res: Response) => {
  const isConfigured = !!GEMINI_API_KEY;
  
  res.json({
    status: isConfigured ? 'online' : 'offline',
    model: 'gemini-pro',
    configured: isConfigured
  });
});

export default router;
