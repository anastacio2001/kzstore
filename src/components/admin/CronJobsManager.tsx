/**
 * 🤖 CRON JOBS MANAGER
 * Painel de gestão e monitoramento dos Cron Jobs automáticos
 * Permite visualizar status, executar manualmente e ver histórico
 */

import { useState, useEffect } from 'react';
import { Clock, Play, RefreshCw, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';

type CronJob = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status?: 'success' | 'error' | 'running' | 'idle';
};

const CRON_JOBS: CronJob[] = [
  {
    id: 'low-stock-alerts',
    name: 'Alertas de Estoque Baixo',
    description: 'Verifica produtos com estoque baixo e envia alertas por email',
    endpoint: '/api/cron/low-stock-alerts',
    schedule: 'A cada 30 minutos',
    enabled: true
  },
  {
    id: 'abandoned-carts',
    name: 'Carrinhos Abandonados',
    description: 'Processa carrinhos abandonados e envia emails de recuperação',
    endpoint: '/api/cron/abandoned-carts',
    schedule: 'A cada hora',
    enabled: true
  },
  {
    id: 'daily-metrics',
    name: 'Métricas Diárias',
    description: 'Calcula e armazena métricas diárias de vendas e produtos',
    endpoint: '/api/cron/daily-metrics',
    schedule: 'Diário às 23:59 (Africa/Luanda)',
    enabled: true
  },
  {
    id: 'cleanup-carts',
    name: 'Limpeza de Carrinhos',
    description: 'Remove carrinhos abandonados antigos do banco de dados',
    endpoint: '/api/cron/cleanup-carts',
    schedule: 'Diário às 02:00 (Africa/Luanda)',
    enabled: true
  },
  {
    id: 'update-featured',
    name: 'Atualizar Destaques',
    description: 'Atualiza produtos em destaque baseado em vendas recentes',
    endpoint: '/api/cron/update-featured',
    schedule: 'Semanal - Domingo 00:00',
    enabled: true
  },
  {
    id: 'weekly-report',
    name: 'Relatório Semanal',
    description: 'Envia relatório semanal de vendas e produtos por email',
    endpoint: '/api/cron/weekly-report',
    schedule: 'Semanal - Segunda 09:00',
    enabled: true
  }
];

export function CronJobsManager() {
  const [jobs, setJobs] = useState<CronJob[]>(CRON_JOBS);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const runJob = async (job: CronJob) => {
    setRunningJobs(prev => new Set(prev).add(job.id));

    try {
      const response = await fetch(job.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${job.name} executado com sucesso!`);

        // Update job status
        setJobs(prev => prev.map(j =>
          j.id === job.id
            ? { ...j, status: 'success', lastRun: new Date().toISOString() }
            : j
        ));
      } else {
        throw new Error(data.error || 'Erro ao executar job');
      }
    } catch (error: any) {
      console.error(`Error running ${job.name}:`, error);
      toast.error(`Erro ao executar ${job.name}: ${error.message}`);

      // Update job status to error
      setJobs(prev => prev.map(j =>
        j.id === job.id
          ? { ...j, status: 'error', lastRun: new Date().toISOString() }
          : j
      ));
    } finally {
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }
  };

  const runAllJobs = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/cron/run-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Todos os cron jobs foram executados!');

        // Update all job statuses based on response
        if (data.data && Array.isArray(data.data)) {
          setJobs(prev => prev.map((job, index) => ({
            ...job,
            status: data.data[index]?.status === 'fulfilled' ? 'success' : 'error',
            lastRun: new Date().toISOString()
          })));
        }
      } else {
        throw new Error(data.error || 'Erro ao executar jobs');
      }
    } catch (error: any) {
      console.error('Error running all jobs:', error);
      toast.error(`Erro ao executar todos os jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Se foi há menos de 1 minuto
    if (diff < 60000) {
      return 'Agora mesmo';
    }

    // Se foi há menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }

    // Se foi há menos de 24 horas
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    }

    // Formato completo
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cron Jobs Automáticos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie e monitore as tarefas automáticas do sistema
          </p>
        </div>

        <Button
          onClick={runAllJobs}
          disabled={loading || runningJobs.size > 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Executar Todos
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Sobre os Cron Jobs</h3>
            <p className="text-sm text-blue-700 mt-1">
              Os cron jobs são executados automaticamente pelo Google Cloud Scheduler.
              Você pode executá-los manualmente aqui para testes ou para forçar uma execução imediata.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Localização: europe-west1 (Belgium) | Timezone: Africa/Luanda
            </p>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const isRunning = runningJobs.has(job.id);
          const currentStatus = isRunning ? 'running' : job.status;

          return (
            <Card key={job.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(currentStatus)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.name}</h3>
                    <p className="text-xs text-gray-500">{job.id}</p>
                  </div>
                </div>

                {job.enabled && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Ativo
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{job.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{job.schedule}</span>
                </div>

                {job.lastRun && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Última execução:</span>
                    <span className={`font-medium ${getStatusBadge(currentStatus)}`}>
                      {formatDate(job.lastRun)}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => runJob(job)}
                disabled={isRunning}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Executar Agora
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Comandos Úteis (Terminal)</h3>
        <div className="space-y-1 text-xs text-gray-600 font-mono">
          <p># Listar todos os jobs:</p>
          <p className="text-gray-800">gcloud scheduler jobs list --location=europe-west1</p>

          <p className="mt-3"># Executar job manualmente:</p>
          <p className="text-gray-800">gcloud scheduler jobs run low-stock-alerts --location=europe-west1</p>

          <p className="mt-3"># Ver logs:</p>
          <p className="text-gray-800">gcloud run services logs read kzstore --region=europe-southwest1 --limit=20 | grep "[CRON]"</p>
        </div>
      </Card>
    </div>
  );
}
