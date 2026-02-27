"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Layout,
    CheckCircle2,
    Zap,
    Shield,
    Smartphone,
    TrendingUp,
    Globe,
    Award,
    Users,
    Clock,
    Star,
    Target,
    Code,
    Palette,
    Search,
    BarChart,
    Rocket,
    Heart
} from "lucide-react";
import { Button } from "@/components/Button";

export const BusinessWebsiteDesign = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 0);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const features = [
        { icon: Layout, title: "Professional Design", desc: "Custom layouts that reflect your brand identity" },
        { icon: Smartphone, title: "Mobile Responsive", desc: "Perfect experience on every device" },
        { icon: Search, title: "SEO Optimized", desc: "Built to rank on Google from day one" },
        { icon: Zap, title: "Fast Loading", desc: "Optimized for lightning-fast performance" },
        { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security measures" },
        { icon: TrendingUp, title: "Conversion Focused", desc: "Designed to turn visitors into customers" }
    ];

    const process = [
        { number: "01", icon: Target, title: "Discovery", desc: "Understanding your business goals" },
        { number: "02", icon: Palette, title: "Design", desc: "Creating stunning visual concepts" },
        { number: "03", icon: Code, title: "Development", desc: "Building with modern technologies" },
        { number: "04", icon: Search, title: "Optimization", desc: "SEO and performance tuning" },
        { number: "05", icon: Rocket, title: "Launch", desc: "Going live with full support" }
    ];

    const packages = [
        {
            name: "Starter",
            price: "PKR 60,000",
            features: ["5 Pages", "Responsive Design", "Basic SEO", "Contact Forms", "1 Month Support"],
            popular: false
        },
        {
            name: "Professional",
            price: "PKR 120,000",
            features: ["10 Pages", "Custom Design", "Advanced SEO", "CMS Integration", "Analytics Setup", "3 Months Support"],
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["Unlimited Pages", "Premium Design", "Full SEO Package", "Advanced Features", " Dedicated Support", "Lifetime Updates"],
            popular: false
        }
    ];

    const stats = [
        { value: "200+", label: "Business Sites Launched", icon: Globe },
        { value: "98%", label: "Client Satisfaction", icon: Heart },
        { value: "50+", label: "Active Projects", icon: Rocket },
        { value: "24/7", label: "Support Available", icon: Clock }
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
                .hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,210,141,0.2);
                }
            `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[#0a0a0a]">
                    <div
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d28d]/10 blur-[120px] rounded-full animate-float"
                        style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
                    ></div>
                    <div
                        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4a90e2]/10 blur-[100px] rounded-full animate-float"
                        style={{ animationDelay: '2s', transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)` }}
                    ></div>
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center space-y-6 animate-slide-up">
                        <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/20 hover:bg-[#00d28d]/20 transition-all duration-300 inline-block animate-glow">
                            Professional Business Websites
                        </span>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            Business Website
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient">
                                Design
                            </span>
                        </h1>

                        <p className="text-[#888] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            Establish a powerful online presence with a professional business website that reflects your brand identity, builds credibility, and drives real business results.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Link href="/contact">
                                <Button className="px-8 py-6 bg-[#00d28d] hover:bg-[#00b377] text-[#0a0a0a] rounded-full font-bold text-base animate-glow">
                                    Get Started Today <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Link>
                            <Button className="px-8 py-6 bg-transparent text-white border-2 border-white/20 hover:border-[#00d28d] rounded-full font-bold text-base">
                                View Portfolio
                            </Button>
                        </div>

                        {/* Stats */}
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

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Key Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Why Choose Our Business Websites</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-500 hover-lift">
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

            {/* Process Section */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Our Process</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">From Concept to Launch</h2>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {process.map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-[#00d28d]/60 transition-all duration-500 hover-lift">
                                    <div className="text-center space-y-4">
                                        <div className="text-5xl font-black text-[#00d28d]/20">{step.number}</div>
                                        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] animate-glow">
                                            <step.icon size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                                        <p className="text-sm text-[#888]">{step.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">Pricing</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">Transparent Pricing</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, idx) => (
                            <div key={idx} className={`bg-[#111] p-8 rounded-2xl border transition-all duration-500 hover-lift ${pkg.popular ? 'border-[#00d28d]/60 scale-105' : 'border-white/10 hover:border-[#00d28d]/40'}`}>
                                {pkg.popular && (
                                    <div className="text-center mb-4">
                                        <span className="bg-[#00d28d] text-[#0a0a0a] px-4 py-1 rounded-full text-xs font-bold">POPULAR</span>
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                                    <div className="text-4xl font-black text-[#00d28d]">{pkg.price}</div>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-sm text-[#888]">
                                            <CheckCircle2 size={16} className="text-[#00d28d] mr-2 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/contact">
                                    <Button className={`w-full ${pkg.popular ? 'bg-[#00d28d] text-[#0a0a0a]' : 'bg-white/5 text-white hover:bg-[#00d28d] hover:text-[#0a0a0a]'}`}>
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#00d28d] to-[#4a90e2] animate-gradient">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Build Your Business Website?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Get a free consultation and discover how we can transform your online presence
                    </p>
                    <Link href="/contact">
                        <Button className="bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold">
                            Get A Free Quote <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BusinessWebsiteDesign;
