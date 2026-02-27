"use client";
import { useState, useEffect } from "react";
import { 
    ArrowRight, 
    Search, 
    Share2, 
    Megaphone, 
    PenTool, 
    BarChart,
    Target,
    TrendingUp,
    Users,
    Zap,
    Award,
    CheckCircle2,
    Globe,
    Rocket,
    Star,
    Clock,
    Shield,
    Eye,
    Heart,
    Code,
    Smartphone
} from "lucide-react";

export default function DigitalMarketing() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("seo");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 0);
        
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const services = [
        {
            title: "SEO",
            desc: "Boost your search rankings and drive organic traffic with our expert SEO strategies.",
            icon: Search,
            features: ["On-Page SEO", "Technical SEO", "Link Building"]
        },
        {
            title: "Social Media Marketing",
            desc: "Build a loyal community and engage with your audience across all major social platforms.",
            icon: Share2,
            features: ["Content Strategy", "Community Management", "Analytics"]
        },
        {
            title: "Google / Meta Ads",
            desc: "High-ROI paid advertising campaigns that target your ideal customers with precision.",
            icon: Megaphone,
            features: ["Meta Ads", "Google Ads", "Campaign Optimization"]
        },
        {
            title: "Content Marketing",
            desc: "Compelling content that tells your brand story and establishes you as a thought leader.",
            icon: PenTool,
            features: ["Content Strategy", "Copywriting", "Brand Storytelling"]
        },
        {
            title: "Analytics",
            desc: "Deep insights and reporting to measure performance and optimize your marketing spend.",
            icon: BarChart,
            features: ["Google Analytics", "Custom Dashboards", "Performance Reports"]
        }
    ];

    const marketingProcess = [
        { number: "01", icon: Target, title: "Strategy", desc: "Define goals and create roadmap" },
        { number: "02", icon: Eye, title: "Research", desc: "Analyze market and competitors" },
        { number: "03", icon: Rocket, title: "Execute", desc: "Launch targeted campaigns" },
        { number: "04", icon: BarChart, title: "Optimize", desc: "Monitor and improve results" },
        { number: "05", icon: Award, title: "Scale", desc: "Expand successful strategies" }
    ];

    const achievements = [
        { number: "300+", label: "Campaigns Launched", icon: Rocket },
        { number: "150%", label: "Avg ROI Increase", icon: TrendingUp },
        { number: "50k+", label: "Leads Generated", icon: Users },
        { number: "95%", label: "Client Satisfaction", icon: Star }
    ];

    const whyChooseUs = [
        { icon: Zap, title: "Fast Results", desc: "See measurable improvements within weeks" },
        { icon: Shield, title: "Transparent", desc: "Clear reporting and honest communication" },
        { icon: Target, title: "Data-Driven", desc: "Every decision backed by analytics" },
        { icon: Heart, title: "Dedicated", desc: "Your success is our top priority" }
    ];

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
                    0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(74,144,226,0.3); }
                    50% { opacity: 1; box-shadow: 0 0 40px rgba(74,144,226,0.6); }
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
                        border-color: rgba(74,144,226,0.2);
                        box-shadow: 0 0 0 0 rgba(74,144,226,0.4);
                    }
                    50% { 
                        border-color: rgba(74,144,226,0.6);
                        box-shadow: 0 0 20px 5px rgba(74,144,226,0.2);
                    }
                }
                
                @keyframes scale-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
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
                    background: linear-gradient(90deg, transparent, rgba(74,144,226,0.15), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 2.5s infinite;
                }
                
                .text-shadow-glow {
                    text-shadow: 0 0 30px rgba(74,144,226,0.6), 0 0 60px rgba(74,144,226,0.4), 0 0 90px rgba(74,144,226,0.2);
                }
                
                .hover-lift {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .hover-lift:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 25px 50px rgba(74,144,226,0.25);
                }
                
                .card-3d {
                    transform-style: preserve-3d;
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .card-3d:hover {
                    transform: perspective(1000px) rotateY(8deg) rotateX(8deg);
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
                        className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#4a90e2]/10 blur-[140px] rounded-full animate-float"
                        style={{
                            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
                            animationDelay: '0s'
                        }}
                    ></div>
                    <div 
                        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00d28d]/10 blur-[120px] rounded-full animate-float"
                        style={{
                            animationDelay: '3s',
                            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
                        }}
                    ></div>
                    <div 
                        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#4a90e2]/5 blur-[100px] rounded-full animate-float"
                        style={{
                            animationDelay: '1.5s',
                            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
                        }}
                    ></div>
                </div>

                {/* Animated Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(74,144,226,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,144,226,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-[#4a90e2] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#4a90e2]/10 px-6 py-2 rounded-full border border-[#4a90e2]/30 hover:bg-[#4a90e2]/20 hover:scale-110 hover:border-[#4a90e2]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Results-Driven Digital Marketing
                            </span>
                        </div>

                        <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            ACCELERATE YOUR<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a90e2] via-[#00d28d] to-[#4a90e2] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                                GROWTH
                            </span>
                            <br />WITH DIGITAL MARKETING
                        </h1>

                        <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            Data-driven marketing strategies that reach the right audience, increase engagement, and drive conversions. Transform your business with proven digital marketing solutions.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
                            <button className="group relative px-8 py-6 bg-[#4a90e2] text-white rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    Get Free Marketing Audit
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] via-[#5a9ff2] to-[#4a90e2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                            <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#4a90e2] hover:bg-[#4a90e2]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                                <span className="relative z-10">View Case Studies</span>
                                <div className="absolute inset-0 bg-[#4a90e2]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.9s' }}>
                            {[
                                { value: "300+", label: "Campaigns Launched" },
                                { value: "150%", label: "Average ROI Increase" },
                                { value: "50k+", label: "Leads Generated" }
                            ].map((stat, idx) => (
                                <div key={idx} className="space-y-1 group cursor-default hover-lift">
                                    <div className="text-3xl font-bold text-[#4a90e2] group-hover:scale-125 transition-all duration-500 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
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
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Complete Marketing Solutions</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Comprehensive digital marketing services designed to elevate your brand and drive measurable results
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-[#4a90e2]/60 transition-all duration-700 card-3d hover-lift relative overflow-hidden"
                                style={{ 
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.15}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/0 via-[#4a90e2]/0 to-[#4a90e2]/0 group-hover:from-[#4a90e2]/10 group-hover:via-[#4a90e2]/15 group-hover:to-[#4a90e2]/10 transition-all duration-700"></div>
                                
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#4a90e2]/30 to-[#00d28d]/30 rounded-xl flex items-center justify-center text-[#4a90e2] mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                                        <service.icon size={32} className="group-hover:animate-pulse" style={{ animationDuration: '1s' }} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#4a90e2] transition-colors duration-500">
                                        {service.title}
                                    </h3>
                                    <p className="text-[#888] mb-4 leading-relaxed group-hover:text-[#aaa] transition-colors duration-500">
                                        {service.desc}
                                    </p>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                                                <CheckCircle2 size={16} className="text-[#4a90e2] mr-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#4a90e2]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00d28d]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 lg:py-32 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(74,144,226,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Process</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Your Path to Marketing Success
                        </h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            A proven 5-step process that transforms your marketing from concept to conversion
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {marketingProcess.map((step, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-[#4a90e2]/60 transition-all duration-700 hover-lift animate-pulse-border">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="text-5xl font-black text-[#4a90e2]/20 group-hover:text-[#4a90e2]/80 group-hover:scale-125 transition-all duration-700 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
                                            {step.number}
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#4a90e2]/30 to-[#00d28d]/30 rounded-xl flex items-center justify-center text-[#4a90e2] group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-1000 animate-glow">
                                            <step.icon size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#4a90e2] transition-colors duration-500">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {idx < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#4a90e2] to-transparent group-hover:w-10 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Track Record</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Proven Results</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {achievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#4a90e2]/50 transition-all duration-500 hover-lift text-center cursor-default"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#4a90e2]/20 to-[#00d28d]/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <achievement.icon size={28} className="text-[#4a90e2]" />
                                </div>
                                <div className="text-4xl font-black text-[#4a90e2] mb-2 group-hover:scale-110 transition-transform duration-300">
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

            {/* Why Choose Us Section */}
            <section className="py-20 lg:py-32 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Why Choose Us</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                Marketing That Delivers Real Results
                            </h2>
                            <p className="text-[#888] text-lg leading-relaxed">
                                We don&apos;t just run campaigns—we build growth engines. Our data-driven approach ensures every dollar spent is optimized for maximum ROI and sustainable business growth.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                {whyChooseUs.map((item, idx) => (
                                    <div key={idx} className="group flex items-center space-x-3 bg-[#111] p-4 rounded-lg border border-white/5 hover:border-[#4a90e2]/60 transition-all duration-500 hover-lift cursor-default animate-pulse-border">
                                        <div className="w-10 h-10 bg-[#4a90e2]/30 rounded-lg flex items-center justify-center text-[#4a90e2] flex-shrink-0 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 animate-glow">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium group-hover:text-[#4a90e2] transition-colors duration-500">{item.title}</div>
                                            <div className="text-xs text-[#888]">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="group mt-6 px-8 py-6 bg-[#4a90e2] text-white rounded-full font-bold text-base hover-lift relative overflow-hidden animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    Start Growing Today
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] via-[#5a9ff2] to-[#4a90e2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default animate-pulse-border">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#4a90e2]/10 via-transparent to-[#00d28d]/10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-1000"></div>
                                <div className="relative z-10 text-center space-y-4 p-8">
                                    <div className="w-32 h-32 mx-auto bg-[#4a90e2]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000 animate-glow">
                                        <TrendingUp size={64} className="text-[#4a90e2] animate-pulse" style={{ animationDuration: '2s' }} />
                                    </div>
                                    <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-500">
                                        &quot;The best marketing doesn&apos;t feel like marketing—it feels like a conversation that leads to conversion.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#4a90e2] to-[#00d28d] relative overflow-hidden animate-gradient">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
                        Ready to Grow Your Business?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Get a free marketing audit and discover how we can transform your digital presence
                    </p>
                    <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
                        <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            Get Your Free Consultation
                            <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-[#f0f0f0] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                    </button>
                </div>
            </section>

            {/* Additional Services Details Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Deep Dive</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Explore Our Marketing Services</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Search,
                                title: "Search Engine Optimization",
                                desc: "Dominate search results and drive organic traffic",
                                points: [
                                    "Technical SEO audits and optimization",
                                    "Keyword research and competitive analysis",
                                    "On-page and off-page SEO strategies",
                                    "Local SEO for geo-targeted visibility",
                                    "Content optimization for search engines",
                                    "Monthly performance reports and insights"
                                ]
                            },
                            {
                                icon: Share2,
                                title: "Social Media Excellence",
                                desc: "Build communities and engage authentically",
                                points: [
                                    "Platform-specific content strategies",
                                    "Community management and engagement",
                                    "Influencer partnerships and collaborations",
                                    "Social listening and sentiment analysis",
                                    "Creative content production",
                                    "Performance tracking and optimization"
                                ]
                            },
                            {
                                icon: Megaphone,
                                title: "Paid Advertising Campaigns",
                                desc: "ROI-focused ad campaigns that convert",
                                points: [
                                    "Google Ads (Search, Display, Shopping)",
                                    "Facebook and Instagram advertising",
                                    "LinkedIn B2B campaign management",
                                    "Retargeting and remarketing strategies",
                                    "A/B testing and conversion optimization",
                                    "Real-time campaign monitoring"
                                ]
                            },
                            {
                                icon: PenTool,
                                title: "Content That Converts",
                                desc: "Stories that resonate and drive action",
                                points: [
                                    "Blog posts and article creation",
                                    "Video content and scriptwriting",
                                    "Infographics and visual content",
                                    "Email marketing campaigns",
                                    "Case studies and whitepapers",
                                    "Brand storytelling and messaging"
                                ]
                            }
                        ].map((service, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-[#4a90e2]/50 transition-all duration-700 hover-lift"
                            >
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#4a90e2]/30 to-[#00d28d]/30 rounded-xl flex items-center justify-center text-[#4a90e2] flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                        <service.icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#4a90e2] transition-colors duration-500">
                                            {service.title}
                                        </h3>
                                        <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                            {service.desc}
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {service.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                            <CheckCircle2 size={18} className="text-[#4a90e2] flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-500" />
                                            <span className="text-sm">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials / Social Proof Section */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Success Stories</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">What Our Clients Say</h2>
                        <p className="text-[#888] text-lg">Real results from real businesses</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Ahmed Hassan",
                                role: "E-commerce Owner",
                                text: "Our sales increased 250% within 3 months of working with Elvion. Their SEO and paid ads strategy was a game-changer!"
                            },
                            {
                                name: "Sarah Malik",
                                role: "Tech Startup Founder",
                                text: "The social media campaigns they created helped us reach 100k followers in just 6 months. Incredible ROI!"
                            },
                            {
                                name: "Usman Khan",
                                role: "Restaurant Chain",
                                text: "Local SEO brought us 80% more foot traffic. We went from struggling to fully booked every weekend."
                            }
                        ].map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#4a90e2]/60 transition-all duration-700 hover-lift animate-pulse-border"
                                style={{ 
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.2}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#4a90e2] to-[#00d28d] rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-[#4a90e2] transition-colors duration-500">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-xs text-[#888]">{testimonial.role}</div>
                                    </div>
                                </div>
                                <p className="text-[#888] leading-relaxed group-hover:text-[#aaa] transition-colors duration-500">
                                    {testimonial.text}
                                </p>
                                <div className="flex gap-1 mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="text-[#4a90e2] fill-[#4a90e2] group-hover:scale-125 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow inline-block">FAQ</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Common Questions</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How long does it take to see results?",
                                a: "SEO typically shows results in 3-6 months, while paid ads can generate leads within days. We provide transparent reporting so you can track progress every step of the way."
                            },
                            {
                                q: "What makes your approach different?",
                                a: "We combine data analytics with creative storytelling. Every campaign is customized to your business goals, target audience, and industry dynamics."
                            },
                            {
                                q: "Do you work with small businesses?",
                                a: "Absolutely! We have packages designed for businesses of all sizes, from startups to established enterprises. Growth starts here."
                            },
                            {
                                q: "What's included in the free audit?",
                                a: "We'll analyze your current online presence, identify opportunities, review competitors, and provide actionable recommendations—all at no cost."
                            }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-xl border border-white/10 hover:border-[#4a90e2]/50 transition-all duration-500 hover-lift cursor-default"
                            >
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4a90e2] transition-colors duration-500 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-[#4a90e2]/20 rounded-lg flex items-center justify-center text-[#4a90e2] text-sm font-black group-hover:scale-110 transition-transform duration-300">
                                        Q
                                    </span>
                                    {faq.q}
                                </h3>
                                <p className="text-[#888] leading-relaxed pl-11 group-hover:text-[#aaa] transition-colors duration-500">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4a90e2]/10 blur-[100px] rounded-full animate-float"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00d28d]/10 blur-[100px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl p-12 border border-white/10 hover:border-[#4a90e2]/30 transition-all duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Let&apos;s Build Your Growth Engine
                        </h2>
                        <p className="text-[#888] text-xl mb-8 max-w-2xl mx-auto">
                            Ready to take your business to the next level? Get a free marketing audit and custom strategy today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="group px-8 py-6 bg-[#4a90e2] text-white rounded-full font-bold text-base hover-lift relative overflow-hidden animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    Schedule Free Consultation
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] via-[#5a9ff2] to-[#4a90e2] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                            <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#4a90e2] hover:bg-[#4a90e2]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                                <span className="relative z-10">View Our Portfolio</span>
                                <div className="absolute inset-0 bg-[#4a90e2]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}