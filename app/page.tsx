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
  Briefcase
} from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  { id: 1, user: "Ali Khan", text: "Elvion transformed our sales funnel!", date: "2025-11-20" },
  { id: 2, user: "Sarah J.", text: "Best web dev team in Pakistan.", date: "2025-12-05" }
];

const teamMembers = [
  { name: "Muhammad Zohaib Tabassum", role: "Founder & CEO", image: "/Zohaib_Tabassum.webp", linkedin: "https://www.linkedin.com/in/mzohaibtabassum-softwareengineer/" },
  { name: "Muhammad Tayyab", role: "Chief Technical Officer", image: "/Muhammad_Tayyab.webp", linkedin: "https://www.linkedin.com/in/muhammad-tayyab-sofwareengineer/" },
  { name: "Husnain Mehmood", role: "Chief Of Operations", image: "/Husnain_Mehmood.webp", linkedin: "https://www.linkedin.com/in/husnain-mehmood-b977362bb/" },
  { name: "Hammad Ahmad", role: "Business Developer", image: "/Hammad_Ahmad.webp", linkedin: "https://www.linkedin.com/in/hammad-ahmad-0b1b3b1b3/" }
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
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
      setStatus("Please enter a comment");
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
      setStatus("Comment posted successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Failed to post comment");
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
                Smart Digital & Automation Solutions
              </span>
            </div>

            <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
              WE LEAD YOU TO<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                SUCCESS
              </span>
              <br />IN YOUR BUSINESS
            </h1>

            <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
              Transform your business with cutting-edge digital solutions. From zero to hero, we handle your business growth with proven strategies and powerful automation.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
              <Link href="/contact">
                <button className="group relative px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                  <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    Get Free Consultation
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                </button>
              </Link>
              <Link href="/services/web-designs">
                <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                  <span className="relative z-10">View Our Work</span>
                  <div className="absolute inset-0 bg-[#00d28d]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.9s' }}>
              {[
                { value: "350+", label: "Projects Delivered" },
                { value: "100%", label: "Client Satisfaction" },
                { value: "50+", label: "Active Clients" },
                { value: "24/7", label: "Support Available" }
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
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">What We Offer</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Our Core Services</h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              Comprehensive digital solutions designed to elevate your brand and drive measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: "Full-Stack Development",
                desc: "Next.js, React & FastAPI solutions with seamless AI integration for modern web applications.",
                features: ["Next.js & React", "FastAPI Backend", "AI Integration"]
              },
              {
                icon: Globe,
                title: "SEO & Digital Marketing",
                desc: "Rank #1 on Google with our data-driven SEO strategies and content optimization.",
                features: ["On-Page SEO", "Technical SEO", "Link Building"]
              },
              {
                icon: Smartphone,
                title: "Social Media Management",
                desc: "Strategic content creation and campaign management that converts followers into loyal customers.",
                features: ["Content Strategy", "Community Management", "Analytics"]
              },
              {
                icon: Megaphone,
                title: "Performance Marketing",
                desc: "High ROI ad campaigns on Meta, Google, and TikTok with continuous optimization.",
                features: ["Meta Ads", "Google Ads", "Campaign Optimization"]
              },
              {
                icon: PenTool,
                title: "Graphic Design & Branding",
                desc: "Stunning visuals and brand identity design that captures attention and defines your market presence.",
                features: ["Logo Design", "Brand Guidelines", "Marketing Materials"]
              },
              {
                icon: BarChart,
                title: "Analytics & Reporting",
                desc: "Data-driven insights and detailed reports for informed decision-making and maximum growth.",
                features: ["Google Analytics", "Custom Dashboards", "Performance Reports"]
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
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Approach</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Your Journey to Success
            </h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">
              A proven 5-step process that transforms your business from concept to reality
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { number: "01", icon: Target, title: "Strategy", desc: "Define goals and create roadmap" },
              { number: "02", icon: PenTool, title: "Branding", desc: "Build your unique identity" },
              { number: "03", icon: Globe, title: "SEO", desc: "Optimize for search engines" },
              { number: "04", icon: Users, title: "SMM", desc: "Engage your audience" },
              { number: "05", icon: Award, title: "Success", desc: "Achieve measurable results" },
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
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Our Team</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Meet The Experts</h2>
            <p className="text-[#888] text-lg mt-4">
              Passionate professionals dedicated to your success
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
                  {member.role}
                </p>

                {/* LinkedIn and Portfolio Buttons */}
                <div className="flex justify-center gap-3">
                  <Link href={member.linkedin || "#"} target="_blank" rel="noopener noreferrer">
                    <button className="group flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-transparent border border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 rounded-full transition-all duration-300">
                      <Linkedin size={14} className="group-hover:text-[#00d28d] transition-colors duration-300" />
                      LinkedIn
                    </button>
                  </Link>
                  <Link href="/portfolio">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#0a0a0a] bg-[#00d28d] hover:bg-[#00a86f] rounded-full transition-colors duration-300">
                      <Briefcase size={14} />
                      Portfolio
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
              <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Why Elvion Solutions</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                We Are Creative Business Solutions Agency
              </h2>
              <p className="text-[#888] text-lg leading-relaxed">
                Ready to elevate your brand? At Elvion Solutions, we specialize in high-impact strategies that cut through the digital noise and deliver real, measurable results.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Zap, text: "Lightning Fast Delivery" },
                  { icon: TrendingUp, text: "Data-Driven Results" },
                  { icon: Rocket, text: "Scalable Solutions" },
                  { icon: Award, text: "Award-Winning Team" },
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
                    Start Your Digital Journey
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
                    Consistency is Key! Your identity must shine across every scroll and every click.
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
            Ready to Build a Brand That Truly Engages?
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Get a free digital audit and discover how we can transform your business
          </p>
          <Link href="/contact">
            <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
              <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                Get Your Free Consultation Call
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
            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">What People Say About Us</h2>
            <p className="text-[#888] text-lg">Real feedback from our satisfied clients</p>
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
            <h3 className="text-2xl font-bold text-white mb-2">Share Your Experience</h3>
            <p className="text-[#888] mb-6">Let us know how we helped transform your business</p>
            <div className="space-y-4">
              <textarea
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500 resize-none hover:border-[#00d28d]/50"
                rows={4}
                placeholder="Share your experience with Elvion Solutions..."
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
                  {loading ? "Posting..." : "Post Comment"}
                  {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
