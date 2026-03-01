"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            await fetchAPI("/register/", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    password: formData.password,
                }),
            });
            setSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-elvion-dark px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-elvion-card p-8 shadow-[0_0_30px_rgba(0,210,141,0.1)] text-center">
                    <div className="w-16 h-16 bg-elvion-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-elvion-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                    <p className="text-elvion-gray mb-6">
                        We&apos;ve sent a verification link to <span className="text-elvion-primary">{formData.email}</span>. 
                        Please click the link in the email to verify your account.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Didn&apos;t receive the email? Check your spam folder or wait a few minutes.
                    </p>
                    <Link href="/login">
                        <Button className="w-full">Go to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-elvion-dark px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-elvion-card p-8 shadow-[0_0_30px_rgba(0,210,141,0.1)]">
                <h1 className="mb-2 text-center text-2xl font-bold text-white">Create Account</h1>
                <p className="mb-6 text-center text-sm text-elvion-gray">Join Elvion Solutions today</p>

                {error && <div className="mb-4 text-center text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</div>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            onChange={handleChange}
                            className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Email</label>
                        <input
                            name="email"
                            type="email"
                            onChange={handleChange}
                            className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm text-gray-400">Phone (Optional)</label>
                            <input
                                name="phone"
                                type="tel"
                                onChange={handleChange}
                                className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-400">Company (Optional)</label>
                            <input
                                name="company"
                                type="text"
                                onChange={handleChange}
                                className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Password</label>
                        <input
                            name="password"
                            type="password"
                            onChange={handleChange}
                            className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            onChange={handleChange}
                            className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            required
                        />
                    </div>
                    <Button className="mt-4 w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <Link href="/login" className="text-elvion-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
