"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight, Layers, CheckCircle2, Zap, Palette, Image, Star, Globe, Award, Users, Clock, Heart, Target, Code, Camera, Smartphone, Rocket
} from "lucide-react";
import { Button } from "@/components/Button";

export const PorfolioWebsite = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 0);
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => { clearTimeout(timer); window.removeEventListener("mousemove", handleMouseMove); };
    }, []);

    const features = [
        { icon: Palette, title: "Creative Layouts", desc: "Unique designs that showcase your work beautifully" },
        { icon: Image, title: "Image Galleries", desc: "Stunning galleries with lightbox effects" },
        { icon: Layers, title: "Case Studies", desc: "Detailed project showcases with results" },
        { icon: Smartphone, title: "Mobile Perfect", desc: "Flawless display on all devices" },
        { icon: Star, title: "Impressive UI", desc: "Eye-catching interfaces that wow visitors" },
        { icon: Zap, title: "Fast Performance", desc: "Quick loading for better user experience" }
    ];

    const portfolioTypes = [
        { title: "Creative Portfolio", desc: "For designers, artists, and creative professionals", icon: Palette },
        { title: "Photography Portfolio", desc: "Showcase your stunning photography work", icon: Camera },
        { title: "Agency Portfolio", desc: "Display your agency's best projects", icon: Users },
        { title: "Developer Portfolio", desc: "Show your coding and development skills", icon: Code }
    ];

    const stats = [
        { value: "150+", label: "Portfolios Created", icon: Globe },
        { value: "99%", label: "Client Satisfaction", icon: Heart },
        { value: "30+", label: "Active Projects", icon: Rocket },
        { value: "24/7", label: "Support Available", icon: Clock }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            <style jsx global>{`
                @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                @keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .animate-gradient { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-glow { animation: glow 2s ease-in-out infinite; }
                .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,210,141,0.2); }
            `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d28d]/10 blur-[120px] rounded-full animate-float" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4a90e2]/10 blur-[100px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center space-y-6">
                        <span className="text-[#00d28d] font-bold tracking-widest uppercase text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/20 inline-block animate-glow">
                            Creative Portfolio Websites
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            Portfolio Website<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient">Design</span>
                        </h1>
                        <p className="text-[#888] text-lg md:text-xl max-w-3xl mx-auto">
                            Showcase your work with elegant, creative portfolios designed to impress potential clients and leave a lasting impression.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Link href="/contact"><Button className="px-8 py-6 bg-[#00d28d] hover:bg-[#00b377] text-[#0a0a0a] rounded-full font-bold animate-glow">Start Your Portfolio <ArrowRight size={20} className="ml-2" /></Button></Link>
                            <Button className="px-8 py-6 bg-transparent text-white border-2 border-white/20 hover:border-[#00d28d] rounded-full font-bold">View Examples</Button>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 pt-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center animate-glow">
                                        <stat.icon size={28} className="text-[#00d28d]" />
                                    </div>
                                    <div className="text-3xl font-bold text-[#00d28d]">{stat.value}</div>
                                    <div className="text-sm text-[#888]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Make Your Work Shine</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all hover-lift">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] mb-4 animate-glow">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-[#888]">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Types */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Portfolio Types</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Perfect for Every Professional</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {portfolioTypes.map((type, idx) => (
                            <div key={idx} className="bg-[#111] p-8 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all hover-lift">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] flex-shrink-0 animate-glow">
                                        <type.icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{type.title}</h3>
                                        <p className="text-[#888]">{type.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] animate-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Showcase Your Work?</h2>
                    <p className="text-white/90 text-xl mb-8">Create a stunning portfolio that gets you hired</p>
                    <Link href="/contact"><Button className="bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold">Get Started Today <ArrowRight size={20} className="ml-2" /></Button></Link>
                </div>
            </section>
        </div>
    );
};

export default PorfolioWebsite;
