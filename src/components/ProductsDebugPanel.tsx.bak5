/**
 * Painel de Debug para Produtos
 * Mostra o status de carregamento em tempo real
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DebugInfo {
  apiV2Status: 'loading' | 'success' | 'error' | 'idle';
  supabaseStatus: 'loading' | 'success' | 'error' | 'idle';
  fallbackStatus: 'loading' | 'success' | 'error' | 'idle';
  productsCount: number;
  lastError?: string;
  dataSource?: 'API V2' | 'Supabase Direct' | 'Initial Data' | 'None';
}

export function ProductsDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    apiV2Status: 'idle',
    supabaseStatus: 'idle',
    fallbackStatus: 'idle',
    productsCount: 0,
  });

  const [showPanel, setShowPanel] = useState(true);

  // Interceptar logs do console
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(' ');
      
      if (message.includes('[useProducts]')) {
        if (message.includes('Loaded') && message.includes('API V2')) {
          const count = parseInt(message.match(/\d+/)?.[0] || '0');
          setDebugInfo(prev => ({
            ...prev,
            apiV2Status: 'success',
            productsCount: count,
            dataSource: 'API V2'
          }));
        } else if (message.includes('Loaded') && message.includes('Supabase')) {
          const count = parseInt(message.match(/\d+/)?.[0] || '0');
          setDebugInfo(prev => ({
            ...prev,
            supabaseStatus: 'success',
            productsCount: count,
            dataSource: 'Supabase Direct'
          }));
        } else if (message.includes('Using initial products')) {
          const count = parseInt(message.match(/\d+/)?.[0] || '0');
          setDebugInfo(prev => ({
            ...prev,
            fallbackStatus: 'success',
            productsCount: count,
            dataSource: 'Initial Data'
          }));
        } else if (message.includes('Fetching products')) {
          setDebugInfo(prev => ({
            ...prev,
            apiV2Status: 'loading'
          }));
        }
      }
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.join(' ');
      
      if (message.includes('[useProducts]')) {
        setDebugInfo(prev => ({
          ...prev,
          lastError: message,
          apiV2Status: 'error'
        }));
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.join(' ');
      
      if (message.includes('API V2 failed')) {
        setDebugInfo(prev => ({
          ...prev,
          apiV2Status: 'error',
          supabaseStatus: 'loading'
        }));
      } else if (message.includes('Supabase direct access failed')) {
        setDebugInfo(prev => ({
          ...prev,
          supabaseStatus: 'error',
          fallbackStatus: 'loading'
        }));
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!showPanel) {
    return (
      <Button
        onClick={() => setShowPanel(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Show Debug
      </Button>
    );
  }

  const StatusIcon = ({ status }: { status: 'loading' | 'success' | 'error' | 'idle' }) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="size-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="size-4 text-green-500" />;
      case 'error':
        return <XCircle className="size-4 text-red-500" />;
      default:
        return <AlertCircle className="size-4 text-gray-400" />;
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">🔍 Products Debug Panel</CardTitle>
          <Button
            onClick={() => setShowPanel(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
        <CardDescription className="text-xs">
          Real-time loading status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* API V2 Status */}
        <div className="flex items-center justify-between p-2 rounded bg-gray-50">
          <span className="flex items-center gap-2">
            <StatusIcon status={debugInfo.apiV2Status} />
            API V2 (Edge Function)
          </span>
          <span className="text-xs text-gray-500">
            {debugInfo.apiV2Status}
          </span>
        </div>

        {/* Supabase Status */}
        <div className="flex items-center justify-between p-2 rounded bg-gray-50">
          <span className="flex items-center gap-2">
            <StatusIcon status={debugInfo.supabaseStatus} />
            Supabase Direct
          </span>
          <span className="text-xs text-gray-500">
            {debugInfo.supabaseStatus}
          </span>
        </div>

        {/* Fallback Status */}
        <div className="flex items-center justify-between p-2 rounded bg-gray-50">
          <span className="flex items-center gap-2">
            <StatusIcon status={debugInfo.fallbackStatus} />
            Initial Data Fallback
          </span>
          <span className="text-xs text-gray-500">
            {debugInfo.fallbackStatus}
          </span>
        </div>

        {/* Results */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Products Loaded:</span>
            <span className="font-bold text-lg">{debugInfo.productsCount}</span>
          </div>
          
          {debugInfo.dataSource && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Data Source:</span>
              <span className="font-medium text-green-600">{debugInfo.dataSource}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {debugInfo.lastError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs">Last Error</AlertTitle>
            <AlertDescription className="text-xs">
              {debugInfo.lastError.substring(0, 100)}...
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        {debugInfo.productsCount === 0 && (
          <Alert className="mt-3">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs">No Products Loaded</AlertTitle>
            <AlertDescription className="text-xs">
              Run the SQL script in /FIX_RLS_PRODUTOS.sql
            </AlertDescription>
          </Alert>
        )}

        {debugInfo.productsCount > 0 && (
          <Alert className="mt-3 bg-green-50 border-green-200">
            <CheckCircle className="size-4 text-green-600" />
            <AlertTitle className="text-xs text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-xs text-green-700">
              Products loaded from {debugInfo.dataSource}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
