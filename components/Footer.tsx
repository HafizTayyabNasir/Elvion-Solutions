"use client";
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-elvion-card border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <Link href="/" className="inline-flex items-center mb-4">
                        <Image
                            src="/logo.webp"
                            alt="Elvion Logo"
                            width={1920}
                            height={720}
                            className="h-10 w-auto"
                        />
                    </Link>
                    <p className="text-elvion-gray text-sm mb-4">
                        {t("footer.description")}
                    </p>
                    <div className="flex gap-4">
                        <a 
                            href="https://web.facebook.com/ElvionSolutions/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our Facebook page"
                        >
                            <Facebook className="text-white hover:text-elvion-primary cursor-pointer transition-colors" size={20} />
                        </a>
                        <a 
                            href="https://www.instagram.com/elvionsolutions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our Instagram page"
                        >
                            <Instagram className="text-white hover:text-elvion-primary cursor-pointer transition-colors" size={20} />
                        </a>
                        <a 
                            href="https://www.linkedin.com/company/elvionsolutions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our LinkedIn page"
                        >
                            <Linkedin className="text-white hover:text-elvion-primary cursor-pointer transition-colors" size={20} />
                        </a>
                        <a 
                            href="https://x.com/elvionsolutions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our X (Twitter) page"
                        >
                            <Twitter className="text-white hover:text-elvion-primary cursor-pointer transition-colors" size={20} />
                        </a>
                        <a 
                            href="https://www.youtube.com/@elvionsolutions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our YouTube channel"
                        >
                            <Youtube className="text-white hover:text-elvion-primary cursor-pointer transition-colors" size={20} />
                        </a>
                        <a 
                            href="https://www.tiktok.com/@elvionsolutions" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Visit our TikTok page"
                        >
                            <svg 
                                className="text-white hover:text-elvion-primary cursor-pointer transition-colors" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.7 2.89 2.89 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4">{t("footer.quickLinks")}</h3>
                    <ul className="space-y-2 text-sm text-elvion-gray">
                        <li><Link href="/about" className="hover:text-elvion-primary">{t("footer.aboutUs")}</Link></li>
                        <li><Link href="/portfolio" className="hover:text-elvion-primary">{t("footer.portfolio")}</Link></li>
                        <li><Link href="/blog" className="hover:text-elvion-primary">Blog</Link></li>
                        <li><Link href="/contact" className="hover:text-elvion-primary">{t("footer.contactUs")}</Link></li>
                        <li><Link href="/appointment" className="hover:text-elvion-primary">{t("footer.bookConsultation")}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4">{t("footer.services")}</h3>
                    <ul className="space-y-2 text-sm text-elvion-gray">
                        <li><Link href="/services/business-web" className="hover:text-elvion-primary">{t("footer.webDevelopment")}</Link></li>
                        <li><Link href="/services/seo" className="hover:text-elvion-primary">{t("footer.seoContent")}</Link></li>
                        <li><Link href="/services/ads" className="hover:text-elvion-primary">{t("footer.performanceAds")}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-semibold mb-4">{t("footer.contact")}</h3>
                    <div className="space-y-3 text-sm text-elvion-gray">
                        <p className="flex items-center gap-2"><Mail size={16} className="text-elvion-primary" /> team@elvionsolutions.com</p>
                        <p className="flex items-center gap-2"><Phone size={16} className="text-elvion-primary" /> +92 326 5942996</p>
                        <p className="flex items-center gap-2">🌐 www.elvionsolutions.com</p>
                    </div>
                </div>
            </div>
            {/* SEO Footer Content */}
            <div className="max-w-7xl mx-auto px-4 pb-8 border-t border-white/5 pt-8 mb-6">
                <p className="text-[#555] text-xs leading-relaxed text-center max-w-4xl mx-auto">
                    <strong className="text-[#888]">Elvion Solutions</strong> — Best <strong className="text-[#888]">Digital Marketing Agency in Lahore</strong>, Pakistan. We are a leading <strong className="text-[#888]">top digital marketing company in Pakistan</strong> offering comprehensive <strong className="text-[#888]">digital marketing services in Lahore</strong> including SEO, Social Media Marketing, Google Ads, Web Development, and Content Marketing. As the <strong className="text-[#888]">best social media marketing agency in Lahore for small business</strong>, we provide <strong className="text-[#888]">affordable social media management services in Pakistan</strong> and professional <strong className="text-[#888]">social media marketing services in Lahore for brands</strong>. Our <strong className="text-[#888]">social media growth services in Pakistan</strong> help businesses across Lahore, Karachi, Islamabad, and beyond grow their online presence. Trust the <strong className="text-[#888]">online marketing agency in Pakistan</strong> that 350+ businesses rely on.
                </p>
            </div>
            <div className="text-center text-elvion-gray text-xs border-t border-white/5 pt-8">
                {t("footer.copyright")}
            </div>
        </footer>
    );
};
