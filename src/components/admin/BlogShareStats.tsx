import { useState, useEffect } from 'react';
import { Share2, TrendingUp, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { buildAPIURL } from '../../utils/api';

type SharesByPlatform = {
  platform: string;
  count: number;
  percentage: number;
};

type TopSharedPost = {
  id: string;
  title: string;
  shares_count: number;
  whatsapp_shares: number;
  facebook_shares: number;
  twitter_shares: number;
  linkedin_shares: number;
  email_shares: number;
};

type SharesTimeline = {
  date: string;
  count: number;
};

export function BlogShareStats() {
  const [platformStats, setPlatformStats] = useState<SharesByPlatform[]>([]);
  const [topPosts, setTopPosts] = useState<TopSharedPost[]>([]);
  const [timeline, setTimeline] = useState<SharesTimeline[]>([]);
  const [totalShares, setTotalShares] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShareStats();
  }, []);

  const loadShareStats = async () => {
    try {
      setLoading(true);

      const [platformsRes, topPostsRes, timelineRes] = await Promise.all([
        fetch(buildAPIURL('/admin/blog/shares/platforms'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/shares/top-posts?limit=10'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/shares/timeline?days=30'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (platformsRes.ok) {
        const data = await platformsRes.json();
        setPlatformStats(data.platforms || []);
        setTotalShares(data.total || 0);
      }

      if (topPostsRes.ok) {
        const data = await topPostsRes.json();
        setTopPosts(data.posts || []);
      }

      if (timelineRes.ok) {
        const data = await timelineRes.json();
        setTimeline(data.timeline || []);
      }
    } catch (error) {
      console.error('Error loading share stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return <MessageCircle className="size-6" />;
      case 'facebook':
        return <Facebook className="size-6" />;
      case 'twitter':
        return <Twitter className="size-6" />;
      case 'linkedin':
        return <Linkedin className="size-6" />;
      case 'email':
        return <Mail className="size-6" />;
      case 'copy':
        return <LinkIcon className="size-6" />;
      default:
        return <Share2 className="size-6" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'facebook':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'twitter':
        return 'bg-sky-100 text-sky-700 border-sky-300';
      case 'linkedin':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'email':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'copy':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const maxCount = Math.max(...platformStats.map(p => p.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Estatísticas de Compartilhamento</h2>
        <p className="text-gray-600 mt-1">Análise detalhada de compartilhamentos sociais</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando estatísticas...</p>
        </div>
      ) : (
        <>
          {/* Total Shares */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">{formatNumber(totalShares)}</div>
                <div className="text-lg text-gray-600">Compartilhamentos Totais</div>
                <div className="text-sm text-gray-500 mt-1">Últimos 30 dias</div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="size-5" />
                Compartilhamentos por Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformStats.map((platform) => (
                  <div key={platform.platform}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getPlatformColor(platform.platform)}`}>
                          {getPlatformIcon(platform.platform)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">{platform.platform}</div>
                          <div className="text-sm text-gray-600">{platform.percentage.toFixed(1)}% do total</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(platform.count)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#E31E24] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(platform.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Shared Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Artigos Mais Compartilhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-3">{post.title}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-green-700">
                            <MessageCircle className="size-4" />
                            {post.whatsapp_shares}
                          </div>
                          <div className="flex items-center gap-1 text-blue-700">
                            <Facebook className="size-4" />
                            {post.facebook_shares}
                          </div>
                          <div className="flex items-center gap-1 text-sky-700">
                            <Twitter className="size-4" />
                            {post.twitter_shares}
                          </div>
                          <div className="flex items-center gap-1 text-blue-800">
                            <Linkedin className="size-4" />
                            {post.linkedin_shares}
                          </div>
                          <div className="flex items-center gap-1 text-purple-700">
                            <Mail className="size-4" />
                            {post.email_shares}
                          </div>
                          <div className="ml-auto text-lg font-bold text-gray-900">
                            {formatNumber(post.shares_count)} total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Chart */}
          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Compartilhamentos (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-1">
                  {timeline.map((day, index) => {
                    const maxValue = Math.max(...timeline.map(d => d.count));
                    const height = maxValue > 0 ? (day.count / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-[#E31E24] rounded-t-lg transition-all duration-300 group-hover:bg-[#C01920]"
                            style={{ height: `${height}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                          ></div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.count} shares
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 rotate-45 origin-left whitespace-nowrap">
                          {new Date(day.date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-900">
                {platformStats[0] && (
                  <li>
                    • <strong>{platformStats[0].platform}</strong> é a plataforma mais popular ({platformStats[0].percentage.toFixed(1)}% dos compartilhamentos)
                  </li>
                )}
                {topPosts[0] && (
                  <li>
                    • O artigo "<strong>{topPosts[0].title}</strong>" tem o melhor desempenho com {topPosts[0].shares_count} compartilhamentos
                  </li>
                )}
                <li>
                  • Média de {(totalShares / Math.max(topPosts.length, 1)).toFixed(0)} compartilhamentos por artigo popular
                </li>
                <li>
                  • Continue criando conteúdo compartilhável focando em temas que geraram mais engajamento
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
