import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useGetBlogPosts } from '../api/marketing.api';

export const BlogListingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { data: blogResponse, isLoading, isError } = useGetBlogPosts(selectedCategory);

  const categories = ['ALL', 'Engineering & AI', 'Logistics', 'Sustainability', 'Company'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route="/blog"
        title="Climate Tech & AI Logistics Blog — Trash Here"
        description="Read technical deep dives into algorithmic polyline routing, 50-ton weighbridge IoT telemetry, and municipal recycling economics."
      />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#D7FF43] uppercase tracking-wider">
            <span>📚 Technical Insights & Research</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            The Trash Here Blog
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Engineering breakthroughs, environmental data science, and corporate updates from our climate infrastructure team.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800/80 pb-6" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#D7FF43] ${
                selectedCategory === cat
                  ? 'bg-[#D7FF43] text-slate-950 shadow-lg shadow-[#D7FF43]/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-slate-800 rounded-2xl" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-8 text-center text-red-300">
            Failed to load blog posts. Please check your network connection or try again later.
          </div>
        )}

        {!isLoading && !isError && (!blogResponse?.data || blogResponse.data.length === 0) && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <p className="text-xl font-bold text-white">No articles found in this category yet.</p>
            <p className="text-sm text-slate-400">Our editorial team is actively publishing new research. Please check back soon!</p>
          </div>
        )}

        {!isLoading && !isError && blogResponse?.data && blogResponse.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogResponse.data.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between backdrop-blur-md shadow-2xl transition-all group"
              >
                <div>
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center text-4xl border-b border-slate-800">
                      📝
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[#D7FF43] font-medium">
                        {post.category}
                      </span>
                      <span>{post.readTimeMinutes} min read</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-[#D7FF43] transition-colors line-clamp-2">
                      <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {post.authorName.charAt(0)}
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">{post.authorName}</p>
                      <p className="text-slate-500">{post.authorRole}</p>
                    </div>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-[#D7FF43] hover:underline"
                    aria-label={`Read full article: ${post.title}`}
                  >
                    Read →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
