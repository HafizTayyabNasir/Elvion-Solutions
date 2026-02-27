"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Search, CheckCircle2, TrendingUp, Target, BarChart, Globe, Zap, Award, Users, Clock, Heart, Star, Rocket, Shield } from "lucide-react";
import { Button } from "@/components/Button";

export const SEO = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const features = [
        { icon: Search, title: "Keyword Research", desc: "Find high-value keywords your customers search" },
        { icon: Target, title: "On-Page SEO", desc: "Optimize content, meta tags, and structure" },
        { icon: Zap, title: "Technical SEO", desc: "Speed, mobile-friendliness, and crawlability" },
        { icon: TrendingUp, title: "Link Building", desc: "Quality backlinks from authoritative sites" },
        { icon: Globe, title: "Local SEO", desc: "Rank in local search and Google Maps" },
        { icon: BarChart, title: "Analytics & Reports", desc: "Track rankings and organic traffic growth" }
    ];

    const stats = [
        { value: "200+", label: "SEO Campaigns", icon: Rocket },
        { value: "3-6 Mo", label: "Average Results Time", icon: Clock },
        { value: "150%", label: "Avg Traffic Increase", icon: TrendingUp },
        { value: "95%", label: "Client Satisfaction", icon: Star }
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
                .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(74,144,226,0.2); }
            `}</style>

            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4a90e2]/10 blur-[120px] rounded-full animate-float" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00d28d]/10 blur-[100px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center space-y-6">
                        <span className="text-[#4a90e2] font-bold tracking-widest uppercase text-sm bg-[#4a90e2]/10 px-6 py-2 rounded-full border border-[#4a90e2]/20 inline-block animate-glow">Search Engine Optimization</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            SEO<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4a90e2] via-[#00d28d] to-[#4a90e2] animate-gradient">Optimization</span>
                        </h1>
                        <p className="text-[#888] text-lg md:text-xl max-w-3xl mx-auto">Improve your visibility on Google and drive organic traffic. Our SEO strategies are data-driven and results-oriented to grow your business.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Link href="/contact"><Button className="px-8 py-6 bg-[#4a90e2] hover:bg-[#3a80d2] text-white rounded-full font-bold animate-glow">Get Free SEO Audit <ArrowRight size={20} className="ml-2" /></Button></Link>
                            <Button className="px-8 py-6 bg-transparent text-white border-2 border-white/20 hover:border-[#4a90e2] rounded-full font-bold">View Case Studies</Button>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8 pt-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-[#4a90e2]/30 to-[#00d28d]/30 rounded-xl flex items-center justify-center animate-glow">
                                        <stat.icon size={28} className="text-[#4a90e2]" />
                                    </div>
                                    <div className="text-3xl font-bold text-[#4a90e2]">{stat.value}</div>
                                    <div className="text-sm text-[#888]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#4a90e2] font-bold tracking-wider uppercase text-sm animate-glow">Our SEO Services</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Comprehensive SEO Solutions</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#4a90e2]/60 transition-all hover-lift">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#4a90e2]/30 to-[#00d28d]/30 rounded-xl flex items-center justify-center text-[#4a90e2] mb-4 animate-glow">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-[#888]">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-[#4a90e2] to-[#00d28d] animate-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Rank Higher on Google?</h2>
                    <p className="text-white/90 text-xl mb-8">Get a free SEO audit and custom strategy</p>
                    <Link href="/contact"><Button className="bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold">Get SEO Audit <ArrowRight size={20} className="ml-2" /></Button></Link>
                </div>
            </section>
        </div>
    );
};

export default SEO;
