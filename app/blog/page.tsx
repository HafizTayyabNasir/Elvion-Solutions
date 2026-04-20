import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blogData";

export const metadata: Metadata = {
  title: "Digital Marketing Blog | Elvion Solutions — Best Agency in Lahore, Pakistan",
  description:
    "Read expert articles on digital marketing, social media marketing, SEO, and online marketing from Elvion Solutions — the best digital marketing agency in Lahore, Pakistan.",
  keywords:
    "digital marketing blog Pakistan, social media marketing tips Lahore, SEO guide Pakistan, digital marketing agency in Lahore blog, online marketing Pakistan",
  openGraph: {
    title: "Digital Marketing Blog | Elvion Solutions",
    description:
      "Expert insights on digital marketing, social media marketing, and SEO from the best digital marketing agency in Lahore, Pakistan.",
    url: "https://elvionsolutions.com/blog",
    type: "website",
  },
  alternates: {
    canonical: "https://elvionsolutions.com/blog",
  },
};

const categoryColors: Record<string, string> = {
  "Digital Marketing": "bg-[#00d28d]/20 text-[#00d28d] border border-[#00d28d]/30",
  "Social Media Marketing": "bg-[#4a90e2]/20 text-[#4a90e2] border border-[#4a90e2]/30",
  SEO: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

export default function BlogPage() {
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 mb-16 text-center">
        <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 inline-block mb-6">
          Expert Insights
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          Digital Marketing{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] to-[#4a90e2]">
            Blog & Resources
          </span>
        </h1>
        <p className="text-[#888] text-lg max-w-3xl mx-auto leading-relaxed">
          Expert articles, guides, and strategies from{" "}
          <strong className="text-white">Elvion Solutions</strong> — the{" "}
          <strong className="text-[#00d28d]">best digital marketing agency in Lahore, Pakistan</strong>.
          Learn how to grow your brand with{" "}
          <strong className="text-white">social media marketing, SEO, and online marketing</strong>.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <span className="px-4 py-2 rounded-full bg-[#00d28d] text-[#0a0a0a] font-bold text-sm">
            All Articles
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                categoryColors[cat] ?? "bg-white/10 text-white border border-white/20"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* SEO Keyword Intro (visible, helpful content) */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Go-To Resource for Digital Marketing in Pakistan
          </h2>
          <p className="text-[#888] leading-relaxed">
            Welcome to the Elvion Solutions blog — your comprehensive resource for all things{" "}
            <strong className="text-white">digital marketing in Pakistan</strong>. Whether you&apos;re looking for
            tips on <strong className="text-[#00d28d]">social media marketing services in Lahore for brands</strong>,
            strategies for{" "}
            <strong className="text-white">social media growth services in Pakistan</strong>, or a complete guide to{" "}
            <strong className="text-[#00d28d]">digital marketing services in Lahore</strong> — you&apos;ll find it all
            here. Our team of experts at this{" "}
            <strong className="text-white">top digital marketing company in Pakistan</strong> shares proven strategies,
            real case studies, and actionable insights every week.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00d28d]/60 transition-all duration-500 h-full flex flex-col">
                {/* Card Top Color Bar */}
                <div className="h-2 bg-gradient-to-r from-[#00d28d] to-[#4a90e2]" />

                <div className="p-6 flex flex-col flex-1">
                  {/* Category + Read Time */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        categoryColors[post.category] ?? "bg-white/10 text-white"
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="text-[#555] text-xs">{post.readTime}</span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-[#00d28d] transition-colors duration-300 line-clamp-3">
                    {post.title}
                  </h2>

                  <p className="text-[#888] text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-white/5 text-[#888] px-2 py-1 rounded-full border border-white/10"
                      >
                        #{tag.replace(/ /g, "-")}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-white text-sm font-medium">{post.author}</p>
                      <p className="text-[#555] text-xs">
                        {new Date(post.date).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-[#00d28d] text-sm font-bold group-hover:translate-x-1 transition-transform duration-300 inline-block">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 mt-20">
        <div className="bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 border border-[#00d28d]/30 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Grow Your Business with{" "}
            <span className="text-[#00d28d]">Digital Marketing in Pakistan</span>?
          </h2>
          <p className="text-[#888] mb-8 text-lg">
            Stop reading and start growing. Let{" "}
            <strong className="text-white">Elvion Solutions</strong> — the{" "}
            <strong className="text-[#00d28d]">best digital marketing agency in Lahore</strong> — build
            a custom strategy for your business.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base hover:bg-[#00b377] transition-colors duration-300"
          >
            Get Your Free Consultation →
          </Link>
        </div>
      </section>
    </div>
  );
}
