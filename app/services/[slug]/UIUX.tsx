"use client";
import { useState, useEffect } from "react";
import {
    ArrowRight,
    Monitor,
    Smartphone,
    Palette,
    PenTool,
    Zap,
    Eye,
    Heart,
    Target,
    Users,
    Award,
    CheckCircle2,
    Star,
    Layers,
    Figma,
    Layout,
    MousePointer,
    Sparkles,
    TrendingUp,
    Clock,
    Shield,
    Globe,
    Code,
    Search,
    BarChart
} from "lucide-react";

export default function UIUX() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("web");

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

    const mainServices = [
        {
            title: "Website UI/UX",
            desc: "User-centric website designs that look great and convert visitors into customers.",
            icon: Monitor,
            features: ["Responsive Design", "User Research", "Wireframing"],
            color: "from-purple-500/20 to-blue-500/20"
        },
        {
            title: "Mobile App UI/UX",
            desc: "Seamless and intuitive mobile app interfaces for iOS and Android.",
            icon: Smartphone,
            features: ["Native Design", "Touch Interfaces", "User Testing"],
            color: "from-blue-500/20 to-purple-500/20"
        },
        {
            title: "Branding & Logo",
            desc: "Create a memorable brand identity with professional logo design and branding guidelines.",
            icon: Palette,
            features: ["Logo Design", "Brand Guidelines", "Visual Identity"],
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Prototyping",
            desc: "Interactive prototypes to visualize and test your product before development.",
            icon: PenTool,
            features: ["Clickable Prototypes", "User Flows", "Interaction Design"],
            color: "from-pink-500/20 to-purple-500/20"
        }
    ];

    const designTools = [
        { name: "Figma", icon: Figma },
        { name: "Adobe XD", icon: Layers },
        { name: "Sketch", icon: PenTool },
        { name: "Photoshop", icon: Palette },
        { name: "Illustrator", icon: Sparkles },
        { name: "InVision", icon: Eye }
    ];

    const designProcess = [
        { number: "01", icon: Search, title: "Research", desc: "Understanding users and market" },
        { number: "02", icon: Layout, title: "Wireframe", desc: "Creating structure and flow" },
        { number: "03", icon: Palette, title: "Design", desc: "Crafting beautiful interfaces" },
        { number: "04", icon: MousePointer, title: "Prototype", desc: "Building interactive mockups" },
        { number: "05", icon: Award, title: "Deliver", desc: "Launching pixel-perfect designs" }
    ];

    const designPrinciples = [
        { icon: Users, title: "User-Centered", desc: "Designs that put users first" },
        { icon: Eye, title: "Visual Hierarchy", desc: "Clear information architecture" },
        { icon: Zap, title: "Fast & Responsive", desc: "Optimized for all devices" },
        { icon: Heart, title: "Emotional Design", desc: "Creating delightful experiences" },
        { icon: Target, title: "Goal-Oriented", desc: "Focused on conversions" },
        { icon: Shield, title: "Accessible", desc: "Inclusive design for everyone" }
    ];

    const stats = [
        { value: "200+", label: "Designs Created", icon: Palette },
        { value: "95%", label: "Client Satisfaction", icon: Heart },
        { value: "50+", label: "Brands Designed", icon: Award },
        { value: "100%", label: "Pixel Perfect", icon: Eye }
    ];

    const portfolio = [
        {
            title: "E-commerce Dashboard",
            category: "Web UI/UX",
            color: "from-purple-500/30 to-blue-500/30"
        },
        {
            title: "Fitness Mobile App",
            category: "Mobile App UI",
            color: "from-blue-500/30 to-green-500/30"
        },
        {
            title: "SaaS Landing Page",
            category: "Website Design",
            color: "from-pink-500/30 to-purple-500/30"
        },
        {
            title: "Finance App",
            category: "App Interface",
            color: "from-green-500/30 to-blue-500/30"
        }
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
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(168,85,247,0.3); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(168,85,247,0.6); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgba(168,85,247,0.2);
            box-shadow: 0 0 0 0 rgba(168,85,247,0.4);
          }
          50% { 
            border-color: rgba(168,85,247,0.6);
            box-shadow: 0 0 20px 5px rgba(168,85,247,0.2);
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
          background: linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        
        .text-shadow-glow {
          text-shadow: 0 0 30px rgba(168,85,247,0.6), 0 0 60px rgba(168,85,247,0.4), 0 0 90px rgba(168,85,247,0.2);
        }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(168,85,247,0.25);
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
                        className="absolute top-0 right-0 w-[700px] h-[700px] bg-purple-500/10 blur-[140px] rounded-full animate-float"
                        style={{
                            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
                            animationDelay: '0s'
                        }}
                    ></div>
                    <div
                        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-float"
                        style={{
                            animationDelay: '3s',
                            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
                        }}
                    ></div>
                    <div
                        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-pink-500/5 blur-[100px] rounded-full animate-float"
                        style={{
                            animationDelay: '1.5s',
                            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
                        }}
                    ></div>
                </div>

                {/* Animated Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-purple-500 font-bold tracking-widest uppercase text-xs md:text-sm bg-purple-500/10 px-6 py-2 rounded-full border border-purple-500/30 hover:bg-purple-500/20 hover:scale-110 hover:border-purple-500/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Creative Design Solutions
                            </span>
                        </div>

                        <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            BEAUTIFUL UI/UX
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                                DESIGN
                            </span>
                            <br />THAT CONVERTS
                        </h1>

                        <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            We design intuitive, engaging, and beautiful user experiences. From wireframes to polished interfaces, we bring your vision to life with designs that users love.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
                            <button className="group relative px-8 py-6 bg-purple-600 text-white rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    Start Design Project
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                            <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-500 hover-lift relative overflow-hidden">
                                <span className="relative z-10">View Portfolio</span>
                                <div className="absolute inset-0 bg-purple-500/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.9s' }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} className="space-y-1 group cursor-default hover-lift">
                                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 animate-glow">
                                        <stat.icon size={28} className="text-purple-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-purple-500 group-hover:scale-125 transition-all duration-500 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
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

            {/* Main Services Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Design Services We Offer</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Comprehensive design solutions to create stunning user experiences that drive engagement
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mainServices.map((service, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-purple-500/60 transition-all duration-700 card-3d hover-lift relative overflow-hidden"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.15}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/15 group-hover:to-purple-500/10 transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow`}>
                                        <service.icon size={32} className="group-hover:animate-pulse" style={{ animationDuration: '1s' }} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-500 transition-colors duration-500">
                                        {service.title}
                                    </h3>
                                    <p className="text-[#888] mb-4 leading-relaxed group-hover:text-[#aaa] transition-colors duration-500">
                                        {service.desc}
                                    </p>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                                                <CheckCircle2 size={16} className="text-purple-500 mr-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-6 flex items-center text-purple-500 font-semibold group-hover:gap-3 transition-all duration-300">
                                        Learn More <ArrowRight size={18} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Tools Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Design Tools</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Powered by Industry Tools
                        </h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            We use the best design tools to create stunning, professional interfaces
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {designTools.map((tool, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-700 hover-lift text-center cursor-default animate-pulse-border"
                            >
                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center text-purple-500 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000 animate-glow">
                                    <tool.icon size={28} />
                                </div>
                                <h3 className="text-white font-medium group-hover:text-purple-500 transition-colors duration-500">
                                    {tool.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Process Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(219,39,119,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Process</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            From Idea to Reality
                        </h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            A proven 5-step design process that transforms your vision into beautiful experiences
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {designProcess.map((step, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-purple-500/60 transition-all duration-700 hover-lift animate-pulse-border">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="text-5xl font-black text-purple-500/20 group-hover:text-purple-500/80 group-hover:scale-125 transition-all duration-700 animate-scale-pulse" style={{ animationDelay: `${idx * 0.2}s` }}>
                                            {step.number}
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center text-purple-500 group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-1000 animate-glow">
                                            <step.icon size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {idx < 4 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-transparent group-hover:w-10 group-hover:h-1 transition-all duration-500 animate-pulse"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Principles Section */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Design Principles</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">What Drives Our Design</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Core principles that guide every design decision we make
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {designPrinciples.map((principle, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-700 hover-lift cursor-default animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.1}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center text-purple-500 mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                                    <principle.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                    {principle.title}
                                </h3>
                                <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {principle.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Preview Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Portfolio</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Featured Design Work</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            A glimpse of our creative solutions that helped brands stand out
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        {portfolio.map((project, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-700 hover-lift overflow-hidden cursor-pointer animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.15}s`,
                                    opacity: 0
                                }}
                            >
                                <div className={`h-64 bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                                            <Eye size={48} className="text-white/70" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                        {project.title}
                                    </h3>
                                    <p className="text-[#888] text-sm group-hover:text-[#aaa] transition-colors duration-500">
                                        {project.category}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button className="group px-8 py-4 bg-purple-600 text-white rounded-full font-bold hover-lift animate-glow">
                            <span className="flex items-center justify-center">
                                View Full Portfolio
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 lg:py-32 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">What Clients Say</h2>
                        <p className="text-[#888] text-lg">Real feedback from clients who loved our design work</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                name: "Ayesha Rahman",
                                role: "Founder, Beauty Brand",
                                text: "The branding and UI design completely transformed our business. Our customers love the new look and our sales have doubled!",
                                rating: 5
                            },
                            {
                                name: "Usman Ali",
                                role: "Product Manager",
                                text: "Elvion's design team created an intuitive interface that our users find delightful. The attention to detail is phenomenal.",
                                rating: 5
                            },
                            {
                                name: "Zara Khan",
                                role: "CEO, Tech Startup",
                                text: "From wireframes to final designs, the entire process was smooth. They truly understand user psychology and modern design trends.",
                                rating: 5
                            },
                            {
                                name: "Hassan Malik",
                                role: "E-commerce Owner",
                                text: "Our conversion rate increased by 85% after the redesign. The team knows how to create designs that actually convert visitors.",
                                rating: 5
                            }
                        ].map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-700 hover-lift animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.2}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="text-purple-500 fill-purple-500 group-hover:scale-125 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                                    ))}
                                </div>
                                <p className="text-[#888] leading-relaxed mb-6 group-hover:text-[#aaa] transition-colors duration-500">
                                    &quot;{testimonial.text}&quot;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 animate-glow">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-purple-500 transition-colors duration-500">{testimonial.name}</div>
                                        <div className="text-sm text-[#888]">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Our Design Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl p-8 md:p-12 border border-white/10 hover:border-purple-500/30 transition-all duration-500">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow">Why Choose Us</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                    Design That Makes a Difference
                                </h2>
                                <p className="text-[#888] text-lg leading-relaxed">
                                    We don&apos;t just create pretty interfaces—we design experiences that solve problems, engage users, and drive business results. Every pixel serves a purpose.
                                </p>

                                <div className="space-y-3 pt-4">
                                    {[
                                        "User research and data-driven design decisions",
                                        "Modern, on-trend visual aesthetics",
                                        "Mobile-first responsive design approach",
                                        "Accessibility standards compliance (WCAG)",
                                        "Fast turnaround with unlimited revisions",
                                        "Complete design system and documentation"
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group cursor-default">
                                            <CheckCircle2 size={20} className="text-purple-500 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                                            <span className="text-[#888] group-hover:text-white transition-colors duration-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default animate-pulse-border">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700"></div>
                                    <div className="relative z-10 text-center space-y-6 p-8">
                                        <div className="w-32 h-32 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                            <Palette size={64} className="text-purple-500 animate-pulse" style={{ animationDuration: '2s' }} />
                                        </div>
                                        <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-300">
                                            &quot;Design is not just what it looks like and feels like. Design is how it works.&quot;
                                        </p>
                                        <p className="text-purple-500 font-bold">— Steve Jobs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Design Packages Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Design Packages</h2>
                        <p className="text-[#888] text-lg">Flexible pricing for every project size</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Basic",
                                price: "PKR 40,000",
                                features: ["Logo Design", "Brand Colors", "3 Revisions", "Source Files", "2 Week Delivery"],
                                popular: false
                            },
                            {
                                name: "Professional",
                                price: "PKR 100,000",
                                features: ["Full Website UI/UX", "Mobile Responsive", "Prototype", "Design System", "Unlimited Revisions", "4 Week Delivery"],
                                popular: true
                            },
                            {
                                name: "Premium",
                                price: "Custom",
                                features: ["Complete Branding", "Web + Mobile App UI", "Motion Design", "User Testing", "Priority Support", "Dedicated Designer"],
                                popular: false
                            }
                        ].map((plan, idx) => (
                            <div
                                key={idx}
                                className={`group bg-[#111] p-8 rounded-2xl border transition-all duration-700 hover-lift cursor-default relative overflow-hidden ${plan.popular
                                        ? 'border-purple-500/60 scale-105'
                                        : 'border-white/10 hover:border-purple-500/40'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                        POPULAR
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                        {plan.name}
                                    </h3>
                                    <div className="text-4xl font-black text-purple-500 mb-1">
                                        {plan.price}
                                    </div>
                                    {plan.price !== "Custom" && (
                                        <div className="text-sm text-[#888]">Starting from</div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                            <CheckCircle2 size={16} className="text-purple-500 mr-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-3 rounded-full font-bold transition-all duration-500 ${plan.popular
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 hover-lift'
                                        : 'bg-white/5 text-white hover:bg-purple-600 hover:text-white hover-lift'
                                    }`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-[#888] mt-8">
                        * Custom packages available for enterprise clients. Contact us for details.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-purple-500 font-bold tracking-wider uppercase text-sm animate-glow inline-block">FAQ</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Common Questions</h2>
                        <p className="text-[#888] text-lg">Everything you need to know about our design services</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "What design tools do you use?",
                                a: "We primarily use Figma for UI/UX design, Adobe Creative Suite for branding, and various prototyping tools to create interactive mockups."
                            },
                            {
                                q: "How long does a typical design project take?",
                                a: "Timeline varies based on scope. Logo design takes 1-2 weeks, website UI/UX takes 3-6 weeks, and full branding projects take 4-8 weeks."
                            },
                            {
                                q: "Do you provide revisions?",
                                a: "Yes! We offer multiple rounds of revisions to ensure you're 100% satisfied with the final design. Professional packages include unlimited revisions."
                            },
                            {
                                q: "Can you work with our existing brand?",
                                a: "Absolutely! We can design within your existing brand guidelines or help refresh and modernize your current branding."
                            },
                            {
                                q: "Do you provide design files?",
                                a: "Yes, you'll receive all source files including Figma files, design assets, and comprehensive design documentation."
                            },
                            {
                                q: "What's included in a design system?",
                                a: "Our design systems include typography, color palettes, component libraries, spacing guidelines, and complete documentation for developers."
                            }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-700 hover-lift cursor-pointer animate-pulse-border"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center text-purple-500 flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                            {faq.q}
                                        </h3>
                                        <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden animate-gradient">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
                        Ready for Exceptional Design?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Let&apos;s create something beautiful together. Get a free design consultation today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="group bg-white text-purple-600 hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
                            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                Start Your Design Project
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                        </button>
                        <button className="group bg-transparent text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold border-2 border-white hover:border-white transition-all duration-500 hover-lift">
                            <span className="relative z-10">View Our Work</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Final Contact Info */}
            <section className="py-16 bg-[#0a0a0a] border-t border-white/5">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            {
                                icon: Palette,
                                title: "Design Studio",
                                desc: "Lahore, Punjab, Pakistan"
                            },
                            {
                                icon: Users,
                                title: "Schedule a Call",
                                desc: "+92 XXX XXXXXXX"
                            },
                            {
                                icon: Heart,
                                title: "Get in Touch",
                                desc: "team@elvionsolutions.com"
                            }
                        ].map((contact, idx) => (
                            <div key={idx} className="group cursor-default">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                    <contact.icon size={28} className="text-purple-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-500 transition-colors duration-500">
                                    {contact.title}
                                </h3>
                                <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {contact.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}