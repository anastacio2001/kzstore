import { useState, useEffect } from 'react';
import { Mail, TrendingUp, Target, X as XIcon, Check, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { buildAPIURL } from '../../utils/api';

type PopupStats = {
  total_shown: number;
  total_subscribed: number;
  total_dismissed: number;
  total_closed: number;
  conversion_rate: number;
  avg_time_to_action: number;
};

type PostPerformance = {
  post_id: string;
  post_title: string;
  shown_count: number;
  subscribed_count: number;
  dismissed_count: number;
  closed_count: number;
  conversion_rate: number;
};

type ActionTimeline = {
  date: string;
  shown: number;
  subscribed: number;
  dismissed: number;
  closed: number;
};

export function BlogNewsletterPopupStats() {
  const [stats, setStats] = useState<PopupStats>({
    total_shown: 0,
    total_subscribed: 0,
    total_dismissed: 0,
    total_closed: 0,
    conversion_rate: 0,
    avg_time_to_action: 0
  });
  const [postPerformance, setPostPerformance] = useState<PostPerformance[]>([]);
  const [timeline, setTimeline] = useState<ActionTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopupStats();
  }, []);

  const loadPopupStats = async () => {
    try {
      setLoading(true);

      const [statsRes, performanceRes, timelineRes] = await Promise.all([
        fetch(buildAPIURL('/admin/blog/newsletter-popups/stats'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/newsletter-popups/by-post?limit=10'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/newsletter-popups/timeline?days=30'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        // Converter strings para números
        setStats({
          ...data.stats,
          conversion_rate: Number(data.stats.conversion_rate) || 0,
          avg_time_to_action: Number(data.stats.avg_time_to_action) || 0
        });
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        // Converter strings para números nos posts
        setPostPerformance((data.posts || []).map((post: any) => ({
          ...post,
          conversion_rate: Number(post.conversion_rate) || 0
        })));
      }

      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(data.timeline || []);
      }
    } catch (error) {
      console.error('Error loading popup stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${Math.round(seconds % 60)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Newsletter Popup - Performance</h2>
        <p className="text-gray-600 mt-1">Métricas de conversão e engajamento do popup</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando estatísticas...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Popups Exibidos</CardTitle>
                <Eye className="size-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.total_shown)}</div>
                <p className="text-xs text-gray-500 mt-1">Impressões totais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Inscrições</CardTitle>
                <Check className="size-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatNumber(stats.total_subscribed)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {(stats.conversion_rate || 0).toFixed(1)}% taxa de conversão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Dispensados</CardTitle>
                <XIcon className="size-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{formatNumber(stats.total_dismissed)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_shown > 0 ? ((stats.total_dismissed / stats.total_shown) * 100).toFixed(1) : 0}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Fechados</CardTitle>
                <XIcon className="size-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatNumber(stats.total_closed)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_shown > 0 ? ((stats.total_closed / stats.total_shown) * 100).toFixed(1) : 0}% do total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Funil de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Popups Exibidos</span>
                    <span className="font-bold">{formatNumber(stats.total_shown)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Usuários Engajados (não fecharam imediatamente)</span>
                    <span className="font-bold">
                      {formatNumber(stats.total_subscribed + stats.total_dismissed)} 
                      <span className="text-gray-500 ml-1">
                        ({stats.total_shown > 0 ? (((stats.total_subscribed + stats.total_dismissed) / stats.total_shown) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full" 
                      style={{ width: `${stats.total_shown > 0 ? ((stats.total_subscribed + stats.total_dismissed) / stats.total_shown) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-green-700">✓ Inscrições Confirmadas</span>
                    <span className="font-bold text-green-700">
                      {formatNumber(stats.total_subscribed)}
                      <span className="text-gray-500 ml-1">
                        ({(stats.conversion_rate || 0).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-[#E31E24] h-4 rounded-full" 
                      style={{ width: `${stats.conversion_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {stats.avg_time_to_action > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Tempo médio até ação:</strong> {formatTime(stats.avg_time_to_action)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance by Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Performance por Artigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postPerformance.map((post, index) => (
                  <div key={post.post_id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-3">{post.post_title}</h4>
                        
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-600">Exibidos</div>
                            <div className="text-lg font-bold text-gray-900">{post.shown_count}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Inscritos</div>
                            <div className="text-lg font-bold text-green-600">{post.subscribed_count}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Dispensados</div>
                            <div className="text-lg font-bold text-orange-600">{post.dismissed_count}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Taxa Conversão</div>
                            <div className="text-lg font-bold text-[#E31E24]">{(post.conversion_rate || 0).toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#E31E24] h-2 rounded-full"
                            style={{ width: `${post.conversion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Atividade dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Exibidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Inscritos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Dispensados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Fechados</span>
                    </div>
                  </div>

                  <div className="h-48 flex items-end justify-between gap-1">
                    {timeline.slice(-14).map((day, index) => {
                      const maxValue = Math.max(...timeline.map(d => d.shown));
                      const shownHeight = maxValue > 0 ? (day.shown / maxValue) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full space-y-1">
                            <div 
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: `${shownHeight}%`, minHeight: day.shown > 0 ? '4px' : '0' }}
                              title={`${day.shown} exibidos`}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 rotate-45 origin-left whitespace-nowrap">
                            {new Date(day.date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">📈 Insights e Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-900">
                {stats.conversion_rate >= 5 ? (
                  <li>✓ <strong>Excelente performance!</strong> Taxa de conversão de {(stats.conversion_rate || 0).toFixed(1)}% está acima da média (3-5%)</li>
                ) : stats.conversion_rate >= 3 ? (
                  <li>• Taxa de conversão de {(stats.conversion_rate || 0).toFixed(1)}% está na média. Continue otimizando o timing e copy.</li>
                ) : (
                  <li>⚠️ Taxa de conversão de {(stats.conversion_rate || 0).toFixed(1)}% está abaixo da média. Considere ajustar o delay ou melhorar a proposta de valor.</li>
                )}
                
                {postPerformance[0] && (
                  <li>
                    • O artigo "<strong>{postPerformance[0].post_title}</strong>" tem a melhor taxa de conversão ({(postPerformance[0].conversion_rate || 0).toFixed(1)}%). 
                    Analise o tema e replique o sucesso.
                  </li>
                )}

                {((stats.total_closed / stats.total_shown) * 100) > 40 && (
                  <li>
                    ⚠️ {((stats.total_closed / stats.total_shown) * 100).toFixed(0)}% dos usuários fecham o popup imediatamente. 
                    Considere aumentar o delay ou melhorar o design.
                  </li>
                )}

                <li>
                  • Continue testando diferentes artigos para identificar quais temas geram mais inscrições.
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
