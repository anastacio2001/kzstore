import { useState } from 'react';
import { BlogPost } from '../../types';
import { BlogPostList } from './BlogPostList';
import { BlogPostForm } from './BlogPostForm';
import { BlogCommentsModeration } from './BlogCommentsModeration';
import { BlogAnalyticsDashboard } from './BlogAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, MessageSquare, BarChart3 } from 'lucide-react';

type BlogManagerView = 'list' | 'create' | 'edit';

export function BlogManager() {
  const [view, setView] = useState<BlogManagerView>('list');
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>();

  const handleCreateNew = () => {
    setSelectedPost(undefined);
    setView('create');
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setView('edit');
  };

  const handleBack = () => {
    setSelectedPost(undefined);
    setView('list');
  };

  const handleSave = () => {
    setSelectedPost(undefined);
    setView('list');
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <BlogPostForm post={selectedPost} onBack={handleBack} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comentários
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <BlogPostList onCreateNew={handleCreateNew} onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="comments">
          <BlogCommentsModeration />
        </TabsContent>

        <TabsContent value="analytics">
          <BlogAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
