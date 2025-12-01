/**
 * AI Chat Routes - Gemini Integration (REST API Direct)
 * Rotas para integração com Google Gemini AI usando REST API
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Obter a API key do Gemini
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

/**
 * POST /api/ai/chat
 * Endpoint para chat com IA
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

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

    // Preparar contexto do sistema
    const systemPrompt = `Você é um assistente virtual da KZSTORE, uma loja online de eletrônicos em Angola.

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

Responda de forma clara, objetiva e em português de Angola.`;

    // Preparar histórico de conversação
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido! Estou pronto para ajudar os clientes da KZSTORE. Como posso ajudar?' }]
      }
    ];

    // Adicionar histórico se fornecido
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Adicionar mensagem atual
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Fazer requisição direta à API do Gemini (v1 - stable)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('🔄 [AI Chat] Chamando API Gemini...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [AI Chat] Erro da API Gemini:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error('❌ [AI Chat] Resposta vazia da API');
      throw new Error('No response from AI');
    }

    console.log('✅ [AI Chat] Resposta gerada com sucesso');

    res.json({ 
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [AI Chat] Erro:', error);
    
    // Verificar se é erro de quota/API key
    if (error.message?.includes('API key') || error.message?.includes('quota') || error.message?.includes('403')) {
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
    model: 'gemini-2.5-flash',
    configured: isConfigured
  });
});

export default router;
