"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Globe,
    Smartphone,
    Palette,
    Code,
    ShoppingCart,
    Briefcase,
    Eye,
    ExternalLink,
    CheckCircle2,
    Star,
    Zap,
    Target,
    Award,
    TrendingUp,
    Heart,
    Filter,
    Search
} from "lucide-react";

export default function Portfolio() {
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [hoveredProject, setHoveredProject] = useState<number | null>(null);

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

    const filters = [
        { id: "all", label: "All Projects", icon: Globe },
        { id: "web", label: "Web Design", icon: Code },
        { id: "mobile", label: "Mobile Apps", icon: Smartphone },
        { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
        { id: "branding", label: "Branding", icon: Palette }
    ];

    const projects = [
        {
            id: 1,
            title: "Modern E-commerce Platform",
            category: "ecommerce",
            tags: ["E-commerce", "Web Design", "UI/UX"],
            description: "Complete online shopping experience with seamless checkout",
            color: "from-[#00d28d]/30 to-[#4a90e2]/30",
            stats: { views: "25K", likes: "2.5K", conversion: "+150%" }
        },
        {
            id: 2,
            title: "Fitness Mobile App",
            category: "mobile",
            tags: ["Mobile App", "UI/UX", "Health"],
            description: "Interactive fitness tracking with personalized workouts",
            color: "from-purple-500/30 to-pink-500/30",
            stats: { views: "18K", likes: "1.8K", conversion: "+85%" }
        },
        {
            id: 3,
            title: "Tech Startup Branding",
            category: "branding",
            tags: ["Branding", "Logo Design", "Identity"],
            description: "Complete brand identity and visual guidelines",
            color: "from-blue-500/30 to-green-500/30",
            stats: { views: "12K", likes: "1.2K", conversion: "+200%" }
        },
        {
            id: 4,
            title: "SaaS Dashboard Design",
            category: "web",
            tags: ["Web Design", "Dashboard", "Analytics"],
            description: "Intuitive analytics platform for data visualization",
            color: "from-[#4a90e2]/30 to-[#00d28d]/30",
            stats: { views: "30K", likes: "3.2K", conversion: "+120%" }
        },
        {
            id: 5,
            title: "Restaurant Booking App",
            category: "mobile",
            tags: ["Mobile App", "Food Tech", "Booking"],
            description: "Seamless table reservation and menu browsing",
            color: "from-orange-500/30 to-red-500/30",
            stats: { views: "22K", likes: "2.1K", conversion: "+95%" }
        },
        {
            id: 6,
            title: "Fashion Brand Website",
            category: "web",
            tags: ["Web Design", "E-commerce", "Fashion"],
            description: "Luxury fashion brand with stunning visuals",
            color: "from-pink-500/30 to-purple-500/30",
            stats: { views: "28K", likes: "2.8K", conversion: "+175%" }
        },
        {
            id: 7,
            title: "Real Estate Portal",
            category: "web",
            tags: ["Web Design", "Real Estate", "Search"],
            description: "Property search platform with advanced filters",
            color: "from-[#00d28d]/30 to-blue-500/30",
            stats: { views: "20K", likes: "1.9K", conversion: "+110%" }
        },
        {
            id: 8,
            title: "Fintech App Interface",
            category: "mobile",
            tags: ["Mobile App", "Finance", "Banking"],
            description: "Modern banking app with intuitive money management",
            color: "from-blue-500/30 to-purple-500/30",
            stats: { views: "35K", likes: "3.5K", conversion: "+140%" }
        },
        {
            id: 9,
            title: "Coffee Shop Branding",
            category: "branding",
            tags: ["Branding", "Packaging", "Identity"],
            description: "Warm and inviting brand identity for local café",
            color: "from-amber-500/30 to-orange-500/30",
            stats: { views: "15K", likes: "1.5K", conversion: "+160%" }
        }
    ];

    const filteredProjects = activeFilter === "all"
        ? projects
        : projects.filter(p => p.category === activeFilter);

    const stats = [
        { value: "150+", label: "Projects Completed", icon: Briefcase },
        { value: "98%", label: "Client Satisfaction", icon: Heart },
        { value: "50+", label: "Happy Clients", icon: Award },
        { value: "5+", label: "Years Experience", icon: Star }
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
          transform: perspective(1000px) rotateY(5deg) rotateX(5deg);
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
                </div>

                {/* Animated Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Our Best Work
                            </span>
                        </div>

                        <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            SHOWCASING OUR
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                                PORTFOLIO
                            </span>
                        </h1>

                        <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            Showcasing our best work in Web Development, Mobile Apps, Branding, and Digital Design. Each project represents our commitment to excellence.
                        </p>

                        {/* Stats */}
                        <div className={`flex flex-wrap justify-center gap-8 pt-12 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
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

            {/* Filter Section */}
            <section className="py-12 bg-[#0a0a0a] sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`group flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeFilter === filter.id
                                        ? "bg-[#00d28d] text-[#0a0a0a] scale-105"
                                        : "bg-[#111] text-white border border-white/10 hover:border-[#00d28d]/50 hover:bg-[#00d28d]/10"
                                    }`}
                            >
                                <filter.icon size={18} className={activeFilter === filter.id ? "" : "group-hover:scale-110 transition-transform"} />
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#111]/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project, idx) => (
                            <div
                                key={project.id}
                                className="group bg-[#111] rounded-2xl border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 overflow-hidden hover-lift card-3d cursor-pointer animate-pulse-border"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.1}s`,
                                    opacity: 0
                                }}
                                onMouseEnter={() => setHoveredProject(project.id)}
                                onMouseLeave={() => setHoveredProject(null)}
                            >
                                {/* Project Image/Preview */}
                                <div className={`relative h-64 bg-gradient-to-br ${project.color} overflow-hidden`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-700 ${hoveredProject === project.id ? 'scale-125 rotate-12' : ''
                                            }`}>
                                            <Eye size={48} className="text-white/70" />
                                        </div>
                                    </div>

                                    {/* Overlay on Hover */}
                                    <div className={`absolute inset-0 bg-[#00d28d]/90 flex items-center justify-center transition-opacity duration-500 ${hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                        <div className="text-center space-y-4">
                                            <button 
                                                onClick={() => router.push(`/portfolio#project-${project.id}`)}
                                                className="px-6 py-3 bg-white text-[#00d28d] rounded-full font-bold hover:scale-110 transition-transform duration-300 flex items-center gap-2 mx-auto"
                                            >
                                                View Case Study <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="absolute top-4 right-4 bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#00d28d] border border-[#00d28d]/30">
                                        {project.tags[0]}
                                    </div>
                                </div>

                                {/* Project Info */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag, i) => (
                                            <span key={i} className="text-xs px-3 py-1 bg-[#0a0a0a] text-[#888] rounded-full border border-white/5 group-hover:border-[#00d28d]/30 group-hover:text-[#00d28d] transition-all duration-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4 text-xs text-[#888]">
                                            <span className="flex items-center gap-1">
                                                <Eye size={14} /> {project.stats.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart size={14} /> {project.stats.likes}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-[#00d28d]">
                                            {project.stats.conversion}
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <button className="w-full py-3 bg-transparent border-2 border-white/10 hover:border-[#00d28d] hover:bg-[#00d28d]/10 text-white rounded-full font-bold transition-all duration-500 flex items-center justify-center gap-2 group/btn">
                                        <span>View Case Study</span>
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20">
                            <Search size={64} className="text-[#888] mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
                            <p className="text-[#888]">Try selecting a different category</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] relative overflow-hidden animate-gradient">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
                        Ready to Start Your Project?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Let&apos;s create something amazing together. Get a free consultation today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
                            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                Start Your Project
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                        </button>
                        <button className="group bg-transparent text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-bold border-2 border-white hover:border-white transition-all duration-500 hover-lift">
                            <span className="relative z-10">Contact Us</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Process Teaser */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Want to Work With Us?</h2>
                        <p className="text-[#888] text-lg">Here&apos;s how we bring your vision to life</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: "Discovery", desc: "Understanding your goals" },
                            { icon: Palette, title: "Design", desc: "Creating stunning visuals" },
                            { icon: Code, title: "Development", desc: "Building with precision" },
                            { icon: Zap, title: "Launch", desc: "Delivering excellence" }
                        ].map((step, idx) => (
                            <div key={idx} className="group text-center p-6 bg-[#111] rounded-2xl border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift cursor-default animate-pulse-border">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                                    <step.icon size={28} className="text-[#00d28d]" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}