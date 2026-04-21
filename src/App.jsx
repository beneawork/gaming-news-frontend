import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://poouvfpebbjseyuupvjg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb3V2ZnBlYmJqc2V5dXVwdmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTIxNzAsImV4cCI6MjA5MjM2ODE3MH0.exob1IPKmYHQPMtA_La5PcQljqFC8fHsl3cVTfteBnY'
);

const categoryColors = {
  layoff: '#EF4444',
  acquisition: '#F97316',
  business: '#FBBF24',
  release: '#22C55E',
  trend: '#3B82F6',
  leadership: '#A855F7',
};

const categoryEmojis = {
  layoff: '🔴',
  acquisition: '🟠',
  business: '🟡',
  release: '🟢',
  trend: '🔵',
  leadership: '🟣',
};

const sentimentColors = {
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444',
};

export default function App() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [minImpactScore, setMinImpactScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch articles from Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('include_in_feed', true)
          .order('published_at', { ascending: false });

        if (error) throw error;

        setArticles(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please refresh the page.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.include_in_feed) {
          setArticles((prev) => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = articles;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Company filter
    if (selectedCompany) {
      filtered = filtered.filter((a) =>
        a.companies && a.companies.includes(selectedCompany)
      );
    }

    // Sentiment filter
    if (selectedSentiment) {
      filtered = filtered.filter((a) => a.sentiment === selectedSentiment);
    }

    // Date range filter
    const now = new Date();
    if (dateRange !== 'all') {
      const cutoffDate = new Date();
      if (dateRange === '24h') cutoffDate.setDate(now.getDate() - 1);
      else if (dateRange === '7d') cutoffDate.setDate(now.getDate() - 7);
      else if (dateRange === '30d') cutoffDate.setDate(now.getDate() - 30);

      filtered = filtered.filter(
        (a) => new Date(a.published_at) >= cutoffDate
      );
    }

    // Impact score filter
    filtered = filtered.filter((a) => (a.impact_score || 0) >= minImpactScore);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          (a.companies && a.companies.some((c) => c.toLowerCase().includes(query)))
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, selectedCompany, selectedSentiment, dateRange, minImpactScore, searchQuery]);

  const uniqueCompanies = Array.from(
    new Set(articles.flatMap((a) => a.companies || []))
  ).sort();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1E293B',
        borderBottom: '1px solid #334155',
        padding: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>🎮</span>
            <h1 style={{ margin: 0, color: '#F1F5F9', fontSize: '28px', fontWeight: 'bold' }}>
              GAME PULSE
            </h1>
          </div>
          <p style={{ color: '#CBD5E1', margin: '0 0 16px 0', fontSize: '14px' }}>
            Real-time gaming industry news • AI-powered insights
          </p>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search articles, companies, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#0F172A',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#F1F5F9',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
          {/* Sidebar Filters */}
          <aside style={{
            backgroundColor: '#1E293B',
            borderRadius: '8px',
            padding: '20px',
            height: 'fit-content',
            position: 'sticky',
            top: '100px',
          }}>
            <h3 style={{ color: '#F1F5F9', marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
              Filters
            </h3>

            {/* Category Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                CATEGORY
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.keys(categoryColors).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    style={{
                      backgroundColor: selectedCategory === cat ? categoryColors[cat] : '#0F172A',
                      color: selectedCategory === cat ? '#000' : '#CBD5E1',
                      border: `1px solid ${categoryColors[cat]}`,
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selectedCategory === cat ? '600' : 'normal',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                    }}
                  >
                    {categoryEmojis[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                COMPANY
              </label>
              <select
                value={selectedCompany || ''}
                onChange={(e) => setSelectedCompany(e.target.value || null)}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  color: '#F1F5F9',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            {/* Sentiment Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                SENTIMENT
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['positive', 'neutral', 'negative'].map((sent) => (
                  <button
                    key={sent}
                    onClick={() => setSelectedSentiment(selectedSentiment === sent ? null : sent)}
                    style={{
                      backgroundColor: selectedSentiment === sent ? sentimentColors[sent] : '#0F172A',
                      color: selectedSentiment === sent ? '#fff' : '#CBD5E1',
                      border: `1px solid ${sentimentColors[sent]}`,
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selectedSentiment === sent ? '600' : 'normal',
                      textTransform: 'capitalize',
                    }}
                  >
                    {sent}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                DATE RANGE
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0F172A',
                  color: '#F1F5F9',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Impact Score Filter */}
            <div>
              <label style={{ color: '#CBD5E1', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                MIN IMPACT SCORE: {minImpactScore}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={minImpactScore}
                onChange={(e) => setMinImpactScore(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </aside>

          {/* Articles Feed */}
          <main>
            {loading && (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
                <p>Loading articles...</p>
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#7F1D1D',
                color: '#FCA5A5',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}>
                {error}
              </div>
            )}

            {!loading && filteredArticles.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
                <p>No articles match your filters.</p>
              </div>
            )}

            {filteredArticles.map((article) => (
              <article
                key={article.id}
                style={{
                  backgroundColor: '#1E293B',
                  borderLeft: `4px solid ${categoryColors[article.category] || '#3B82F6'}`,
                  borderRadius: '6px',
                  padding: '20px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Title & Source */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '12px' }}>
                  <h2 style={{ margin: 0, color: '#F1F5F9', fontSize: '16px', fontWeight: 'bold', flex: 1 }}>
                    
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#F1F5F9', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.target.style.color = '#3B82F6')}
                      onMouseLeave={(e) => (e.target.style.color = '#F1F5F9')}
                    >
                      {article.title}
                    </a>
                  </h2>
                  <span style={{ color: '#94A3B8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatDate(article.published_at)}
                  </span>
                </div>

                {/* Summary */}
                <p style={{ color: '#CBD5E1', margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.5' }}>
                  {article.summary || article.summary}
                </p>

                {/* Metadata */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {/* Category Badge */}
                  <span
                    style={{
                      backgroundColor: categoryColors[article.category] || '#3B82F6',
                      color: '#000',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    {categoryEmojis[article.category]} {article.category}
                  </span>

                  {/* Sentiment Indicator */}
                  <span
                    style={{
                      color: sentimentColors[article.sentiment] || '#94A3B8',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    {article.sentiment}
                  </span>

                  {/* Impact Score */}
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                    Impact: {article.impact_score}/10
                  </span>

                  {/* Source */}
                  <span style={{ color: '#94A3B8', fontSize: '11px', marginLeft: 'auto' }}>
                    {article.source}
                  </span>
                </div>

                {/* Companies */}
                {article.companies && article.companies.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {article.companies.map((company) => (
                      <button
                        key={company}
                        onClick={() => setSelectedCompany(company)}
                        style={{
                          backgroundColor: '#0F172A',
                          color: '#60A5FA',
                          border: '1px solid #3B82F6',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#3B82F6';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0F172A';
                          e.currentTarget.style.color = '#60A5FA';
                        }}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
