import React, { useState } from 'react';
import { NEWS_ARTICLES, HISTORICAL_RECORDS } from '../data/f1Data';
import { NewsArticle, HistoricalRecord } from '../types';
import { 
  BookOpen, 
  History, 
  Search, 
  Tag, 
  Clock, 
  ExternalLink, 
  Trophy, 
  Flame, 
  Zap, 
  Award, 
  ChevronRight, 
  X 
} from 'lucide-react';

interface NewsAndHistoryProps {
  isDarkMode: boolean;
}

export const NewsAndHistory: React.FC<NewsAndHistoryProps> = ({ isDarkMode }) => {
  const [subTab, setSubTab] = useState<'news' | 'history'>('news');
  const [newsCategory, setNewsCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Filter news
  const filteredArticles = NEWS_ARTICLES.filter(article => {
    const matchesCat = newsCategory === 'All' || article.category === newsCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className={`p-4 sm:p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase">
              Paddock Journal & Heritage
            </span>
            <span className="text-xs text-slate-400">Technical Analysis & 75 Years of F1 Glory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-racing font-bold text-slate-100 tracking-wide mt-1">
            F1 News Wire & Historical Archive
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono">
          <button
            onClick={() => setSubTab('news')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              subTab === 'news' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Paddock News</span>
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
              subTab === 'history' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historical Stats</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: News Wire */}
      {subTab === 'news' && (
        <div className="space-y-4">
          {/* Filter and search bar */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Technical', 'Driver Market', 'FIA & Rules', 'Race Debrief'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewsCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                    newsCategory === cat 
                      ? 'bg-red-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles or tags..."
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* News Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-5 rounded-xl border cursor-pointer group transition-all hover:border-red-500/50 flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                      {article.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-racing font-bold text-slate-100 group-hover:text-red-400 transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-2">
                    {article.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{article.source} • {article.date}</span>
                  <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Article Full Reader Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`w-full max-w-2xl rounded-2xl border p-6 max-h-[85vh] overflow-y-auto ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white uppercase">
                    {selectedArticle.category}
                  </span>
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl font-racing font-bold mt-4 leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2 mb-4">
                  <span>Source: {selectedArticle.source}</span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>

                <div className="prose prose-invert text-sm text-slate-300 space-y-4 whitespace-pre-line leading-relaxed font-sans">
                  {selectedArticle.content}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-slate-800">
                  {selectedArticle.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Historical Records & All-Time Stats */}
      {subTab === 'history' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HISTORICAL_RECORDS.map((rec) => (
              <div 
                key={rec.id} 
                className={`p-5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    {rec.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{rec.yearOrEra}</span>
                </div>

                <h3 className="text-xl font-racing font-bold text-slate-100">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1 mb-4">
                  {rec.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {rec.keyHolders.map((holder, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-lg flex items-center justify-between text-xs font-mono ${
                        idx === 0 
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold' 
                          : 'bg-slate-950/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-racing">#{idx + 1}</span>
                        <span>{holder.name}</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">({holder.teamOrCountry})</span>
                      </div>
                      <span className="font-bold">{holder.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
