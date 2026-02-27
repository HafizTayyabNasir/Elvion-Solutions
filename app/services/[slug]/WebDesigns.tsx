"use client";
import { useState, useEffect } from "react";
import {
    ArrowRight,
    Code,
    Layout,
    ShoppingCart,
    Database,
    Layers,
    Zap,
    Globe,
    Smartphone,
    CheckCircle2,
    Target,
    Award,
    TrendingUp,
    Users,
    Rocket,
    PenTool,
    BarChart,
    Star,
    Clock,
    Shield,
    Heart,
    Palette,
    Server,
    Settings,
    Monitor,
    Search,
    Lock,
    Cloud,
    Briefcase
} from "lucide-react";

export default function WebDesigns() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [activeService, setActiveService] = useState(0);

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
            title: "Business Website Design",
            desc: "Professional websites that establish your brand authority and connect with your target audience.",
            icon: Layout,
            features: ["Responsive Design", "SEO Optimized", "Fast Loading"],
            color: "from-[#00d28d]/20 to-[#4a90e2]/20"
        },
        {
            title: "Portfolio Website Design",
            desc: "Showcase your work with elegant, creative portfolios designed to impress potential clients.",
            icon: Layers,
            features: ["Creative Layouts", "Image Galleries", "Case Studies"],
            color: "from-[#4a90e2]/20 to-[#00d28d]/20"
        },
        {
            title: "E-commerce Development",
            desc: "Robust online stores with seamless payment integration and superior user experience.",
            icon: ShoppingCart,
            features: ["Payment Gateway", "Inventory System", "Order Tracking"],
            color: "from-[#00d28d]/20 to-[#4a90e2]/20"
        },
        {
            title: "Custom Web App",
            desc: "Tailor-made web applications to solve unique business challenges and streamline operations.",
            icon: Code,
            features: ["Custom Features", "Scalable Architecture", "API Integration"],
            color: "from-[#4a90e2]/20 to-[#00d28d]/20"
        },
        {
            title: "Full-Stack Solutions",
            desc: "End-to-end development using cutting-edge technologies for scalable and secure solutions.",
            icon: Database,
            features: ["Frontend & Backend", "Database Design", "Cloud Deployment"],
            color: "from-[#00d28d]/20 to-[#4a90e2]/20"
        },
        {
            title: "Landing Page Design",
            desc: "High-converting landing pages optimized for maximum engagement and conversions.",
            icon: Target,
            features: ["Conversion Focused", "A/B Testing", "Analytics Integration"],
            color: "from-[#4a90e2]/20 to-[#00d28d]/20"
        },
        {
            title: "Software as a Service (SaaS)",
            desc: "Scalable SaaS platforms designed for performance, security, and seamless user experiences.",
            icon: Cloud,
            features: ["Multi-Tenant Architecture", "Subscription Billing", "Role-Based Access"],
            color: "from-[#00d28d]/20 to-[#4a90e2]/20"
        },
        {
            title: "ERP Systems",
            desc: "Integrated ERP solutions to manage business processes, data, and operations efficiently.",
            icon: Briefcase,
            features: ["Process Automation", "Centralized Data", "Custom Modules"], 
            color: "from-[#4a90e2]/20 to-[#00d28d]/20"
        }

    ];

    const technologies = [
        { name: "Next.js", icon: Code },
        { name: "React", icon: Layers },
        { name: "FastAPI", icon: Server },
        { name: "Tailwind CSS", icon: Palette },
        { name: "TypeScript", icon: Settings },
        { name: "PostgreSQL", icon: Database }
    ];

    const designProcess = [
        { number: "01", icon: Target, title: "Discovery", desc: "Understanding your goals and requirements" },
        { number: "02", icon: PenTool, title: "Design", desc: "Creating stunning visuals designs" },
        { number: "03", icon: Code, title: "Development", desc: "Building with cutting-edge tech" },
        { number: "04", icon: Search, title: "Testing", desc: "Ensuring flawless performance" },
        { number: "05", icon: Rocket, title: "Launch", desc: "Deploying your success" }
    ];

    const benefits = [
        { icon: Zap, title: "Lightning Fast", desc: "Optimized for peak performance" },
        { icon: Shield, title: "Secure & Safe", desc: "Industry-standard security measures" },
        { icon: Smartphone, title: "Mobile First", desc: "Perfect on every device" },
        { icon: TrendingUp, title: "SEO Ready", desc: "Built to rank on Google" },
        { icon: Lock, title: "SSL Certified", desc: "Encrypted and protected" },
        { icon: Award, title: "Award Winning", desc: "Recognized design excellence" }
    ];

    const stats = [
        { value: "300+", label: "Websites Delivered", icon: Globe },
        { value: "99%", label: "Client Satisfaction", icon: Heart },
        { value: "50+", label: "Active Projects", icon: Rocket },
        { value: "24/7", label: "Support Available", icon: Clock }
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
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(0,210,141,0.3); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(0,210,141,0.6); }
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
            border-color: rgba(0,210,141,0.2);
            box-shadow: 0 0 0 0 rgba(0,210,141,0.4);
          }
          50% { 
            border-color: rgba(0,210,141,0.6);
            box-shadow: 0 0 20px 5px rgba(0,210,141,0.2);
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
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Professional Web Development Services
                            </span>
                        </div>

                        <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            STUNNING WEB
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                                DESIGNS
                            </span>
                            <br />THAT CONVERT
                        </h1>

                        <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            We craft stunning, high-performance websites that captivate your audience and drive business growth. From corporate sites to complex web applications, we deliver excellence.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
                            <button className="group relative px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    Start Your Project
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                            <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                                <span className="relative z-10">View Portfolio</span>
                                <div className="absolute inset-0 bg-[#00d28d]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.9s' }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} className="space-y-1 group cursor-default hover-lift">
                                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center group-hover:scale-125 transition-all duration-500 animate-glow">
                                        <stat.icon size={28} className="text-[#00d28d]" />
                                    </div>
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

            {/* Main Services Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Web Development Solutions</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Comprehensive web solutions designed to elevate your online presence and drive measurable results
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mainServices.map((service, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 card-3d hover-lift relative overflow-hidden cursor-pointer"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.15}s`,
                                    opacity: 0
                                }}
                                onClick={() => setActiveService(idx)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/0 via-[#00d28d]/0 to-[#00d28d]/0 group-hover:from-[#00d28d]/10 group-hover:via-[#00d28d]/15 group-hover:to-[#00d28d]/10 transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-[#00d28d] mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow`}>
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
                                    <div className="mt-6 flex items-center text-[#00d28d] font-semibold group-hover:gap-3 transition-all duration-300">
                                        Learn More <ArrowRight size={18} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d28d]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4a90e2]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technologies Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,210,141,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Technologies</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Powered by Modern Tech
                        </h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            We use cutting-edge technologies to build fast, secure, and scalable web solutions
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {technologies.map((tech, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift text-center cursor-default animate-pulse-border"
                            >
                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000 animate-glow">
                                    <tech.icon size={28} />
                                </div>
                                <h3 className="text-white font-medium group-hover:text-[#00d28d] transition-colors duration-500">
                                    {tech.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(74,144,226,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Our Process</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            From Concept to Launch
                        </h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            A proven 5-step process that transforms your vision into a stunning reality
                        </p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {designProcess.map((step, idx) => (
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

            {/* Benefits Section */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Why Choose Us</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Built for Performance</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Every website we create is optimized for speed, security, and success
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift cursor-default animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.1}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                                    <benefit.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                                    {benefit.title}
                                </h3>
                                <p className="text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Work Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Portfolio</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                Creating Digital Masterpieces
                            </h2>
                            <p className="text-[#888] text-lg leading-relaxed">
                                Ready to elevate your online presence? At Elvion Solutions, we specialize in creating high-impact websites that cut through the digital noise and deliver real, measurable results.
                            </p>

                            <div className="space-y-3 pt-4">
                                {[
                                    "Custom-designed to match your brand",
                                    "Fully responsive across all devices",
                                    "SEO optimized for maximum visibility",
                                    "Lightning-fast loading speeds",
                                    "Secure and reliable hosting",
                                    "Ongoing support and maintenance"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group cursor-default">
                                        <CheckCircle2 size={20} className="text-[#00d28d] flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                                        <span className="text-[#888] group-hover:text-white transition-colors duration-300">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="group mt-6 px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base hover-lift relative overflow-hidden animate-glow">
                                <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    View Our Portfolio
                                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            </button>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default animate-pulse-border">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/10 via-transparent to-[#4a90e2]/10 group-hover:scale-125 group-hover:rotate-6 transition-all duration-1000"></div>
                                <div className="relative z-10 text-center space-y-4 p-8">
                                    <div className="w-32 h-32 mx-auto bg-[#00d28d]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000 animate-glow">
                                        <Monitor size={64} className="text-[#00d28d] animate-pulse" style={{ animationDuration: '2s' }} />
                                    </div>
                                    <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-500">
                                        &quot;Great web design without functionality is like a sports car with no engine.&quot;
                                    </p>
                                    <p className="text-[#00d28d] font-bold">— Paul Cookson</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 lg:py-32 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">What Our Clients Say</h2>
                        <p className="text-[#888] text-lg">Real feedback from satisfied clients who trusted us with their digital presence</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                name: "Ahmed Hassan",
                                role: "CEO, Tech Startup",
                                text: "Elvion delivered a stunning website that perfectly captures our brand. The attention to detail and performance optimization is outstanding!",
                                rating: 5
                            },
                            {
                                name: "Sarah Khan",
                                role: "Owner, Fashion Boutique",
                                text: "Our e-commerce site has exceeded all expectations. Sales are up 150% since launch. Highly recommend their services!",
                                rating: 5
                            },
                            {
                                name: "Ali Raza",
                                role: "Marketing Director",
                                text: "Professional, responsive, and delivered ahead of schedule. The website is fast, beautiful, and converts visitors into customers.",
                                rating: 5
                            },
                            {
                                name: "Fatima Malik",
                                role: "Creative Agency",
                                text: "Working with Elvion was a breeze. They understood our vision and brought it to life with incredible design and functionality.",
                                rating: 5
                            }
                        ].map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.2}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="text-[#00d28d] fill-[#00d28d] group-hover:scale-125 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                                    ))}
                                </div>
                                <p className="text-[#888] leading-relaxed mb-6 group-hover:text-[#aaa] transition-colors duration-500">
                                    &quot;{testimonial.text}&quot;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00d28d] to-[#4a90e2] rounded-full flex items-center justify-center text-white font-bold group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 animate-glow">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-[#00d28d] transition-colors duration-500">{testimonial.name}</div>
                                        <div className="text-sm text-[#888]">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">FAQ</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
                        <p className="text-[#888] text-lg">Everything you need to know about our web design services</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How long does it take to build a website?",
                                a: "Typical projects take 2-6 weeks depending on complexity. We provide detailed timelines during our initial consultation."
                            },
                            {
                                q: "Do you provide hosting and domain services?",
                                a: "Yes! We offer complete hosting solutions with SSL certificates, regular backups, and 24/7 monitoring."
                            },
                            {
                                q: "Will my website be mobile-friendly?",
                                a: "Absolutely! All our websites are fully responsive and optimized for mobile, tablet, and desktop devices."
                            },
                            {
                                q: "Can you help with SEO and digital marketing?",
                                a: "Yes, we offer comprehensive SEO services and digital marketing strategies to help your website rank higher and attract more visitors."
                            },
                            {
                                q: "What if I need changes after launch?",
                                a: "We provide ongoing support and maintenance. Minor updates are included, and we're always available for larger modifications."
                            },
                            {
                                q: "Do you work with existing websites?",
                                a: "Yes! We can redesign, optimize, or migrate your existing website to modern technologies for better performance."
                            }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift cursor-pointer animate-pulse-border"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-lg flex items-center justify-center text-[#00d28d] flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
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

            {/* Pricing Highlight Section */}
            <section className="py-20 bg-[#0a0a0a] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,210,141,0.08),transparent_50%)] animate-pulse" style={{ animationDuration: '5s' }}></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Transparent, Competitive Pricing</h2>
                        <p className="text-[#888] text-lg">Quality web solutions that fit your budget</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Starter",
                                price: "PKR 50,000",
                                features: ["5 Pages", "Responsive Design", "Basic SEO", "Contact Form", "1 Month Support"],
                                popular: false
                            },
                            {
                                name: "Professional",
                                price: "PKR 120,000",
                                features: ["10 Pages", "Custom Design", "Advanced SEO", "CMS Integration", "E-commerce Ready", "3 Months Support"],
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                features: ["Unlimited Pages", "Full Custom Development", "Advanced Features", "API Integration", "Dedicated Support", "Lifetime Updates"],
                                popular: false
                            }
                        ].map((plan, idx) => (
                            <div
                                key={idx}
                                className={`group bg-[#111] p-8 rounded-2xl border transition-all duration-700 hover-lift cursor-default relative overflow-hidden ${plan.popular
                                    ? 'border-[#00d28d]/60 scale-105'
                                    : 'border-white/10 hover:border-[#00d28d]/40'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-4 right-4 bg-[#00d28d] text-[#0a0a0a] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                        POPULAR
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                                        {plan.name}
                                    </h3>
                                    <div className="text-4xl font-black text-[#00d28d] mb-1">
                                        {plan.price}
                                    </div>
                                    {plan.price !== "Custom" && (
                                        <div className="text-sm text-[#888]">Starting from</div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm text-[#888] group-hover:text-white transition-all duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                            <CheckCircle2 size={16} className="text-[#00d28d] mr-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-3 rounded-full font-bold transition-all duration-500 ${plan.popular
                                    ? 'bg-[#00d28d] text-[#0a0a0a] hover:bg-[#00b377] hover-lift'
                                    : 'bg-white/5 text-white hover:bg-[#00d28d] hover:text-[#0a0a0a] hover-lift'
                                    }`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-[#888] mt-8">
                        * Prices may vary based on specific requirements. Contact us for a detailed quote.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] relative overflow-hidden animate-gradient">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
                        Ready to Build Your Dream Website?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Get a free consultation and discover how we can transform your online presence
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
                            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                Start Your Project Today
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-[#f0f0f0] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                        </button>
                        <button className="group bg-transparent text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold border-2 border-white hover:border-white transition-all duration-500 hover-lift">
                            <span className="relative z-10">Schedule a Call</span>
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
                                icon: Globe,
                                title: "Visit Our Office",
                                desc: "Lahore, Punjab, Pakistan"
                            },
                            {
                                icon: Users,
                                title: "Call Us Anytime",
                                desc: "+92 XXX XXXXXXX"
                            },
                            {
                                icon: Target,
                                title: "Email Us",
                                desc: "team@elvionsolutions.com"
                            }
                        ].map((contact, idx) => (
                            <div key={idx} className="group cursor-default">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                    <contact.icon size={28} className="text-[#00d28d]" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
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