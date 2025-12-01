/**
 * Teste de Conexão com Google Gemini AI
 * Execute: node test-gemini.js
 */

const GEMINI_API_KEY = 'AIzaSyCVoEhEyOUbpBlYczM6NcGOU-Fc5hZd1PE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

async function testGemini() {
  console.log('🧪 Testando conexão com Google Gemini AI...\n');

  if (!GEMINI_API_KEY) {
    console.error('❌ API Key não configurada!');
    return;
  }

  console.log('✅ API Key encontrada:', GEMINI_API_KEY.substring(0, 20) + '...');
  console.log('🔗 URL:', GEMINI_API_URL);
  console.log('\n📤 Enviando mensagem de teste...\n');

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Olá! Responda apenas "Conexão bem-sucedida com Gemini AI!"' }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      })
    });

    console.log('📥 Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ ERRO na API do Gemini:');
      console.error(errorText);

      if (response.status === 400) {
        console.error('\n⚠️ Possíveis causas:');
        console.error('1. API Key inválida');
        console.error('2. Região não suportada (alguns países têm restrições)');
        console.error('3. Projeto Google Cloud desabilitado');
      }

      return;
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiResponse) {
      console.log('\n✅ SUCESSO! Resposta do Gemini AI:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(aiResponse);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎉 Chatbot IA está configurado corretamente!');
      console.log('\n📝 Próximos passos:');
      console.log('1. Reinicie o frontend: npm run dev');
      console.log('2. Acesse http://localhost:3000');
      console.log('3. Clique no botão do chatbot (canto inferior direito)');
      console.log('4. Teste enviando: "Quero uma memória RAM"');
    } else {
      console.error('\n❌ Resposta vazia do Gemini AI');
      console.log('Resposta completa:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERRO ao conectar com Gemini AI:');
    console.error(error.message);

    if (error.message.includes('fetch')) {
      console.error('\n⚠️ Problema de conexão de rede');
      console.error('Verifique sua conexão com a internet');
    }
  }
}

// Executar teste
testGemini();
