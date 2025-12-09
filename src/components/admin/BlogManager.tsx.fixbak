import { useState } from 'react';
import { BlogPost } from '../../types';
import { BlogPostList } from './BlogPostList';
import { BlogPostForm } from './BlogPostForm';

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

  return (
    <div className="p-6">
      {view === 'list' && (
        <BlogPostList onCreateNew={handleCreateNew} onEdit={handleEdit} />
      )}
      {(view === 'create' || view === 'edit') && (
        <BlogPostForm post={selectedPost} onBack={handleBack} onSave={handleSave} />
      )}
    </div>
  );
}
