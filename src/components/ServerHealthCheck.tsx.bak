import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
// Using backend /api endpoints for health checks
const API_BASE = '/api';

type HealthStatus = {
  endpoint: string;
  name: string;
  status: 'checking' | 'ok' | 'error' | 'warning';
  message?: string;
  details?: any;
};

export function ServerHealthCheck() {
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const endpoints = [
    { name: 'Health Check', endpoint: '/health', critical: true },
    { name: 'Products API', endpoint: '/products', critical: true },
    { name: 'Ads API', endpoint: '/ads', critical: false },
    { name: 'Team API', endpoint: '/team', critical: false },
  ];

  const checkEndpoint = async (endpoint: string, name: string): Promise<HealthStatus> => {
    const fullUrl = `${API_BASE}${endpoint}`;
    
    try {
      console.log(`🔍 Checking ${name}:`, fullUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(fullUrl, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${name} OK:`, data);
        return {
          endpoint,
          name,
          status: 'ok',
          message: `Status: ${response.status}`,
          details: data,
        };
      } else {
        console.error(`❌ ${name} Error:`, data);
        return {
          endpoint,
          name,
          status: 'error',
          message: `HTTP ${response.status}: ${data.error || 'Unknown error'}`,
          details: data,
        };
      }
    } catch (error: any) {
      console.error(`❌ ${name} Failed:`, error);
      
      if (error.name === 'AbortError') {
        return {
          endpoint,
          name,
          status: 'error',
          message: 'Request timeout (>10s)',
        };
      }
      
      return {
        endpoint,
        name,
        status: 'error',
        message: error.message || 'Network error',
      };
    }
  };

  const runHealthChecks = async () => {
    setIsChecking(true);
    
    // Set all to checking
    setHealthChecks(
      endpoints.map(e => ({
        endpoint: e.endpoint,
        name: e.name,
        status: 'checking' as const,
      }))
    );

    // Check each endpoint
    const results: HealthStatus[] = [];
    for (const ep of endpoints) {
      const result = await checkEndpoint(ep.endpoint, ep.name);
      results.push(result);
      setHealthChecks([...results]);
    }

    setIsChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="size-5 animate-spin text-blue-500" />;
      case 'ok':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="size-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
    }
  };

  const criticalErrors = healthChecks.filter(h => h.status === 'error' && endpoints.find(e => e.endpoint === h.endpoint)?.critical);
  const allOk = healthChecks.every(h => h.status === 'ok');

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Server Status</h3>
          <button
            onClick={runHealthChecks}
            disabled={isChecking}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {criticalErrors.length > 0 && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-1">
              ⚠️ Critical errors detected
            </p>
            <p className="text-xs text-red-600">
              The server may not be running or there's a configuration issue.
            </p>
          </div>
        )}

        {allOk && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✅ All systems operational
            </p>
          </div>
        )}

        <div className="space-y-2">
          {healthChecks.map((check, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(check.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{check.name}</p>
                {check.message && (
                  <p className="text-xs text-gray-600 truncate">{check.message}</p>
                )}
                {check.details && check.status === 'ok' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {check.details.version && `v${check.details.version}`}
                    {check.details.products?.length !== undefined && ` • ${check.details.products.length} items`}
                    {check.details.ads?.length !== undefined && ` • ${check.details.ads.length} items`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            API: <code className="text-xs bg-gray-100 px-1 rounded">{API_BASE}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
