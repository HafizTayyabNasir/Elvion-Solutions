"use client";
import { useState, useEffect } from "react";
import {
    ArrowRight,
    Upload,
    CheckCircle2,
    User,
    Mail,
    Briefcase,
    FileText,
    AlertCircle,
    X,
    Check
} from "lucide-react";

export default function InternshipForm() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [fileName, setFileName] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        personalEmail: "",
        universityEmail: "",
        fieldOfInterest: "",
        expectations: "",
        cv: null as File | null
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

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

    const fields = [
        "Performace Marketing",
        "Ecommerce",
        "SEO(Shopify/Wordpress)",
        "Ai Automations",
        "Content Creation",
        "Graphic Design",
        "Video Graphy & Editing",
        "Social Media Management",
        "SAS Web/App",
        "Web Development",
        "App Development",
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, cv: "File size should be less than 5MB" });
                return;
            }
            if (!file.name.match(/\.(doc|docx|pdf)$/i)) {
                setErrors({ ...errors, cv: "Only DOC, DOCX, and PDF files are allowed" });
                return;
            }
            setFileName(file.name);
            setFormData({ ...formData, cv: file });
            setErrors({ ...errors, cv: "" });
        }
    };

    const removeFile = () => {
        setFileName("");
        setFormData({ ...formData, cv: null });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.personalEmail.trim()) {
            newErrors.personalEmail = "Personal email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.personalEmail)) {
            newErrors.personalEmail = "Please enter a valid email";
        }

        // University email is optional, but if provided, must be valid
        if (formData.universityEmail.trim() && !/\S+@\S+\.\S+/.test(formData.universityEmail)) {
            newErrors.universityEmail = "Please enter a valid email";
        }

        if (!formData.fieldOfInterest) {
            newErrors.fieldOfInterest = "Please select a field of interest";
        }

        // Expectations is optional, no validation needed

        if (!formData.cv) {
            newErrors.cv = "Please upload your CV";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        try {
            // Create FormData to send file
            const formDataToSend = new FormData();
            formDataToSend.append("fullName", formData.fullName.trim());
            formDataToSend.append("personalEmail", formData.personalEmail.trim());
            formDataToSend.append("universityEmail", formData.universityEmail.trim() || "");
            formDataToSend.append("fieldOfInterest", formData.fieldOfInterest);
            formDataToSend.append("expectations", formData.expectations.trim() || "");
            
            if (formData.cv) {
                formDataToSend.append("cv", formData.cv);
            }

            // Use fetch directly instead of fetchAPI since we need FormData
            const token = localStorage.getItem("token");
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            // Don't set Content-Type for FormData - browser will set it with boundary

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
            const response = await fetch(`${API_URL}/internship`, {
                method: "POST",
                headers,
                body: formDataToSend,
            });

            if (!response.ok) {
                let message = "";
                try {
                    const data = await response.json();
                    message = data.message || data.error || "Failed to submit application";
                } catch {
                    message = "Failed to submit application. Please try again.";
                }
                throw new Error(message);
            }

            const result = await response.json();
            console.log("Application submitted:", result);

            setIsSubmitted(true);
            
            // Reset form after 3 seconds
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    fullName: "",
                    personalEmail: "",
                    universityEmail: "",
                    fieldOfInterest: "",
                    expectations: "",
                    cv: null
                });
                setFileName("");
            }, 3000);
        } catch (error: unknown) {
            console.error("Submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit application. Please try again.";
            setErrors({ ...errors, submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

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
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,210,141,0.2);
        }
      `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-12 overflow-hidden">
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

                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="text-center space-y-6">
                        <div className={`inline-block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.1s' }}>
                            <span className="text-[#00d28d] font-bold tracking-widest uppercase text-xs md:text-sm bg-[#00d28d]/10 px-6 py-2 rounded-full border border-[#00d28d]/30 hover:bg-[#00d28d]/20 hover:scale-110 hover:border-[#00d28d]/60 transition-all duration-500 cursor-default shimmer animate-pulse-border inline-block animate-glow">
                                Application Form
                            </span>
                        </div>

                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.3s' }}>
                            Internship Form
                        </h1>

                        <p className={`text-[#888] text-lg max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.5s' }}>
                            Fill this form for internship at Elvion Solutions
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 pb-20">
                <div className="max-w-3xl mx-auto px-4">
                    <form onSubmit={handleSubmit} className="bg-[#111] rounded-3xl p-8 md:p-12 border border-white/10 hover:border-[#00d28d]/30 transition-all duration-500 animate-slide-up">
                        {/* Full Name */}
                        <div className="mb-6">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <User size={18} className="text-[#00d28d]" />
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className={`w-full bg-[#0a0a0a] border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500`}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Personal Email */}
                        <div className="mb-6">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <Mail size={18} className="text-[#00d28d]" />
                                Personal Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.personalEmail}
                                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                                className={`w-full bg-[#0a0a0a] border ${errors.personalEmail ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500`}
                                placeholder="your.email@example.com"
                            />
                            {errors.personalEmail && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.personalEmail}
                                </p>
                            )}
                        </div>

                        {/* University Email */}
                        <div className="mb-6">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <Mail size={18} className="text-[#00d28d]" />
                                University Email
                            </label>
                            <input
                                type="email"
                                value={formData.universityEmail}
                                onChange={(e) => setFormData({ ...formData, universityEmail: e.target.value })}
                                className={`w-full bg-[#0a0a0a] border ${errors.universityEmail ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500`}
                                placeholder="your.name@uiversity.edu.pk"
                            />
                            {errors.universityEmail && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.universityEmail}
                                </p>
                            )}
                        </div>

                        {/* Field of Interest */}
                        <div className="mb-6">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <Briefcase size={18} className="text-[#00d28d]" />
                                Field of Interest <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.fieldOfInterest}
                                onChange={(e) => setFormData({ ...formData, fieldOfInterest: e.target.value })}
                                className={`w-full bg-[#0a0a0a] border ${errors.fieldOfInterest ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500`}
                            >
                                <option value="" className="bg-[#0a0a0a]">Select a field</option>
                                {fields.map((field) => (
                                    <option key={field} value={field} className="bg-[#0a0a0a]">{field}</option>
                                ))}
                            </select>
                            {errors.fieldOfInterest && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.fieldOfInterest}
                                </p>
                            )}
                        </div>

                        {/* Expectations */}
                        <div className="mb-6">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <FileText size={18} className="text-[#00d28d]" />
                                Why you select this Field? OR What are your expectations with this field?
                            </label>
                            <textarea
                                value={formData.expectations}
                                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                                rows={6}
                                className={`w-full bg-[#0a0a0a] border ${errors.expectations ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder:text-[#888] focus:outline-none focus:border-[#00d28d] focus:ring-2 focus:ring-[#00d28d]/20 transition-all duration-500 resize-none`}
                                placeholder="Share your passion, goals, and what you hope to learn during this internship..."
                            />
                            <div className="flex justify-end items-center mt-2">
                                <p className="text-[#888] text-sm">{formData.expectations.length} characters</p>
                            </div>
                        </div>

                        {/* CV Upload */}
                        <div className="mb-8">
                            <label className="block text-white font-bold mb-2 flex items-center gap-2">
                                <Upload size={18} className="text-[#00d28d]" />
                                Attach your CV <span className="text-red-500">*</span>
                            </label>

                            {!fileName ? (
                                <label className={`block w-full bg-[#0a0a0a] border-2 ${errors.cv ? 'border-red-500' : 'border-dashed border-white/20'} rounded-xl p-8 text-center cursor-pointer hover:border-[#00d28d] hover:bg-[#00d28d]/5 transition-all duration-500 group`}>
                                    <Upload size={48} className="mx-auto mb-4 text-[#888] group-hover:text-[#00d28d] transition-colors duration-300" />
                                    <p className="text-white font-medium mb-2">Click to upload or drag and drop</p>
                                    <p className="text-[#888] text-sm">DOC, DOCX, PDF (Max 5MB)</p>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".doc,.docx,.pdf"
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="bg-[#0a0a0a] border border-[#00d28d]/30 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#00d28d]/20 rounded-lg flex items-center justify-center">
                                            <FileText size={24} className="text-[#00d28d]" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{fileName}</p>
                                            <p className="text-[#888] text-sm">Ready to upload</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-500 transition-colors duration-300"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            {errors.cv && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.cv}
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-500 text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isSubmitted}
                            className={`group w-full relative px-8 py-6 rounded-full font-bold text-base overflow-hidden transition-all duration-500 ${isSubmitted
                                    ? 'bg-green-500 text-white'
                                    : isSubmitting
                                        ? 'bg-[#888] text-white cursor-not-allowed'
                                        : 'bg-[#00d28d] text-[#0a0a0a] hover-lift animate-glow'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                {isSubmitted ? (
                                    <>
                                        <Check size={20} className="mr-2" />
                                        Application Submitted Successfully!
                                    </>
                                ) : isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application
                                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                                    </>
                                )}
                            </span>
                            {!isSubmitting && !isSubmitted && (
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00d28d] via-[#00b377] to-[#00d28d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_100%] animate-gradient"></div>
                            )}
                        </button>

                        {/* Note */}
                        <p className="text-[#888] text-sm text-center mt-6">
                            <span className="text-red-500">*</span> Required fields. We&apos;ll review your application and get back to you within 3-5 business days.
                        </p>
                    </form>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mt-8">
                        {[
                            { icon: CheckCircle2, text: "Quick Response" },
                            { icon: CheckCircle2, text: "No Application Fee" },
                            { icon: CheckCircle2, text: "Equal Opportunity" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[#111] p-4 rounded-xl border border-white/5 flex items-center gap-3 hover:border-[#00d28d]/30 transition-all duration-500">
                                <item.icon size={20} className="text-[#00d28d] flex-shrink-0" />
                                <span className="text-white text-sm font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}