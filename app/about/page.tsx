"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Target,
    Eye,
    Heart,
    Users,
    TrendingUp,
    Award,
    Zap,
    Globe,
    Code,
    Smartphone,
    PenTool,
    BarChart,
    Rocket,
    CheckCircle2,
    Star,
    Coffee,
    Clock,
    Shield
} from "lucide-react";

export default function About() {
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("mission");

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const coreValues = [
        { icon: Heart, title: "Passion", desc: "We love what we do and it shows in every project" },
        { icon: Shield, title: "Integrity", desc: "Honest, transparent, and committed to excellence" },
        { icon: Zap, title: "Innovation", desc: "Always pushing boundaries with creative solutions" },
        { icon: Users, title: "Collaboration", desc: "Your success is our success" }
    ];

    const achievements = [
        { number: "500+", label: "Projects Completed", icon: Award },
        { number: "200+", label: "Happy Clients", icon: Users },
        { number: "5+", label: "Years Experience", icon: Clock },
        { number: "98%", label: "Client Retention", icon: Star }
    ];

    const services = [
        { icon: Code, name: "Web Development" },
        { icon: Smartphone, name: "Mobile Apps" },
        { icon: Globe, name: "SEO & Marketing" },
        { icon: PenTool, name: "Design & Branding" },
        { icon: BarChart, name: "Analytics" },
        { icon: Rocket, name: "Growth Strategy" }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(0,210,141,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(0,210,141,0.5), 0 0 40px rgba(0,210,141,0.3);
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,210,141,0.2);
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg);
        }
      `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d28d]/10 blur-[120px] rounded-full animate-float"
                        style={{
                            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                        }}
                    ></div>
                    <div
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4a90e2]/10 blur-[100px] rounded-full animate-float"
                        style={{
                            animationDelay: '2s',
                            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
                        }}
                    ></div>
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" style={{ animationDuration: '4s' }}></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center space-y-6 animate-slide-up">
                        <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/20 hover:bg-[#00d28d]/20 hover:scale-105 transition-all duration-300 cursor-default shimmer inline-block">
                            About Elvion Solutions
                        </span>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            We Build Digital
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow">
                                Excellence
                            </span>
                        </h1>

                        <p className="text-[#888] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            At Elvion Solutions, we empower brands to grow smarter, faster, and stronger — with strategic, creative, and tech-driven solutions that transform simple ideas into high-performing digital assets.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission, Vision & Values Tabs */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {[
                            { id: "mission", icon: Target, label: "Our Mission" },
                            { id: "vision", icon: Eye, label: "Our Vision" },
                            { id: "values", icon: Heart, label: "Core Values" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? "bg-[#00d28d] text-[#0a0a0a]"
                                    : "bg-[#111] text-white border border-white/10 hover:border-[#00d28d]/50"
                                    }`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? "" : "group-hover:scale-110 transition-transform"} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-[#111] rounded-3xl p-8 md:p-12 border border-white/10 hover:border-[#00d28d]/30 transition-all duration-500 hover-lift">
                        {activeTab === "mission" && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-2xl flex items-center justify-center">
                                        <Target size={32} className="text-[#00d28d]" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">Our Mission</h2>
                                </div>
                                <p className="text-[#888] text-lg leading-relaxed">
                                    To provide cutting-edge digital tools and innovative solutions that transform simple ideas into high-performing assets. We are committed to helping businesses of all sizes achieve their digital goals through strategic planning, creative execution, and measurable results.
                                </p>
                                <div className="grid md:grid-cols-3 gap-4 pt-6">
                                    {[
                                        { icon: Zap, text: "Fast & Efficient Delivery" },
                                        { icon: Target, text: "Result-Driven Approach" },
                                        { icon: Heart, text: "Client-Centric Solutions" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 hover:border-[#00d28d]/30 transition-all duration-300">
                                            <item.icon size={20} className="text-[#00d28d]" />
                                            <span className="text-white text-sm">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "vision" && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-2xl flex items-center justify-center">
                                        <Eye size={32} className="text-[#00d28d]" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">Our Vision</h2>
                                </div>
                                <p className="text-[#888] text-lg leading-relaxed">
                                    To be the leading one-stop digital growth partner for startups and established businesses in Pakistan and beyond. We envision a future where every business, regardless of size, has access to world-class digital solutions that drive growth, innovation, and success.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 pt-6">
                                    <div className="bg-gradient-to-br from-[#00d28d]/10 to-transparent p-6 rounded-2xl border border-[#00d28d]/20">
                                        <Globe size={32} className="text-[#00d28d] mb-3" />
                                        <h3 className="text-xl font-bold text-white mb-2">Global Standards</h3>
                                        <p className="text-[#888] text-sm">Delivering international quality with local understanding</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#4a90e2]/10 to-transparent p-6 rounded-2xl border border-[#4a90e2]/20">
                                        <Rocket size={32} className="text-[#4a90e2] mb-3" />
                                        <h3 className="text-xl font-bold text-white mb-2">Future-Ready</h3>
                                        <p className="text-[#888] text-sm">Staying ahead with cutting-edge technologies</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "values" && (
                            <div className="space-y-8 animate-slide-up">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-2xl flex items-center justify-center">
                                        <Heart size={32} className="text-[#00d28d]" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white">Core Values</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {coreValues.map((value, idx) => (
                                        <div key={idx} className="group bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 hover:border-[#00d28d]/50 transition-all duration-500 hover-lift cursor-default">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                    <value.icon size={24} className="text-[#00d28d]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-300">
                                                        {value.title}
                                                    </h3>
                                                    <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-300">
                                                        {value.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Our Achievements</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Numbers That Speak</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {achievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/50 transition-all duration-500 hover-lift text-center cursor-default"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <achievement.icon size={28} className="text-[#00d28d]" />
                                </div>
                                <div className="text-4xl font-black text-[#00d28d] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {achievement.number}
                                </div>
                                <div className="text-[#888] text-sm group-hover:text-white transition-colors duration-300">
                                    {achievement.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">What We Do</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Our Expertise</h2>
                        <p className="text-[#888] text-lg mt-4 max-w-2xl mx-auto">
                            Comprehensive digital solutions tailored to your business needs
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/50 transition-all duration-500 hover-lift text-center cursor-default"
                            >
                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <service.icon size={24} className="text-[#00d28d]" />
                                </div>
                                <div className="text-white text-sm font-medium group-hover:text-[#00d28d] transition-colors duration-300">
                                    {service.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Why Choose Us Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl p-8 md:p-12 border border-white/10 hover:border-[#00d28d]/30 transition-all duration-500">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Why Choose Us</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                    Your Growth Is Our Priority
                                </h2>
                                <p className="text-[#888] text-lg leading-relaxed">
                                    We don&apos;t just deliver projects—we build partnerships. With a perfect blend of creativity, technology, and strategy, we ensure every solution is crafted to drive real business results.
                                </p>

                                <div className="space-y-3 pt-4">
                                    {[
                                        "Dedicated team of experienced professionals",
                                        "Proven track record of successful projects",
                                        "24/7 customer support and maintenance",
                                        "Transparent communication throughout",
                                        "Competitive pricing with no hidden costs",
                                        "Continuous innovation and improvement"
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group cursor-default">
                                            <CheckCircle2 size={20} className="text-[#00d28d] flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                                            <span className="text-[#888] group-hover:text-white transition-colors duration-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/10 via-transparent to-[#4a90e2]/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700"></div>
                                    <div className="relative z-10 text-center space-y-6 p-8">
                                        <div className="w-32 h-32 mx-auto bg-[#00d28d]/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                            <Coffee size={64} className="text-[#00d28d] animate-pulse" />
                                        </div>
                                        <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-300">
                                            {"Success is not final, failure is not fatal: it is the courage to continue that counts."}
                                        </p>

                                        <p className="text-[#00d28d] font-bold">— Our Team Motto</p>
                                    </div>
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
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-105 transition-transform duration-300 cursor-default">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Let&apos;s discuss how we can help transform your digital presence
                    </p>
                    <Link href="/contact">
                        <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center">
                                Get Started Today
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white to-[#f0f0f0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}