"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, Heart, TrendingUp, ExternalLink } from "lucide-react";

const portfolioData: Record<string, {
    title: string;
    category: string;
    tags: string[];
    description: string;
    intro: string;
    details: string[];
    color: string;
    accentColor: string;
    stats: { views: string; likes: string; conversion: string };
    images: string[];
}> = {
    "ecommerce-platform": {
        title: "Modern E-commerce Platform",
        category: "E-commerce",
        tags: ["E-commerce", "Web Design", "UI/UX"],
        description: "Complete online shopping experience with seamless checkout",
        intro: "A full-featured e-commerce platform built for modern online retailers. We designed and developed an intuitive shopping experience that drives conversions and builds customer loyalty.",
        details: [
            "Custom product catalog with advanced filtering and search",
            "Seamless multi-step checkout with multiple payment gateways",
            "Real-time inventory management and order tracking",
            "Mobile-first responsive design optimized for all devices",
            "Admin dashboard with sales analytics and reporting",
            "SEO-optimized product pages for maximum visibility",
        ],
        color: "from-[#00d28d]/20 to-[#4a90e2]/20",
        accentColor: "#00d28d",
        stats: { views: "25K", likes: "2.5K", conversion: "+150%" },
        images: [
            "/portfolios/Ecommerce Portfolios/Ecommerce 01.png",
            "/portfolios/Ecommerce Portfolios/Ecommerce 02.png",
            "/portfolios/Ecommerce Portfolios/Ecommerce 03.png",
        ],
    },
    "fitness-mobile-app": {
        title: "Fitness Mobile App",
        category: "Mobile App",
        tags: ["Mobile App", "UI/UX", "Health"],
        description: "Interactive fitness tracking with personalized workouts",
        intro: "A comprehensive fitness companion app designed to motivate users and track their health journey. From personalized workout plans to nutrition tracking, this app covers every aspect of a healthy lifestyle.",
        details: [
            "Personalized workout plans based on user fitness goals",
            "Real-time activity tracking with progress visualization",
            "Nutrition logging and calorie counter",
            "Social features to connect with workout partners",
            "Integration with wearable health devices",
            "Push notifications for workout reminders and milestones",
        ],
        color: "from-purple-500/20 to-pink-500/20",
        accentColor: "#a855f7",
        stats: { views: "18K", likes: "1.8K", conversion: "+85%" },
        images: [
            "/portfolios/Fitness Mobile App Portfolios/Fitness App 01.png",
            "/portfolios/Fitness Mobile App Portfolios/Fitness App 02.png",
            "/portfolios/Fitness Mobile App Portfolios/Fitness App 003.png",
        ],
    },
    "tech-startup-branding": {
        title: "Tech Startup Branding",
        category: "Branding",
        tags: ["Branding", "Logo Design", "Identity"],
        description: "Complete brand identity and visual guidelines",
        intro: "A complete brand identity system crafted for a disruptive tech startup. We built a distinctive visual language that communicates innovation, trust, and forward-thinking values across all touchpoints.",
        details: [
            "Logo design with multiple variations and usage guidelines",
            "Comprehensive brand color palette and typography system",
            "Business card, letterhead, and stationery design",
            "Social media templates and digital asset library",
            "Brand voice and messaging framework",
            "Complete brand guidelines documentation",
        ],
        color: "from-blue-500/20 to-green-500/20",
        accentColor: "#3b82f6",
        stats: { views: "12K", likes: "1.2K", conversion: "+200%" },
        images: [
            "/portfolios/Tech Startup/Tech 01.png",
            "/portfolios/Tech Startup/Tech 02.png",
            "/portfolios/Tech Startup/Tech 03.png",
            "/portfolios/Tech Startup/Tech 04.png",
        ],
    },
    "saas-dashboard": {
        title: "SaaS Dashboard Design",
        category: "Web Design",
        tags: ["Web Design", "Dashboard", "Analytics"],
        description: "Intuitive analytics platform for data visualization",
        intro: "A sophisticated SaaS analytics dashboard that transforms complex data into clear, actionable insights. Designed with user experience at the forefront, the platform empowers businesses to make data-driven decisions effortlessly.",
        details: [
            "Interactive data visualizations with real-time updates",
            "Customizable widget-based dashboard layout",
            "Multi-tenant architecture with role-based access control",
            "Advanced filtering, segmentation, and reporting tools",
            "Responsive design optimized for desktop and tablet",
            "Dark mode support and accessibility compliance",
        ],
        color: "from-[#4a90e2]/20 to-[#00d28d]/20",
        accentColor: "#4a90e2",
        stats: { views: "30K", likes: "3.2K", conversion: "+120%" },
        images: [
            "/portfolios/SAAS/SAAS 01.png",
            "/portfolios/SAAS/SAAS 02.png",
            "/portfolios/SAAS/SAAS 03.png",
        ],
    },
    "restaurant-booking-app": {
        title: "Restaurant Booking App",
        category: "Mobile App",
        tags: ["Mobile App", "Food Tech", "Booking"],
        description: "Seamless table reservation and menu browsing",
        intro: "A beautifully crafted restaurant booking app that bridges the gap between diners and their favorite restaurants. The app offers a smooth reservation experience alongside rich menu browsing and personalized recommendations.",
        details: [
            "Real-time table availability and instant booking confirmation",
            "Interactive digital menu with high-quality food photography",
            "Personalized restaurant recommendations based on preferences",
            "Order ahead feature for dine-in and takeaway",
            "Review and rating system for restaurants",
            "Loyalty program integration with reward points",
        ],
        color: "from-orange-500/20 to-red-500/20",
        accentColor: "#f97316",
        stats: { views: "22K", likes: "2.1K", conversion: "+95%" },
        images: [
            "/portfolios/Restaurant App/Restaurant 01.png",
            "/portfolios/Restaurant App/Restaurant 02.png",
        ],
    },
    "fashion-brand-website": {
        title: "Fashion Brand Website",
        category: "Web Design",
        tags: ["Web Design", "E-commerce", "Fashion"],
        description: "Luxury fashion brand with stunning visuals",
        intro: "An immersive online presence for a luxury fashion brand that balances aesthetic elegance with seamless e-commerce functionality. Every detail was crafted to reflect the brand's premium positioning and captivate its discerning audience.",
        details: [
            "Editorial-style landing pages with cinematic visuals",
            "Lookbook and collection showcase with smooth animations",
            "Size guide, wishlist, and virtual try-on features",
            "Integrated e-commerce with secure checkout",
            "Instagram feed integration for live social content",
            "VIP membership and exclusive offer management",
        ],
        color: "from-pink-500/20 to-purple-500/20",
        accentColor: "#ec4899",
        stats: { views: "28K", likes: "2.8K", conversion: "+175%" },
        images: [
            "/portfolios/Fashion Brand/Fashion 01.png",
            "/portfolios/Fashion Brand/Fashion 02.png",
            "/portfolios/Fashion Brand/Fashion 03.png",
        ],
    },
    "real-estate-portal": {
        title: "Real Estate Portal",
        category: "Web Design",
        tags: ["Web Design", "Real Estate", "Search"],
        description: "Property search platform with advanced filters",
        intro: "A powerful real estate portal designed to simplify property discovery and connect buyers, sellers, and agents. Advanced search capabilities and rich property listings make finding the perfect home effortless.",
        details: [
            "Advanced property search with map-based browsing",
            "Detailed listing pages with virtual tours and floor plans",
            "Agent profiles and direct contact integration",
            "Mortgage calculator and affordability tools",
            "Saved searches and property alert notifications",
            "Admin panel for listing management and analytics",
        ],
        color: "from-[#00d28d]/20 to-blue-500/20",
        accentColor: "#00d28d",
        stats: { views: "20K", likes: "1.9K", conversion: "+110%" },
        images: [
            "/portfolios/Real Estate/Real Estate 01.png",
            "/portfolios/Real Estate/Real Estate 02.png",
        ],
    },
    "fintech-app": {
        title: "Fintech App Interface",
        category: "Mobile App",
        tags: ["Mobile App", "Finance", "Banking"],
        description: "Modern banking app with intuitive money management",
        intro: "A next-generation fintech app that reimagines personal banking with a clean, intuitive interface. Designed to make financial management accessible and transparent for everyday users.",
        details: [
            "Unified dashboard for all accounts, cards, and investments",
            "Instant money transfers and bill payment",
            "Smart spending analytics with budget tracking",
            "Biometric authentication for secure login",
            "Real-time transaction notifications and alerts",
            "In-app customer support with live chat",
        ],
        color: "from-blue-500/20 to-purple-500/20",
        accentColor: "#4a90e2",
        stats: { views: "35K", likes: "3.5K", conversion: "+140%" },
        images: [
            "/portfolios/Fintech/Fintech 01.png",
        ],
    },
    "coffee-shop-branding": {
        title: "Coffee Shop Branding",
        category: "Branding",
        tags: ["Branding", "Packaging", "Identity"],
        description: "Warm and inviting brand identity for local café",
        intro: "A warm, artisanal brand identity created for a local coffee shop that wanted to stand out in a crowded market. The design captures the cozy, community-driven spirit of the café and translates it into every brand touchpoint.",
        details: [
            "Hand-crafted logo design with artisan aesthetic",
            "Warm color palette and custom typography selection",
            "Packaging design for cups, bags, and merchandise",
            "Menu design for in-store and digital displays",
            "Social media visual identity and content templates",
            "Interior signage and environmental design concepts",
        ],
        color: "from-amber-500/20 to-orange-500/20",
        accentColor: "#f59e0b",
        stats: { views: "15K", likes: "1.5K", conversion: "+160%" },
        images: [
            "/portfolios/Coffee Shop/Coffee 01.png",
            "/portfolios/Coffee Shop/Coffee 02.png",
        ],
    },
};

export default function PortfolioDetail() {
    const params = useParams();
    const slug = params.slug as string;
    const project = portfolioData[slug];

    const [selectedImage, setSelectedImage] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 0);
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    if (!project) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                    <Link href="/portfolio" className="text-[#00d28d] hover:underline flex items-center gap-2 justify-center">
                        <ArrowLeft size={20} /> Back to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            <style jsx global>{`
                @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                @keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .animate-gradient { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
                .animate-float { animation: float 8s ease-in-out infinite; }
                .animate-glow { animation: glow 3s ease-in-out infinite; }
                .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div
                        className={`absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] rounded-full animate-float`}
                        style={{
                            background: `${project.accentColor}20`,
                            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                        }}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4a90e2]/10 blur-[100px] rounded-full animate-float"
                        style={{ animationDelay: "2s" }}
                    />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <Link
                        href="/portfolio"
                        className={`inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors duration-300 mb-8 group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Portfolio
                    </Link>

                    <div className={`space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "0.1s" }}>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className="text-sm font-bold px-4 py-1.5 rounded-full border animate-glow"
                                style={{ color: project.accentColor, background: `${project.accentColor}15`, borderColor: `${project.accentColor}40` }}
                            >
                                {project.category}
                            </span>
                            {project.tags.map((tag, i) => (
                                <span key={i} className="text-xs text-[#888] px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            {project.title}
                        </h1>

                        <p className="text-[#888] text-lg md:text-xl max-w-3xl leading-relaxed">
                            {project.intro}
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="text-center">
                                <div className="flex items-center gap-2 text-[#888] text-sm mb-1">
                                    <Eye size={14} /> Views
                                </div>
                                <div className="text-2xl font-bold" style={{ color: project.accentColor }}>{project.stats.views}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 text-[#888] text-sm mb-1">
                                    <Heart size={14} /> Likes
                                </div>
                                <div className="text-2xl font-bold" style={{ color: project.accentColor }}>{project.stats.likes}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 text-[#888] text-sm mb-1">
                                    <TrendingUp size={14} /> Growth
                                </div>
                                <div className="text-2xl font-bold" style={{ color: project.accentColor }}>{project.stats.conversion}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image + Thumbnails */}
            <section className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Main Image */}
                    <div
                        className={`relative rounded-2xl overflow-hidden border border-white/10 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                        style={{ transitionDelay: "0.2s" }}
                    >
                        <div className={`w-full bg-gradient-to-br ${project.color} min-h-[300px] md:min-h-[500px] flex items-center justify-center`}>
                            <img
                                src={project.images[selectedImage]}
                                alt={`${project.title} - Image ${selectedImage + 1}`}
                                className="w-full h-full object-contain max-h-[600px]"
                            />
                        </div>
                        {project.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev - 1 + project.images.length) % project.images.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev + 1) % project.images.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                >
                                    <ArrowRight size={18} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {project.images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === selectedImage ? "w-6" : "bg-white/40 hover:bg-white/70"}`}
                                            style={i === selectedImage ? { background: project.accentColor } : {}}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    {project.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {project.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`flex-shrink-0 w-32 h-20 md:w-40 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 hover-lift ${i === selectedImage ? "scale-105" : "border-white/10 opacity-60 hover:opacity-100"}`}
                                    style={i === selectedImage ? { borderColor: project.accentColor } : {}}
                                >
                                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Project Details */}
            <section className="py-16 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="font-bold tracking-wider uppercase text-sm animate-glow" style={{ color: project.accentColor }}>
                                Project Details
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6">What We Delivered</h2>
                            <ul className="space-y-4">
                                {project.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-3 group">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: `${project.accentColor}20`, color: project.accentColor }}
                                        >
                                            <span className="text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <span className="text-[#888] group-hover:text-white transition-colors duration-300 leading-relaxed">
                                            {detail}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#111] rounded-2xl p-8 border border-white/10 hover:border-opacity-60 transition-all duration-500"
                                style={{ "--tw-border-opacity": "0.6" } as React.CSSProperties}>
                                <h3 className="text-xl font-bold text-white mb-6">Project Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[#888]">Category</span>
                                        <span className="font-bold text-white">{project.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[#888]">Total Images</span>
                                        <span className="font-bold text-white">{project.images.length} Screens</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                                        <span className="text-[#888]">Views</span>
                                        <span className="font-bold" style={{ color: project.accentColor }}>{project.stats.views}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-[#888]">Growth</span>
                                        <span className="font-bold" style={{ color: project.accentColor }}>{project.stats.conversion}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/contact" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-lg text-white hover:opacity-90 transition-all duration-300 hover-lift animate-glow"
                                style={{ background: `linear-gradient(135deg, ${project.accentColor}, #4a90e2)` }}>
                                Start a Similar Project <ExternalLink size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Images Gallery */}
            {project.images.length > 1 && (
                <section className="py-16 bg-[#0a0a0a]">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="font-bold tracking-wider uppercase text-sm animate-glow" style={{ color: project.accentColor }}>Gallery</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">All Project Images</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {project.images.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`rounded-2xl overflow-hidden border border-white/10 hover-lift cursor-pointer group transition-all duration-500`}
                                    style={{
                                        animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                        animationDelay: `${i * 0.15}s`,
                                        opacity: 0,
                                    }}
                                >
                                    <div className={`bg-gradient-to-br ${project.color} relative`}>
                                        <img
                                            src={img}
                                            alt={`${project.title} - Screen ${i + 1}`}
                                            className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2">
                                                <Eye size={16} /> View Full
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#111]">
                                        <p className="text-[#888] text-sm">Screen {i + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 animate-gradient" style={{ background: `linear-gradient(135deg, ${project.accentColor}, #4a90e2)` }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Like What You See?</h2>
                    <p className="text-white/90 text-xl mb-8">Let&apos;s build something amazing together for your brand.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact" className="bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-4 rounded-full text-lg font-bold hover-lift inline-flex items-center gap-2">
                            Start Your Project <ArrowRight size={20} />
                        </Link>
                        <Link href="/portfolio" className="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-bold hover-lift inline-flex items-center gap-2">
                            <ArrowLeft size={20} /> More Projects
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
