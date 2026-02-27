"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
    { name: "About Us", href: "/about" },
    {
        name: "Web-Designs",
        href: "/services/web-designs",
        submenu: [
            { name: "Business Website Design", href: "/services/business-web" },
            { name: "Portfolio Website Design", href: "/services/portfolio-web" },
            { name: "E-commerce Development", href: "/services/ecommerce" },
            { name: "Custom Web App", href: "/services/custom-app" },
            { name: "Full-Stack Solutions", href: "/services/fullstack" },
        ],
    },
    {
        name: "Digital Marketing",
        href: "/services/digital-marketing",
        submenu: [
            { name: "SEO", href: "/services/seo" },
            { name: "Social Media Marketing", href: "/services/smm" },
            { name: "Google / Meta Ads", href: "/services/ads" },
            { name: "Content Marketing", href: "/services/content" },
            { name: "Analytics", href: "/services/analytics" },
        ],
    },
    {
        name: "UI/UX",
        href: "/services/ui-ux",
        submenu: [
            { name: "Website UI/UX", href: "/services/web-ui" },
            { name: "Mobile App UI/UX", href: "/services/app-ui" },
            { name: "Branding & Logo", href: "/services/branding" },
            { name: "Prototyping", href: "/services/prototyping" },
        ],
    },
    { name: "Portfolios", href: "/portfolio" },
    { name: "Internship", href: "/internship" },
];

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const getInitials = (email: string) => {
        return email.charAt(0).toUpperCase();
    };

    const getAvatarColor = (email: string) => {
        const colors = [
            "bg-[#00d28d]",
            "bg-[#4a90e2]",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-red-500",
        ];
        const index = email.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

    return (
        <nav className="fixed z-50 w-full border-b border-white/10 bg-elvion-dark/95 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <Link href="/" className="flex items-center gap-1 text-2xl font-bold text-white">
                        <Image
                            src="/logo.webp"
                            alt="Elvion Logo"
                            width={1920}
                            height={720}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden items-center space-x-6 lg:flex">
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="group relative"
                                onMouseEnter={() => setActiveDropdown(link.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                {link.submenu ? (
                                    <div className="flex items-center gap-1">
                                        {link.href ? (
                                            <Link href={link.href} className="flex items-center gap-1 py-2 text-sm font-medium text-gray-300 hover:text-elvion-primary">
                                                {link.name}
                                            </Link>
                                        ) : (
                                            <span className="flex cursor-default items-center gap-1 py-2 text-sm font-medium text-gray-300 hover:text-elvion-primary">
                                                {link.name}
                                            </span>
                                        )}
                                        <button className="text-gray-300 hover:text-elvion-primary">
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <Link href={link.href} className="text-sm font-medium text-gray-300 hover:text-elvion-primary">
                                        {link.name}
                                    </Link>
                                )}

                                {link.submenu && activeDropdown === link.name && (
                                    <div className="absolute top-full left-0 w-64 rounded-md border border-white/10 bg-elvion-card py-2 shadow-xl">
                                        {link.submenu.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className="block px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-elvion-primary hover:text-black"
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="hidden items-center gap-4 lg:flex">
                        <Link href="/contact">
                            <Button variant="outline" className="px-4 py-2 text-sm">Contact Us</Button>
                        </Link>
                        <Link href="/appointment">
                            <Button className="px-4 py-2 text-sm">Get Appointment</Button>
                        </Link>
                        {isAuthenticated && user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 text-sm font-semibold text-white hover:text-elvion-primary"
                                >
                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.email)} flex items-center justify-center text-white font-bold`}>
                                        {getInitials(user.email)}
                                    </div>
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-elvion-card border border-white/10 rounded-lg shadow-xl z-50">
                                        <div className="p-3 border-b border-white/10">
                                            <p className="text-white font-semibold text-sm">{user.name || user.email}</p>
                                            <p className="text-gray-400 text-xs">{user.email}</p>
                                        </div>
                                        {user.is_admin && (
                                            <Link
                                                href="/admin/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-elvion-primary hover:text-black transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm font-semibold text-white hover:text-elvion-primary">
                                Login
                            </Link>
                        )}
                    </div>

                    <div className="lg:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="h-screen overflow-y-auto border-b border-white/10 bg-elvion-card pb-4 lg:hidden">
                    {navLinks.map((link) => (
                        <div key={link.name} className="px-4 py-2">
                            {link.submenu ? (
                                <div>
                                    {link.href ? (
                                        <Link
                                            href={link.href}
                                            className="mb-2 block font-semibold text-elvion-primary"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <div className="mb-2 font-semibold text-elvion-primary">{link.name}</div>
                                    )}
                                    <div className="space-y-2 border-l border-white/10 pl-4">
                                        {link.submenu.map((sub) => (
                                            <Link key={sub.name} href={sub.href} className="block text-sm text-gray-400" onClick={() => setIsOpen(false)}>
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link href={link.href} className="block text-white" onClick={() => setIsOpen(false)}>
                                    {link.name}
                                </Link>
                            )}
                        </div>
                    ))}
                    <div className="mt-4 flex flex-col gap-2 px-4">
                        <Link href="/appointment" onClick={() => setIsOpen(false)}>
                            <Button className="w-full">Get Appointment</Button>
                        </Link>
                        {isAuthenticated && user ? (
                            <div className="space-y-2">
                                <div className="p-3 bg-elvion-dark rounded-lg border border-white/10">
                                    <p className="text-white font-semibold text-sm">{user.name || user.email}</p>
                                    <p className="text-gray-400 text-xs">{user.email}</p>
                                </div>
                                {user.is_admin && (
                                    <Link
                                        href="/admin/dashboard"
                                        className="block py-2 text-center text-elvion-primary hover:bg-elvion-primary/10 rounded-lg transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-2 text-center text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="block py-2 text-center text-white" onClick={() => setIsOpen(false)}>
                                Login / Signup
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
