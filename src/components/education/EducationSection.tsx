import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { BookOpen, Eye, Calendar, Search, Plus, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ContentForm } from './ContentForm';

type EducationalContent = Database['public']['Tables']['educational_content']['Row'];

export function EducationSection() {
  const { profile } = useAuth();
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<EducationalContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContentForm, setShowContentForm] = useState(false);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'health', label: 'Health' },
    { id: 'hygiene', label: 'Hygiene' },
    { id: 'myths', label: 'Myths & Facts' },
    { id: 'products', label: 'Products' },
    { id: 'general', label: 'General' },
  ];

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleViewArticle = async (article: EducationalContent) => {
    setSelectedArticle(article);

    try {
      await supabase
        .from('educational_content')
        .update({ views_count: article.views_count + 1 })
        .eq('id', article.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredContent = content
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 3);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      health: 'bg-blue-100 text-blue-700',
      hygiene: 'bg-green-100 text-green-700',
      myths: 'bg-purple-100 text-purple-700',
      products: 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.general;
  };

  if (selectedArticle) {
    return (
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-6 flex items-center text-rose-600 hover:text-rose-700 font-semibold transition"
          >
            ← Back to Articles
          </button>

          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {selectedArticle.image_url && (
              <div className="relative h-80 overflow-hidden">
                <img
                  src={selectedArticle.image_url}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            )}

            <div className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(selectedArticle.category)}`}>
                  {selectedArticle.category}
                </span>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedArticle.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {selectedArticle.views_count + 1} views
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="prose prose-lg prose-rose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {selectedArticle.content}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-rose-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Was this article helpful?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Share your knowledge with others and help end period poverty through education.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {featuredContent.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Articles</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {featuredContent
                  .filter(item => item.id !== selectedArticle.id)
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedArticle(null);
                        setTimeout(() => handleViewArticle(item), 100);
                      }}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer p-4"
                    >
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mt-3 line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              <BookOpen className="w-10 h-10 mr-3 text-rose-600" />
              Period Health Education
            </h1>
            <p className="text-gray-600 text-lg">Learn about menstrual health, hygiene, and wellness</p>
          </div>
          {profile?.user_type === 'admin' && (
            <button
              onClick={() => setShowContentForm(true)}
              className="flex items-center space-x-2 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Article</span>
            </button>
          )}
        </div>

        {featuredContent.length > 0 && selectedCategory === 'all' && searchQuery === '' && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-rose-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Trending Articles</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredContent.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleViewArticle(item)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden group relative"
                >
                  {index === 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-white" />
                      <span>Most Popular</span>
                    </div>
                  )}
                  {item.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.views_count}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-rose-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.content.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {filteredContent.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? 'No articles found' : 'No content available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back later for educational articles'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredContent.length} article{filteredContent.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewArticle(item)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
                >
                  {item.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-rose-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <div className="flex items-center text-gray-600 text-xs">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.views_count}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-rose-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {item.content.substring(0, 150)}...
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <span className="text-rose-600 text-sm font-semibold group-hover:underline">
                        Read More →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showContentForm && (
          <ContentForm
            onClose={() => setShowContentForm(false)}
            onSuccess={loadContent}
          />
        )}
      </div>
    </div>
  );
}
