"use client";
import { useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await fetchAPI("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            setSubmitted(true);
        } catch (error: any) {
            console.error(error);
            if (error.message.includes("500") || error.message.includes("Failed to send")) {
                // Even if email fails to send, we might want to be careful about errors, but for now show it.
                setMessage("Failed to send reset email. Please try again later.");
            } else {
                setMessage(error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-elvion-dark px-4">
                <div className="bg-elvion-card p-8 rounded-2xl border border-white/10 max-w-md w-full text-center animate-in fade-in zoom-in">
                    <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
                    <p className="text-gray-300 mb-6">
                        If an account exists for <b>{email}</b>, you will receive a password reset link shortly.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">Back to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-elvion-dark px-4">
            <div className="bg-elvion-card p-8 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Forgot Password</h1>
                <p className="text-gray-400 text-center mb-8">Enter your email to reset your password.</p>

                {message && <p className="text-red-400 text-center mb-4">{message}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white mb-2 text-sm">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white focus:border-elvion-primary outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
