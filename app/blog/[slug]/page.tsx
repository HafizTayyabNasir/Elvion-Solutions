import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blogData";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Elvion Solutions`,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://elvionsolutions.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://elvionsolutions.com/blog/${post.slug}`,
    },
  };
}

function renderContent(content: string): React.ReactNode {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-3xl md:text-4xl font-black text-white mt-8 mb-6 leading-tight">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-white mt-10 mb-4 leading-tight border-l-4 border-[#00d28d] pl-4">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-xl font-bold text-[#00d28d] mt-8 mb-3">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={key++} className="text-lg font-bold text-white mt-6 mb-2">
          {renderInline(line.slice(5))}
        </h4>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-[#00d28d] pl-6 py-3 my-6 bg-[#00d28d]/10 rounded-r-xl italic text-white text-lg"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].startsWith("- ")) {
        items.push(lines[j].slice(2));
        j++;
      }
      i = j - 1;
      elements.push(
        <ul key={key++} className="my-4 space-y-2 pl-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[#aaa]">
              <span className="text-[#00d28d] mt-1 flex-shrink-0">✓</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\.\s/.test(lines[j])) {
        items.push(lines[j].replace(/^\d+\.\s/, ""));
        j++;
      }
      i = j - 1;
      elements.push(
        <ol key={key++} className="my-4 space-y-2 pl-2 list-decimal list-inside">
          {items.map((item, idx) => (
            <li key={idx} className="text-[#aaa] pl-2">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-3" />);
    } else {
      elements.push(
        <p key={key++} className="text-[#aaa] leading-relaxed my-3 text-base md:text-lg">
          {renderInline(line)}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      return (
        <Link key={i} href={linkMatch[2]} className="text-[#00d28d] hover:underline font-medium">
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Elvion Solutions",
      logo: {
        "@type": "ImageObject",
        url: "https://elvionsolutions.com/logo.webp",
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    url: `https://elvionsolutions.com/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#555] mb-8">
          <Link href="/" className="hover:text-[#00d28d] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#00d28d] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-[#888] truncate">{post.title}</span>
        </nav>

        {/* Category Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00d28d]/20 text-[#00d28d] border border-[#00d28d]/30">
            {post.category}
          </span>
          <span className="text-[#555] text-sm">{post.readTime}</span>
          <span className="text-[#555] text-sm">
            {new Date(post.date).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-[#888] leading-relaxed mb-8 border-l-4 border-[#00d28d]/40 pl-4">
          {post.excerpt}
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-white/10 mb-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d28d] to-[#4a90e2] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold">{post.author}</p>
            <p className="text-[#555] text-sm">
              Digital Marketing Expert at{" "}
              <span className="text-[#00d28d]">Elvion Solutions</span> — Best Digital Marketing Agency in Lahore
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/5 text-[#888] px-3 py-1 rounded-full border border-white/10"
            >
              #{tag.replace(/ /g, "-")}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose-content">
          {renderContent(post.content)}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 border border-[#00d28d]/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Grow Your Business?
          </h3>
          <p className="text-[#888] mb-6">
            Partner with <strong className="text-white">Elvion Solutions</strong> — the{" "}
            <strong className="text-[#00d28d]">best digital marketing agency in Lahore, Pakistan</strong>. Get a free
            strategy consultation today.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold hover:bg-[#00b377] transition-colors duration-300"
          >
            Get Free Consultation →
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="group">
                  <div className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-[#00d28d]/60 transition-all duration-300 h-full">
                    <span className="text-xs text-[#00d28d] font-bold uppercase">{related.category}</span>
                    <h4 className="text-white font-bold mt-2 mb-2 leading-snug group-hover:text-[#00d28d] transition-colors text-sm line-clamp-3">
                      {related.title}
                    </h4>
                    <p className="text-[#555] text-xs">{related.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 border border-white/20 text-white rounded-full font-medium hover:border-[#00d28d] hover:text-[#00d28d] transition-colors duration-300 text-sm"
          >
            ← Back to All Articles
          </Link>
        </div>
      </article>
    </div>
  );
}
