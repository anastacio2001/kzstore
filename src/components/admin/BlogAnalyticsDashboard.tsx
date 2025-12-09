import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Eye, Users, Share2, MessageSquare, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { buildAPIURL } from '../../utils/api';

type PostAnalytics = {
  id: string;
  title: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
};

type CategoryStats = {
  category: string;
  total_posts: number;
  total_views: number;
  avg_views_per_post: number;
};

type SearchStats = {
  search_query: string;
  search_count: number;
  results_count: number;
};

type OverviewStats = {
  total_posts: number;
  total_views: number;
  total_comments: number;
  total_shares: number;
  avg_views_per_post: number;
};

export function BlogAnalyticsDashboard() {
  const [overview, setOverview] = useState<OverviewStats>({
    total_posts: 0,
    total_views: 0,
    total_comments: 0,
    total_shares: 0,
    avg_views_per_post: 0
  });
  const [topPosts, setTopPosts] = useState<PostAnalytics[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [topSearches, setTopSearches] = useState<SearchStats[]>([]);
  const [searchesNoResults, setSearchesNoResults] = useState<SearchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [overviewRes, topPostsRes, categoriesRes, searchesRes, noResultsRes] = await Promise.all([
        fetch(buildAPIURL('/admin/blog/analytics/overview?range=${timeRange}'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/analytics/top-posts?range=${timeRange}&limit=10'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/analytics/categories'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/analytics/top-searches?limit=10'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(buildAPIURL('/admin/blog/analytics/searches-no-results?limit=10'), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data.stats);
      }

      if (topPostsRes.ok) {
        const data = await topPostsRes.json();
        setTopPosts(data.posts || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategoryStats(data.categories || []);
      }

      if (searchesRes.ok) {
        const data = await searchesRes.json();
        setTopSearches(data.searches || []);
      }

      if (noResultsRes.ok) {
        const data = await noResultsRes.json();
        setSearchesNoResults(data.searches || []);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics do Blog</h2>
          <p className="text-gray-600 mt-1">Métricas e estatísticas detalhadas</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' && 'Últimos 7 dias'}
              {range === '30d' && 'Últimos 30 dias'}
              {range === '90d' && 'Últimos 90 dias'}
              {range === 'all' && 'Todo período'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31E24] mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando analytics...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Visualizações</CardTitle>
                <Eye className="size-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{formatNumber(overview.total_views)}</div>
                <p className="text-sm text-gray-500 mt-1">{overview.total_posts} artigos publicados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Média de Visualizações</CardTitle>
                <Eye className="size-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{formatNumber(overview.avg_views_per_post)}</div>
                <p className="text-sm text-gray-500 mt-1">por artigo publicado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Engajamento Total</CardTitle>
                <TrendingUp className="size-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatNumber(overview.total_comments + overview.total_shares)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatNumber(overview.total_comments)} comentários • {formatNumber(overview.total_shares)} compartilhamentos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="size-5" />
                Top 10 Artigos Mais Lidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="size-4" />
                          {formatNumber(post.views_count)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-4" />
                          {post.comments_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="size-4" />
                          {post.shares_count}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <TrendingUp className="size-4 text-green-600" />
                          <span className="text-green-600 font-medium">{post.likes_count} likes</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories and Searches */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Estatísticas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{cat.category}</div>
                        <div className="text-sm text-gray-600">{cat.total_posts} artigos</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatNumber(cat.total_views)}</div>
                        <div className="text-xs text-gray-500">{formatNumber(cat.avg_views_per_post)} média/artigo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Buscas Mais Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#E31E24] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">"{search.search_query}"</div>
                          <div className="text-xs text-gray-600">{search.results_count} resultados</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">{search.search_count}x</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Searches with No Results */}
          {searchesNoResults.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Users className="size-5" />
                  Buscas Sem Resultado (Oportunidades de Conteúdo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-4">
                  Usuários estão buscando por estes temas. Considere criar artigos sobre:
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchesNoResults.map((search, index) => (
                    <div
                      key={index}
                      className="bg-white border border-orange-300 px-4 py-2 rounded-full text-sm font-medium text-orange-900"
                    >
                      "{search.search_query}" ({search.search_count}x)
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
