"use client";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        try {
            await fetchAPI("/messages/", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    date: new Date().toISOString().split('T')[0]
                }),
            });
            setStatus(t("contact.success"));
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                setStatus(error.message);
            } else {
                setStatus(t("contact.error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const contactCards = [
        {
            icon: <Mail size={22} />,
            label: t("contact.emailLabel"),
            value: "team@elvionsolutions.com",
            delay: "0.1s"
        },
        {
            icon: <Phone size={22} />,
            label: t("contact.phoneLabel"),
            value: "+92 326 5942996",
            delay: "0.25s"
        },
        {
            icon: <MapPin size={22} />,
            label: "Location",
            value: "Pakistan — Remote Worldwide",
            delay: "0.4s"
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
                    0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(0,210,141,0.3); }
                    50% { opacity: 1; box-shadow: 0 0 40px rgba(0,210,141,0.6); }
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
                    transform: perspective(1000px) rotateY(5deg) rotateX(4deg);
                }

                .contact-input {
                    width: 100%;
                    background: #0a0a0a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    color: white;
                    outline: none;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }

                .contact-input::placeholder {
                    color: rgba(255,255,255,0.3);
                }

                .contact-input:focus {
                    border-color: #00d28d;
                    box-shadow: 0 0 0 2px rgba(0,210,141,0.2);
                }
            `}</style>

            {/* ── Animated Background ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#00d28d]/10 blur-[140px] rounded-full animate-float"
                    style={{
                        transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
                        animationDelay: "0s"
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#4a90e2]/10 blur-[120px] rounded-full animate-float"
                    style={{
                        animationDelay: "3s",
                        transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#00d28d]/5 blur-[100px] rounded-full animate-float"
                    style={{
                        animationDelay: "1.5s",
                        transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
                    }}
                />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 bg-[linear-gradient(rgba(0,210,141,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,141,0.06)_1px,transparent_1px)] bg-[size:50px_50px]"
                    style={{ animation: "pulse 6s ease-in-out infinite" }}
                />
            </div>

            {/* ── Hero Section ── */}
            <section className="relative pt-36 pb-16 lg:pt-48 lg:pb-20 z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    {/* Badge */}
                    <div
                        className={`inline-block transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                        style={{ transitionDelay: "0.1s" }}
                    >
                        <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                            GET IN TOUCH
                        </span>
                    </div>

                    {/* H1 */}
                    <h1
                        className={`mt-6 text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                        style={{ transitionDelay: "0.3s" }}
                    >
                        {t("contact.title") || "Let's Build"}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d28d] via-[#4a90e2] to-[#00d28d] animate-gradient text-shadow-glow inline-block hover:scale-105 transition-transform duration-500">
                            Something Amazing
                        </span>{" "}
                        Together
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`mt-6 text-[#888] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                        style={{ transitionDelay: "0.5s" }}
                    >
                        {t("contact.description") || "Have a project in mind? We'd love to hear about it. Send us a message and we'll get back to you as soon as possible."}
                    </p>
                </div>
            </section>

            {/* ── Main Content: 2-col grid ── */}
            <section className="relative z-10 pb-32 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                    {/* ── LEFT: Contact Info Cards ── */}
                    <div className="space-y-6">
                        {contactCards.map((card, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-6 bg-[#111] rounded-2xl border border-white/5 hover:border-[#00d28d]/60 p-6 hover-lift card-3d cursor-default transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                                style={{ transitionDelay: card.delay }}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d28d]/20 to-[#4a90e2]/20 border border-[#00d28d]/20 text-[#00d28d] animate-glow">
                                    {card.icon}
                                </div>
                                {/* Text */}
                                <div>
                                    <p className="text-xs font-semibold tracking-widest uppercase text-[#00d28d]/70 mb-1">
                                        {card.label}
                                    </p>
                                    <p className="text-white font-semibold text-base">{card.value}</p>
                                </div>
                            </div>
                        ))}

                        {/* Decorative accent block */}
                        <div
                            className={`mt-8 rounded-2xl border border-[#00d28d]/10 bg-gradient-to-br from-[#00d28d]/5 to-[#4a90e2]/5 p-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                            style={{ transitionDelay: "0.55s" }}
                        >
                            <p className="text-[#888] text-sm leading-relaxed">
                                We typically respond within <span className="text-[#00d28d] font-semibold">24 hours</span>. For urgent inquiries, feel free to call us directly. Our team is available across all time zones to serve clients worldwide.
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT: Contact Form ── */}
                    <div
                        className={`bg-[#111] rounded-3xl border border-white/5 hover:border-[#00d28d]/30 p-8 md:p-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                        style={{ transitionDelay: "0.2s" }}
                    >
                        {/* Form title */}
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                {t("contact.formTitle") || "Send Us a Message"}
                            </h2>
                            {/* Gradient underline */}
                            <div className="mt-3 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#00d28d] to-[#4a90e2] animate-gradient" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div
                                className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                                style={{ transitionDelay: "0.35s" }}
                            >
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder={t("contact.namePlaceholder") || "Your Name"}
                                    className="contact-input"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div
                                className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                                style={{ transitionDelay: "0.45s" }}
                            >
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder={t("contact.emailPlaceholder") || "Your Email"}
                                    className="contact-input"
                                    required
                                />
                            </div>

                            {/* Subject */}
                            <div
                                className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                                style={{ transitionDelay: "0.55s" }}
                            >
                                <input
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Subject"
                                    className="contact-input"
                                />
                            </div>

                            {/* Message */}
                            <div
                                className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                                style={{ transitionDelay: "0.65s" }}
                            >
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder={t("contact.messagePlaceholder") || "Your Message"}
                                    className="contact-input resize-none"
                                    required
                                />
                            </div>

                            {/* Status message */}
                            {status && (
                                <p
                                    className={`text-center text-sm font-medium px-4 py-3 rounded-xl ${
                                        status.toLowerCase().includes("success") || status.toLowerCase().includes("sent") || status.toLowerCase().includes("received")
                                            ? "bg-[#00d28d]/10 text-[#00d28d] border border-[#00d28d]/30"
                                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                                    }`}
                                >
                                    {status}
                                </p>
                            )}

                            {/* Submit button */}
                            <div
                                className={`pt-2 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                                style={{ transitionDelay: "0.75s" }}
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full px-8 py-5 bg-[#00d28d] text-[#0a0a0a] rounded-full font-bold text-base overflow-hidden hover-lift animate-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                        {loading ? (t("contact.submitting") || "Sending…") : (t("contact.submitButton") || "Send Message")}
                                        {!loading && (
                                            <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient" />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </section>
        </div>
    );
}