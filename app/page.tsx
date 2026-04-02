"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart,
  Code,
  Globe,
  Megaphone,
  PenTool,
  Smartphone,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  Users,
  Award,
  Rocket,
  MessageSquare,
  Linkedin,
  Briefcase,
  ChevronDown,
  Star,
  HelpCircle,
  BookOpen,
  MapPin
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
}

interface APIComment {
  id: number;
  user_name: string;
  text: string;
  date: string;
}

const initialComments: Comment[] = [
  { id: 1, user: "Ali Khan", text: "We tried three different agencies before finding Elvion. Hands down the best digital marketing agency in Lahore. Our Google rankings went from page 5 to page 1 in just 4 months. The team actually understands what Pakistani businesses need.", date: "2025-11-10" },
  { id: 2, user: "Sarah J.", text: "Best web dev and social media marketing team in Pakistan. They rebuilt our entire website and took over our social media. Our Instagram engagement went up 400% and we're getting real leads now — not just likes.", date: "2025-11-05" },
  { id: 3, user: "Bilal Ahmed", text: "As a small restaurant owner in Lahore, I needed affordable social media management services in Pakistan. Elvion delivered beyond expectations. They created amazing content for our Facebook and Instagram, and our monthly orders doubled within 3 months.", date: "2025-10-28" },
  { id: 4, user: "Zainab Fatima", text: "I was skeptical about digital marketing agencies in Pakistan — most just take your money and show you vanity metrics. Elvion is different. They sent me detailed monthly reports showing exactly how many leads came from each channel. Transparent and honest team.", date: "2025-10-20" },
];

const teamMembers = [
  { name: "Muhammad Zohaib Tabassum", roleKey: "home.team.founderCeo", image: "/Zohaib_Tabassum.webp", linkedin: "https://www.linkedin.com/in/mzohaibtabassum-softwareengineer/" },
  { name: "Muhammad Tayyab", roleKey: "home.team.cto", image: "/Muhammad_Tayyab.webp", linkedin: "https://www.linkedin.com/in/muhammad-tayyab-sofwareengineer/" },
  { name: "Husnain Mehmood", roleKey: "home.team.coo", image: "/Husnain_Mehmood.webp", linkedin: "https://www.linkedin.com/in/husnain-mehmood-b977362bb/" },
  { name: "Hammad Ahmad", roleKey: "home.team.bizDev", image: "/Hammad_Ahmad.webp", linkedin: "https://www.linkedin.com/in/hammad-ahmad-0b1b3b1b3/" }
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Delay the visibility state update to avoid sync state update
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 0);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Load comments from API
    const loadComments = async () => {
      try {
        const data = await fetchAPI("/comments/") as APIComment[];
        if (Array.isArray(data) && data.length > 0) {
          setComments(data.map((c: APIComment) => ({
            id: c.id,
            user: c.user_name || "Guest User",
            text: c.text,
            date: c.date
          })));
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };
    loadComments();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      setStatus(t("home.testimonials.empty"));
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const userName = isAuthenticated && user ? (user.name || user.email) : "Guest User";
      await fetchAPI("/comments/", {
        method: "POST",
        body: JSON.stringify({
          user_name: userName,
          text: comment,
          date: new Date().toISOString().split('T')[0]
        }),
      });
      const newComment = {
        id: Date.now(),
        user: userName,
        text: comment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments([...comments, newComment]);
      setComment("");
      setStatus(t("home.testimonials.success"));
      setTimeout(() => setStatus(""), 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus(t("home.testimonials.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(0,210,141,0.3); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(0,210,141,0.6); }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(50px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgba(0,210,141,0.2);
            box-shadow: 0 0 0 0 rgba(0,210,141,0.4);
          }
          50% { 
            border-color: rgba(0,210,141,0.6);
            box-shadow: 0 0 20px 5px rgba(0,210,141,0.2);
          }
        }
        
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(0,210,141,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        
        .text-shadow-glow {
          text-shadow: 0 0 30px rgba(0,210,141,0.6), 0 0 60px rgba(0,210,141,0.4), 0 0 90px rgba(0,210,141,0.2);
        }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,210,141,0.25);
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-3d:hover {
          transform: perspective(1000px) rotateY(8deg) rotateX(8deg);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(90deg, #00d28d, #4a90e2, #00d28d);
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: #111;
          border-radius: inherit;
        }
        
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[#0a0a0a]">
          <div
            className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#00d28d]/10 blur-[140px] rounded-full animate-float"
            style={{
              transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
              animationDelay: '0s'
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4a90e2]/10 blur-[120px] rounded-full animate-float"
            style={{
              animationDelay: '3s',
              transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
            }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#00d28d]/5 blur-[100px] rounded-full animate-float"
            style={{
              animationDelay: '1.5s',
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
            }}
          ></div>
        </div>

        {/* Animated Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.12)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
              <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                {t("home.hero.badge")}
              </span>
            </div>

            <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
              {t("home.hero.title1")}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                {t("home.hero.titleHighlight")}
              </span>
              <br />{t("home.hero.title3")}
            </h1>

            <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
              {t("home.hero.description")}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
              <Link href="/contact">
                <button className="group relative px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                  <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {t("home.hero.getConsultation")}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                </button>
              </Link>
              <Link href="/services/web-designs">
                <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                  <span className="relative z-10">{t("home.hero.viewWork")}</span>
                  <div className="absolute inset-0 bg-[#00d28d]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.9s' }}>
              {[
                { value: "350+", label: t("home.hero.projectsDelivered") },
                { value: "100%", label: t("home.hero.clientSatisfaction") },
                { value: "50+", label: t("home.hero.activeClients") },
                { value: "24/7", label: t("home.hero.supportAvailable") }
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1 group cursor-default">
                  <div className="text-3xl font-bold text-[#00d28d] group-hover:scale-125 transition-all duration-500 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#888] group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">{t("home.services.badge")}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">{t("home.services.title")}</h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              {t("home.services.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: t("home.services.fullStack.title"),
                desc: t("home.services.fullStack.desc"),
                features: [t("home.services.fullStack.f1"), t("home.services.fullStack.f2"), t("home.services.fullStack.f3")]
              },
              {
                icon: Globe,
                title: t("home.services.seo.title"),
                desc: t("home.services.seo.desc"),
                features: [t("home.services.seo.f1"), t("home.services.seo.f2"), t("home.services.seo.f3")]
              },
              {
                icon: Smartphone,
                title: t("home.services.smm.title"),
                desc: t("home.services.smm.desc"),
                features: [t("home.services.smm.f1"), t("home.services.smm.f2"), t("home.services.smm.f3")]
              },
              {
                icon: Megaphone,
                title: t("home.services.ads.title"),
                desc: t("home.services.ads.desc"),
                features: [t("home.services.ads.f1"), t("home.services.ads.f2"), t("home.services.ads.f3")]
              },
              {
                icon: PenTool,
                title: t("home.services.design.title"),
                desc: t("home.services.design.desc"),
                features: [t("home.services.design.f1"), t("home.services.design.f2"), t("home.services.design.f3")]
              },
              {
                icon: BarChart,
                title: t("home.services.reporting.title"),
                desc: t("home.services.reporting.desc"),
                features: [t("home.services.reporting.f1"), t("home.services.reporting.f2"), t("home.services.reporting.f3")]
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="group bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 card-3d hover-lift relative overflow-hi  dden"
                style={{
                  animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                  animationDelay: `${idx * 0.15}s`,
                  opacity: 0
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/0 via-[#00d28d]/0 to-[#00d28d]/0 group-hover:from-[#00d28d]/10 group-hover:via-[#00d28d]/15 group-hover:to-[#00d28d]/10 transition-all duration-700"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                    <service.icon size={32} className="group-hover:animate-pulse" style={{ animationDuration: '1s' }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#00d28d] transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-[#888] mb-4 leading-relaxed group-hover:text-[#aaa] transition-colors duration-500">
                    {service.desc}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                        <CheckCircle2 size={16} className="text-[#00d28d] mr-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d28d]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4a90e2]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-32 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,210,141,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">{t("home.process.badge")}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t("home.process.title")}
            </h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              {t("home.process.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { number: "01", icon: Target, title: t("home.process.strategy"), desc: t("home.process.strategyDesc") },
              { number: "02", icon: PenTool, title: t("home.process.branding"), desc: t("home.process.brandingDesc") },
              { number: "03", icon: Globe, title: t("home.process.seo"), desc: t("home.process.seoDesc") },
              { number: "04", icon: Users, title: t("home.process.smm"), desc: t("home.process.smmDesc") },
              { number: "05", icon: Award, title: t("home.process.success"), desc: t("home.process.successDesc") },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift animate-pulse-border">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl font-black text-[#00d28d]/20 group-hover:text-[#00d28d]/80 group-hover:scale-125 transition-all duration-700 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
                      {step.number}
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-1000 animate-glow">
                      <step.icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#00d28d] to-transparent group-hover:w-10 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">{t("home.team.badge")}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">{t("home.team.title")}</h2>
            <p className="text-[#888] text-lg mt-4">
              {t("home.team.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/50 transition-all duration-500 hover-lift text-center"
              >
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#686969]/10 group-hover:border-[#787979] group-hover:scale-105 transition-all duration-500">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    quality={100}
                    priority
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00d28d] transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-[#888] text-sm group-hover:text-[#aaa] transition-colors duration-300 mb-4">
                  {t(member.roleKey)}
                </p>

                {/* LinkedIn and Portfolio Buttons */}
                <div className="flex justify-center gap-3">
                  <Link href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer">
                    <button className="group flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-transparent border border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 rounded-full transition-all duration-300">
                      <Linkedin size={14} className="group-hover:text-[#00d28d] transition-colors duration-300" />
                      {t("home.team.linkedin")}
                    </button>
                  </Link>
                  <Link href="/portfolio">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0a0a0a] bg-[#00d28d] hover:bg-[#00a86f] rounded-full transition-colors duration-300">
                      <Briefcase size={14} />
                      {t("home.team.portfolio")}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">{t("home.whyUs.badge")}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {t("home.whyUs.title")}
              </h2>
              <p className="text-[#888] text-lg leading-relaxed">
                {t("home.whyUs.description")}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Zap, text: t("home.whyUs.fastDelivery") },
                  { icon: TrendingUp, text: t("home.whyUs.dataResults") },
                  { icon: Rocket, text: t("home.whyUs.scalable") },
                  { icon: Award, text: t("home.whyUs.awardTeam") },
                ].map((item, idx) => (
                  <div key={idx} className="group flex items-center space-x-3 bg-[#111] p-4 rounded-lg border border-white/5 hover:border-[#00d28d]/60 transition-all duration-500 hover-lift cursor-default animate-pulse-border">
                    <div className="w-10 h-10 bg-[#00d28d]/30 rounded-lg flex items-center justify-center text-[#00d28d] flex-shrink-0 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 animate-glow">
                      <item.icon size={20} />
                    </div>
                    <span className="text-white font-medium group-hover:text-[#00d28d] transition-colors duration-500">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link href="/contact">
                <button className="group mt-6 px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base hover-lift relative overflow-hidden animate-glow">
                  <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {t("home.whyUs.startJourney")}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                </button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default animate-pulse-border">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/10 via-transparent to-[#4a90e2]/10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-1000"></div>
                <div className="relative z-10 text-center space-y-4 p-8">
                  <div className="w-32 h-32 mx-auto bg-[#00d28d]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000 animate-glow">
                    <Target size={64} className="text-[#00d28d] animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-500">
                    {t("home.whyUs.quote")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] relative overflow-hidden animate-gradient">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
            {t("home.cta.title")}
          </h2>
          <p className="text-white/90 text-xl mb-8">
            {t("home.cta.description")}
          </p>
          <Link href="/contact">
            <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
              <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {t("home.cta.button")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-[#f0f0f0] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
            </button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">{t("home.testimonials.badge")}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">{t("home.testimonials.title")}</h2>
            <p className="text-[#888] text-lg">{t("home.testimonials.description")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {comments.map((c, idx) => (
              <div key={c.id} className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift animate-pulse-border" style={{
                animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${idx * 0.2}s`,
                opacity: 0
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00d28d] to-[#4a90e2] rounded-full flex items-center justify-center text-white font-bold group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 animate-glow">
                      {c.user.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#00d28d] transition-colors duration-500">{c.user}</div>
                      <div className="text-xs text-[#888]">{c.date}</div>
                    </div>
                  </div>
                  <MessageSquare size={20} className="text-[#00d28d] group-hover:scale-150 group-hover:rotate-12 transition-all duration-500 animate-glow" />
                </div>
                <p className="text-[#888] leading-relaxed group-hover:text-[#aaa] transition-colors duration-500">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-8 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 animate-pulse-border">
            <h3 className="text-2xl font-bold text-white mb-2">{t("home.testimonials.shareTitle")}</h3>
            <p className="text-[#888] mb-6">{t("home.testimonials.shareDesc")}</p>
            <div className="space-y-4">
              <textarea
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500 resize-none hover:border-[#00d28d]/50"
                rows={4}
                placeholder={t("home.testimonials.placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {status && <p className={`text-sm ${status.includes("success") ? "text-green-500" : "text-red-500"}`}>{status}</p>}
              <button
                onClick={handleCommentSubmit}
                disabled={loading}
                className="group w-full sm:w-auto px-8 py-3 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold hover-lift relative overflow-hidden animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {loading ? t("home.testimonials.posting") : t("home.testimonials.postComment")}
                  {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews & Success Stories */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm inline-block">Client Success Stories</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Trusted by Businesses Across <span className="text-[#00d28d]">Pakistan</span>
            </h2>
            <p className="text-[#888] text-lg max-w-3xl mx-auto">
              As the <strong className="text-white">best digital marketing agency in Lahore</strong>, we have helped hundreds of brands grow their online presence. Here&apos;s what our clients say about our <strong className="text-[#00d28d]">digital marketing services in Lahore</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Ahmed Raza",
                role: "CEO, TechBridge Pakistan",
                location: "Lahore",
                stars: 5,
                text: "We hired Elvion Solutions as our digital marketing agency in Lahore and the results were incredible. Our website traffic increased by 300% in just 4 months. Truly the best digital marketing agency in Lahore!",
              },
              {
                name: "Fatima Malik",
                role: "Restaurant Owner",
                location: "Lahore",
                stars: 5,
                text: "Elvion Solutions provided us the best social media marketing agency in Lahore for small business that we could find. Our Instagram followers grew from 500 to 15,000 and orders increased by 60%!",
              },
              {
                name: "Hassan Ali",
                role: "E-commerce Founder",
                location: "Karachi",
                stars: 5,
                text: "Looking for a top digital marketing company in Pakistan? Look no further. Elvion's social media growth services in Pakistan helped us 5x our online sales within 6 months.",
              },
              {
                name: "Nadia Sheikh",
                role: "Beauty Salon Owner",
                location: "Lahore",
                stars: 5,
                text: "We thought affordable social media management services in Pakistan weren't possible with quality. Elvion proved us wrong. For less than PKR 20,000/month, they grew our client base by 200%.",
              },
              {
                name: "Usman Tariq",
                role: "Real Estate Developer",
                location: "Islamabad",
                stars: 5,
                text: "Elvion Solutions' digital marketing services in Lahore helped us generate over 500 qualified property leads in 3 months. Best online marketing agency in Pakistan hands down.",
              },
              {
                name: "Ayesha Rahman",
                role: "Fashion Brand Owner",
                location: "Lahore",
                stars: 5,
                text: "As the best social media marketing agency in Lahore for small business, Elvion transformed our brand completely. Their social media marketing services in Lahore for brands are unmatched!",
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/50 transition-all duration-500"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#aaa] text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00d28d] to-[#4a90e2] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{review.name}</p>
                    <p className="text-[#555] text-xs">{review.role}</p>
                    <p className="text-[#00d28d] text-xs flex items-center gap-1"><MapPin size={10} />{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section — SEO Rich */}
      <section className="py-20 lg:py-32 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm inline-block">
              <HelpCircle size={16} className="inline mr-2" />Frequently Asked Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Questions About <span className="text-[#00d28d]">Digital Marketing in Pakistan</span>
            </h2>
            <p className="text-[#888] text-lg">
              Got questions about hiring a <strong className="text-white">digital marketing agency in Lahore</strong> or getting <strong className="text-white">social media marketing services in Lahore for brands</strong>? We&apos;ve got answers.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Why is Elvion Solutions the best digital marketing agency in Lahore?",
                a: "Elvion Solutions is recognized as the best digital marketing agency in Lahore because of our proven track record of 350+ successful projects, 100% client satisfaction, data-driven strategies, and affordable pricing. As a top digital marketing company in Pakistan, we combine local market expertise with global standards to deliver measurable results for businesses of all sizes."
              },
              {
                q: "What digital marketing services do you offer in Lahore?",
                a: "Our digital marketing services in Lahore include Search Engine Optimization (SEO), Social Media Marketing (Facebook, Instagram, TikTok, LinkedIn), Google & Meta Ads management, Content Marketing, Web Development, Email Marketing, and Analytics & Reporting. As a complete online marketing agency in Pakistan, we offer end-to-end digital solutions."
              },
              {
                q: "How much do social media marketing services cost in Lahore?",
                a: "Our affordable social media management services in Pakistan start from PKR 15,000/month for the Starter package. The Growth package is PKR 30,000/month and includes ads management. Enterprise packages are custom-priced. As the best social media marketing agency in Lahore for small business, we ensure our pricing is accessible for businesses of all budgets."
              },
              {
                q: "Do you work with small businesses in Pakistan?",
                a: "Absolutely! We are the best social media marketing agency in Lahore for small business. We have special packages designed for startups and small businesses. Our affordable social media management services in Pakistan have helped hundreds of small businesses grow their online presence and increase sales."
              },
              {
                q: "How long does it take to see results from digital marketing?",
                a: "Results vary by service. Social media marketing and paid ads can show results within 1-2 weeks. SEO typically takes 3-6 months for significant results. As a top digital marketing company in Pakistan, we set realistic expectations and provide transparent monthly reports so you can track your ROI."
              },
              {
                q: "Can you help my brand grow on social media in Pakistan?",
                a: "Yes! Our social media growth services in Pakistan have helped brands grow from zero to thousands of engaged followers. We offer comprehensive social media marketing services in Lahore for brands including content creation, community management, influencer partnerships, and paid advertising across all major platforms."
              },
              {
                q: "What makes Elvion different from other digital marketing agencies in Pakistan?",
                a: "What sets us apart as a digital marketing agency in Pakistan is our combination of local expertise, data-driven approach, transparent reporting, affordable pricing, and dedicated support. Unlike other agencies, we focus on delivering real ROI — not just vanity metrics. Our 100% client satisfaction rate speaks for itself."
              },
              {
                q: "Do you provide SEO services for businesses in Lahore?",
                a: "Yes, SEO is one of our core digital marketing services in Lahore. We provide comprehensive SEO including keyword research, on-page optimization, technical SEO, link building, and local SEO to help your business rank #1 on Google for your target keywords in Lahore and across Pakistan."
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-[#00d28d]/30 transition-colors duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-bold text-sm md:text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-[#00d28d] flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 border-t border-white/5">
                    <p className="text-[#aaa] text-sm leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview / Latest Articles */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm inline-block">
              <BookOpen size={16} className="inline mr-2" />Latest From Our Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Expert <span className="text-[#00d28d]">Digital Marketing</span> Insights
            </h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              Stay ahead with expert articles and strategies from the <strong className="text-white">best digital marketing agency in Lahore, Pakistan</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Why Elvion Solutions is the Best Digital Marketing Agency in Lahore",
                slug: "best-digital-marketing-agency-lahore-elvion-solutions",
                category: "Digital Marketing",
                excerpt: "Discover why businesses in Pakistan trust Elvion Solutions for results-driven digital marketing services in Lahore.",
              },
              {
                title: "Best Social Media Marketing Agency in Lahore for Small Business",
                slug: "social-media-marketing-small-business-lahore",
                category: "Social Media",
                excerpt: "A complete guide to choosing the best social media marketing agency in Lahore for your small business.",
              },
              {
                title: "Complete SEO Guide for Pakistani Businesses",
                slug: "seo-guide-pakistani-businesses-rank-google",
                category: "SEO",
                excerpt: "Learn how to rank #1 on Google with proven SEO strategies from Lahore's top digital marketing company.",
              },
            ].map((post, idx) => (
              <Link key={idx} href={`/blog/${post.slug}`} className="group">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-[#00d28d]/60 transition-all duration-500 h-full flex flex-col">
                  <div className="h-1.5 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] rounded-full mb-5" />
                  <span className="text-[#00d28d] text-xs font-bold uppercase mb-3">{post.category}</span>
                  <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#00d28d] transition-colors duration-300 leading-snug flex-1">
                    {post.title}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-[#00d28d] text-sm font-bold group-hover:translate-x-1 transition-transform duration-300 inline-block">
                    Read Article →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-block px-8 py-4 border-2 border-[#00d28d]/40 text-[#00d28d] rounded-full font-bold hover:bg-[#00d28d]/10 hover:border-[#00d28d] transition-all duration-300"
            >
              View All Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Keyword-Rich Content Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              The Leading <span className="text-[#00d28d]">Digital Marketing Agency in Pakistan</span> — Trusted by 350+ Businesses
            </h2>

            <div className="space-y-5 text-[#aaa] leading-relaxed">
              <p>
                <strong className="text-white">Elvion Solutions</strong> is the <strong className="text-[#00d28d]">best digital marketing agency in Lahore</strong> offering comprehensive <strong className="text-white">digital marketing services in Lahore</strong> and across Pakistan. Our team of certified experts specializes in SEO, social media marketing, Google Ads, content marketing, and web development — everything your business needs to dominate the digital landscape.
              </p>

              <p>
                As a <strong className="text-[#00d28d]">top digital marketing company in Pakistan</strong>, we understand the unique challenges that Pakistani businesses face when going digital. From language preferences and cultural nuances to platform algorithms and consumer behavior — our local expertise as a <strong className="text-white">digital marketing agency in Lahore</strong> gives us an unmatched edge.
              </p>

              <p>
                Whether you are a startup looking for <strong className="text-[#00d28d]">affordable social media management services in Pakistan</strong>, an established brand seeking <strong className="text-white">social media marketing services in Lahore for brands</strong>, or an enterprise needing a full-scale <strong className="text-[#00d28d]">online marketing agency in Pakistan</strong> — Elvion Solutions has the expertise, tools, and team to deliver exceptional results.
              </p>

              <p>
                Our <strong className="text-white">social media growth services in Pakistan</strong> have helped brands across industries — fashion, food, real estate, healthcare, e-commerce, education — build massive, engaged communities on Facebook, Instagram, TikTok, LinkedIn, and YouTube. We don&apos;t just post content; we build brand stories that resonate with Pakistani audiences.
              </p>

              <p>
                Searching for the <strong className="text-[#00d28d]">best social media marketing agency in Lahore for small business</strong>? You&apos;ve found it. At Elvion Solutions, we believe every business — no matter how small — deserves world-class digital marketing. Our affordable packages, transparent reporting, and dedicated account managers ensure you get the best ROI on every rupee spent.
              </p>

              <p>
                Join the <strong className="text-white">350+ businesses</strong> across Lahore, Karachi, Islamabad, and beyond that trust Elvion Solutions as their <strong className="text-[#00d28d]">digital marketing agency in Pakistan</strong>. Let&apos;s build something extraordinary together.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Digital Marketing Agency in Pakistan",
                "Digital Marketing Agency in Lahore",
                "Best Digital Marketing Agency in Lahore",
                "Top Digital Marketing Company Pakistan",
                "Digital Marketing Services in Lahore",
                "Online Marketing Agency Pakistan",
                "Social Media Marketing Lahore",
                "Social Media Growth Services Pakistan",
                "Affordable Social Media Management Pakistan",
                "SEO Services Lahore",
              ].map((keyword) => (
                <span key={keyword} className="text-xs bg-[#00d28d]/10 text-[#00d28d] px-3 py-1.5 rounded-full border border-[#00d28d]/20 font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
