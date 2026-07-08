import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeoHead } from '../components/SeoHead';
import { useGetBlogPostBySlug } from '../api/marketing.api';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: postResponse, isLoading, isError } = useGetBlogPostBySlug(slug || '');
  const post = postResponse?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-24 px-4 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-14 bg-slate-800 rounded w-3/4" />
        <div className="h-96 bg-slate-800 rounded-3xl w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-24 px-4 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Article Not Found</h1>
        <p className="text-slate-400">
          The blog post you are looking for does not exist or has been archived.
        </p>
        <Link
          to="/blog"
          className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-[#c2eb31] transition-all"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        route={`/blog/${post.slug}`}
        title={post.seoTitle || `${post.title} — Trash Here Blog`}
        description={post.seoDescription || post.excerpt}
        ogImage={post.coverImage}
        ogType="article"
        jsonLdSchema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage ? [post.coverImage] : [],
          datePublished: post.publishedAt,
          author: {
            '@type': 'Person',
            name: post.authorName,
            jobTitle: post.authorRole,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Trash Here',
            logo: {
              '@type': 'ImageObject',
              url: 'https://trashhere.com/assets/logo.png',
            },
          },
        }}
        breadcrumbSchema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trashhere.com' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://trashhere.com/blog' },
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: `https://trashhere.com/blog/${post.slug}`,
            },
          ],
        }}
      />

      <article className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-white">
            Blog
          </Link>
          <span>/</span>
          <span className="text-[#D7FF43]">{post.category}</span>
        </div>

        {/* Title & Excerpt */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            {post.excerpt}
          </p>
        </div>

        {/* Author & Meta Bar */}
        <div className="flex items-center justify-between border-y border-slate-800/80 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
              {post.authorName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-white">{post.authorName}</p>
              <p className="text-xs text-slate-400">{post.authorRole}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Published on {new Date(post.publishedAt).toLocaleDateString()}</p>
            <p className="text-[#D7FF43] font-semibold">{post.readTimeMinutes} min read</p>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            <img src={post.coverImage} alt={post.title} className="w-full h-96 object-cover" />
          </motion.div>
        )}

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-6 pt-4 whitespace-pre-line">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 border-t border-slate-800 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider py-1">
              Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 my-12">
          <h3 className="text-2xl font-bold text-white">Enjoyed this technical deep dive?</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Experience our SHA-256 carbon offset engine and algorithmic dispatch routing live in
            your city.
          </p>
          <div className="pt-2">
            <Link
              to="/app"
              className="inline-block bg-[#D7FF43] text-slate-950 font-bold px-8 py-3.5 rounded-2xl hover:bg-[#c2eb31] transition-all shadow-lg shadow-[#D7FF43]/20"
            >
              Open App Portal →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};
