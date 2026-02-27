"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Code,
    Palette,
    TrendingUp,
    Users,
    Award,
    CheckCircle2,
    Clock,
    Briefcase,
    GraduationCap,
    Lightbulb,
    Rocket
} from "lucide-react";

export default function Internship() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

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

    const positions = [
        {
            title: "Web Development Intern",
            icon: Code,
            duration: "3-6 Months",
            type: "Full-time/Part-time",
            skills: ["React", "Next.js", "Tailwind CSS"],
            color: "from-[#00d28d]/20 to-[#4a90e2]/20"
        },
        {
            title: "UI/UX Design Intern",
            icon: Palette,
            duration: "3-6 Months",
            type: "Full-time/Part-time",
            skills: ["Figma", "Adobe XD", "Prototyping"],
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Digital Marketing Intern",
            icon: TrendingUp,
            duration: "3-6 Months",
            type: "Full-time/Part-time",
            skills: ["SEO", "Social Media", "Analytics"],
            color: "from-blue-500/20 to-green-500/20"
        }
    ];

    const benefits = [
        { icon: GraduationCap, title: "Learn & Grow", desc: "Hands-on experience with real projects" },
        { icon: Users, title: "Mentorship", desc: "Guidance from industry experts" },
        { icon: Award, title: "Certificate", desc: "Completion certificate upon finishing" },
        { icon: Rocket, title: "Career Growth", desc: "Potential full-time opportunities" }
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
                </div>

                {/* Animated Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.12)_1px,transparent_1px)] bg-[size:50px_50px]" style={{ animation: 'pulse 6s ease-in-out infinite' }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Join Our Team
                            </span>
                        </div>

                        <h1 className={`text-5xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            KICKSTART YOUR
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                                CAREER
                            </span>
                            <br />WITH US
                        </h1>

                        <p className={`text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            Join Elvion Solutions and gain real-world experience in web development, design, and digital marketing. Learn from experts and work on exciting projects.
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.7s' }}>
                            <Link href="/inernshipform">
                                <button className="group relative px-8 py-6 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base overflow-hidden hover-lift animate-glow">
                                    <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                        Apply Now
                                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                                </button>
                            </Link>
                            <button className="group px-8 py-6 bg-transparent text-white rounded-full font-bold text-base border-2 border-white/20 hover:border-[#00d28d] hover:bg-[#00d28d]/10 transition-all duration-500 hover-lift relative overflow-hidden">
                                <span className="relative z-10">Learn More</span>
                                <div className="absolute inset-0 bg-[#00d28d]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Positions Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a] relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Open Positions</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Internship Opportunities</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            Choose the role that matches your passion and start your journey with us
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {positions.map((position, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-[#00d28d]/60 transition-all duration-700 card-3d hover-lift relative overflow-hidden"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.15}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/0 via-[#00d28d]/0 to-[#00d28d]/0 group-hover:from-[#00d28d]/10 group-hover:via-[#00d28d]/15 group-hover:to-[#00d28d]/10 transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${position.color} rounded-xl flex items-center justify-center text-[#00d28d] mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow`}>
                                        <position.icon size={32} className="group-hover:animate-pulse" style={{ animationDuration: '1s' }} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#00d28d] transition-colors duration-500">
                                        {position.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-[#888]">
                                            <Clock size={16} className="mr-2 text-[#00d28d]" />
                                            {position.duration}
                                        </div>
                                        <div className="flex items-center text-sm text-[#888]">
                                            <Briefcase size={16} className="mr-2 text-[#00d28d]" />
                                            {position.type}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-xs text-[#888] mb-2">Required Skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {position.skills.map((skill, i) => (
                                                <span key={i} className="text-xs px-3 py-1 bg-[#0a0a0a] text-[#888] rounded-full border border-white/5 group-hover:border-[#00d28d]/30 group-hover:text-[#00d28d] transition-all duration-300">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <Link href="/inernshipform">
                                        <button className="w-full py-3 bg-transparent border-2 border-white/10 hover:border-[#00d28d] hover:bg-[#00d28d] hover:text-[#0a0a0a] text-white rounded-full font-bold transition-all duration-500 flex items-center justify-center gap-2">
                                            Apply Now
                                        </button>
                                    </Link>
                                </div>

                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d28d]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow inline-block">Why Join Us</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Internship Benefits</h2>
                        <p className="text-[#888] text-lg max-w-2xl mx-auto">
                            More than just an internship—it&apos;s a launchpad for your career
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="group bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-[#00d28d]/60 transition-all duration-700 hover-lift cursor-default animate-pulse-border text-center"
                                style={{
                                    animation: `slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                    animationDelay: `${idx * 0.1}s`,
                                    opacity: 0
                                }}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00d28d]/30 to-[#4a90e2]/30 rounded-xl flex items-center justify-center text-[#00d28d] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 animate-glow">
                                    <benefit.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d28d] transition-colors duration-500">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You'll Learn Section */}
            <section className="py-20 bg-gradient-to-b from-[#111]/50 to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-3xl p-8 md:p-12 border border-white/10 hover:border-[#00d28d]/30 transition-all duration-500">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="text-[#00d28d] font-bold tracking-wider uppercase text-sm animate-glow">What You&apos;ll Learn</span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                    Gain Real-World Experience
                                </h2>
                                <p className="text-[#888] text-lg leading-relaxed">
                                    Work on live projects, collaborate with our talented team, and build a portfolio that stands out. We provide the guidance and support you need to excel.
                                </p>

                                <div className="space-y-3 pt-4">
                                    {[
                                        "Work on real client projects",
                                        "Learn industry best practices",
                                        "Receive personalized mentorship",
                                        "Build your professional portfolio",
                                        "Network with industry professionals",
                                        "Get certificate upon completion"
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group cursor-default">
                                            <CheckCircle2 size={20} className="text-[#00d28d] flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                                            <span className="text-[#888] group-hover:text-white transition-colors duration-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden group hover-lift cursor-default animate-pulse-border">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00d28d]/10 via-transparent to-[#4a90e2]/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700"></div>
                                    <div className="relative z-10 text-center space-y-6 p-8">
                                        <div className="w-32 h-32 mx-auto bg-[#00d28d]/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-glow">
                                            <Lightbulb size={64} className="text-[#00d28d] animate-pulse" style={{ animationDuration: '2s' }} />
                                        </div>
                                        <p className="text-white/70 text-lg italic group-hover:text-white transition-colors duration-300">
                                        &quot;The best way to learn is by doing. Join us and transform your passion into expertise.&quot;
                                        </p>
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
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 hover:scale-110 transition-transform duration-500 cursor-default">
                        Ready to Begin Your Journey?
                    </h2>
                    <p className="text-white/90 text-xl mb-8">
                        Apply now and take the first step towards an exciting career in tech
                    </p>
                    <Link href="/inernshipform">
                        <button className="group bg-white text-[#0a0a0a] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-bold hover-lift relative overflow-hidden animate-glow">
                            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                Submit Your Application
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}