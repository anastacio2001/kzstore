/**
 * Teste de conexão com API
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d8a4dffd`;

export async function testAPIConnection() {
  console.log('🔍 Testing API connection...');
  console.log('📍 API URL:', API_BASE_URL);
  console.log('🔑 Project ID:', projectId);
  console.log('🔐 Has Anon Key:', !!publicAnonKey);

  try {
    // Teste 1: Health check
    console.log('\n📡 Test 1: Health Check');
    const healthUrl = `${API_BASE_URL}/health`;
    console.log('   URL:', healthUrl);
    
    const healthResponse = await fetch(healthUrl, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    console.log('   Status:', healthResponse.status, healthResponse.statusText);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check OK:', healthData);
    } else {
      const errorText = await healthResponse.text();
      console.log('   ❌ Health check failed:', errorText);
    }

    // Teste 2: Products endpoint
    console.log('\n📡 Test 2: Products Endpoint');
    const productsUrl = `${API_BASE_URL}/products`;
    console.log('   URL:', productsUrl);
    
    const productsResponse = await fetch(productsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    console.log('   Status:', productsResponse.status, productsResponse.statusText);
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('   ✅ Products loaded:', productsData.products?.length || 0);
    } else {
      const errorText = await productsResponse.text();
      console.log('   ❌ Products failed:', errorText);
    }

    // Teste 3: Verificar se é problema de CORS
    console.log('\n📡 Test 3: CORS Check');
    console.log('   Origin:', window.location.origin);

  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

// Executar teste automaticamente
if (typeof window !== 'undefined') {
  console.log('🚀 Auto-running API test...');
  testAPIConnection();
}
