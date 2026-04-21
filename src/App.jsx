import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Zap } from 'lucide-react';

// Sample data with all 6 categories
const sampleArticles = [
  {
    id: 1,
    title: "Microsoft Acquires Obsidian Entertainment for $3.6 Billion",
    source: "GamesIndustry.biz",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    companies: ["Microsoft", "Obsidian Entertainment"],
    category: "acquisition",
    sentiment: "positive",
    impactScore: 9,
    summary: "Microsoft has acquired renowned RPG studio Obsidian Entertainment in a landmark deal, strengthening its first-party development portfolio.",
    url: "#"
  },
  {
    id: 2,
    title: "Ubisoft Reports 30% Staff Reduction Amid Strategic Restructuring",
    source: "Polygon",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    companies: ["Ubisoft"],
    category: "layoff",
    sentiment: "negative",
    impactScore: 8,
    summary: "Ubisoft announced significant workforce reductions affecting 30% of its global staff as part of a strategic reorganization.",
    url: "#"
  },
  {
    id: 3,
    title: "Baldur's Gate 3 Breaks 10 Million Sales Record",
    source: "VG247",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    companies: ["Larian Studios", "Wizards of the Coast"],
    category: "release",
    sentiment: "positive",
    impactScore: 7,
    summary: "Larian Studios' critically acclaimed RPG Baldur's Gate 3 has surpassed 10 million copies sold globally.",
    url: "#"
  },
  {
    id: 4,
    title: "PlayStation 6 Technical Specifications Rumored to Be Revealed Next Quarter",
    source: "IGN",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    companies: ["Sony Interactive Entertainment"],
    category: "business",
    sentiment: "neutral",
    impactScore: 6,
    summary: "Sources suggest Sony will announce PlayStation 6 specifications in Q3, with significant performance upgrades expected.",
    url: "#"
  },
  {
    id: 5,
    title: "New Report: Game Industry Revenue Projected to Hit $220B by 2027",
    source: "VG247",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    companies: ["Newzoo"],
    category: "trend",
    sentiment: "positive",
    impactScore: 5,
    summary: "A comprehensive market analysis projects strong growth across console, PC, and cloud gaming sectors over the next three years.",
    url: "#"
  },
  {
    id: 6,
    title: "Take-Two Interactive Announces New CEO Following Executive Leadership Transition",
    source: "GamesIndustry.biz",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    companies: ["Take-Two Interactive"],
    category: "leadership",
    sentiment: "neutral",
    impactScore: 7,
    summary: "Take-Two Interactive has appointed a new Chief Executive Officer as part of planned leadership restructuring.",
    url: "#"
  },
  {
    id: 7,
    title: "Square Enix Announces Final Fantasy VII Remake Part 3",
    source: "Polygon",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    companies: ["Square Enix"],
    category: "release",
    sentiment: "positive",
    impactScore: 8,
    summary: "Square Enix officially announces the third installment of the Final Fantasy VII Remake series with release window for 2026.",
    url: "#"
  },
  {
    id: 8,
    title: "Rockstar Games Announces Grand Theft Auto 6 Launch Window",
    source: "GamesIndustry.biz",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    companies: ["Rockstar Games", "Take-Two Interactive"],
    category: "release",
    sentiment: "positive",
    impactScore: 10,
    summary: "Rockstar Games confirms Grand Theft Auto 6 will launch in Fall 2025 across PlayStation 5 and Xbox Series X/S.",
    url: "#"
  }
];

const categoryConfig = {
  layoff: { label: 'Layoffs', color: '#EF4444', icon: '🔴' },
  acquisition: { label: 'Acquisition', color: '#F97316', icon: '🟠' },
  business: { label: 'Business', color: '#FBBF24', icon: '🟡' },
  release: { label: 'Release', color: '#22C55E', icon: '🟢' },
  trend: { label: 'Trend', color: '#3B82F6', icon: '🔵' },
  leadership: { label: 'Leadership', color: '#A855F7', icon: '🟣' }
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique companies
  const allCompanies = [...new Set(sampleArticles.flatMap(a => a.companies))].sort();

  // Filter articles
  const filteredArticles = useMemo(() => {
    return sampleArticles.filter(article => {
      // Category filter
      if (selectedCategory && article.category !== selectedCategory) return false;

      // Company filter
      if (selectedCompanies.length > 0 && !selectedCompanies.some(c => article.companies.includes(c))) return false;

      // Date filter
      const now = new Date();
      if (dateRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const articleDate = new Date(article.publishedAt.getFullYear(), article.publishedAt.getMonth(), article.publishedAt.getDate());
        if (articleDate.getTime() !== today.getTime()) return false;
      } else if (dateRange === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (article.publishedAt < sevenDaysAgo) return false;
      } else if (dateRange === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (article.publishedAt < thirtyDaysAgo) return false;
      }

      // Search filter
      if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !article.summary.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [selectedCategory, selectedCompanies, dateRange, searchTerm]);

  // Sort by date
  const sortedArticles = [...filteredArticles].sort((a, b) => b.publishedAt - a.publishedAt);

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">GAME PULSE</h1>
              <p className="text-sm text-slate-400 mt-1">Real-time gaming industry intelligence</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">{sortedArticles.length}</div>
              <div className="text-xs text-slate-400">Articles Matching</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute left-3 top-3 w-5 h-5 text-slate-500">🔍</div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Date Filter */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Date Range</h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '30days', label: 'Last 30 Days' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setDateRange(option.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dateRange === option.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    All Categories
                  </button>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        selectedCategory === key
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Companies</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allCompanies.map(company => (
                    <button
                      key={company}
                      onClick={() => setSelectedCompanies(
                        selectedCompanies.includes(company)
                          ? selectedCompanies.filter(c => c !== company)
                          : [...selectedCompanies, company]
                      )}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCompanies.includes(company)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {sortedArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-400">No articles match your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedArticles.map((article, idx) => {
                  const config = categoryConfig[article.category];
                  return (
                    <div
                      key={article.id}
                      className="group bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:bg-slate-800/80 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50 article-card"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Category Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded text-white"
                          style={{ backgroundColor: config.color }}
                        >
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(article.publishedAt)}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                        {article.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-sm text-slate-400 mb-4">{article.summary}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {/* Companies */}
                        <div className="flex flex-wrap gap-2">
                          {article.companies.map(company => (
                            <span
                              key={company}
                              className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded border border-slate-600"
                            >
                              {company}
                            </span>
                          ))}
                        </div>

                        {/* Sentiment */}
                        <div
                          className="px-2 py-1 rounded border"
                          style={{
                            backgroundColor: article.sentiment === 'positive' ? 'rgba(34, 197, 94, 0.1)' : 
                                           article.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                            borderColor: article.sentiment === 'positive' ? '#22C55E' : 
                                        article.sentiment === 'negative' ? '#EF4444' : '#64748B',
                            color: article.sentiment === 'positive' ? '#22C55E' : 
                                  article.sentiment === 'negative' ? '#EF4444' : '#94A3B8'
                          }}
                        >
                          {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                        </div>

                        {/* Impact Score */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-amber-300 rounded border border-slate-600">
                          <Zap className="w-3 h-3" />
                          {article.impactScore}/10
                        </div>

                        {/* Source */}
                        <div className="ml-auto text-slate-500">
                          {article.source}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
