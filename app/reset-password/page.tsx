"use client";
import { useState, Suspense } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (!token) {
            setMessage("Invalid or missing token.");
            return;
        }

        setLoading(true);

        try {
            await fetchAPI("/auth/reset_password", {
                method: "POST",
                body: JSON.stringify({ token, password }),
            });
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center animate-in fade-in zoom-in">
                <h1 className="text-2xl font-bold text-elvion-primary mb-4">Password Reset Successful!</h1>
                <p className="text-gray-300 mb-6">
                    Your password has been updated. Redirecting to login...
                </p>
                <Link href="/login">
                    <Button className="w-full">Login Now</Button>
                </Link>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h1>
                <p className="text-gray-300 mb-6">This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password">
                    <Button variant="outline">Request New Link</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">Reset Password</h1>
            <p className="text-gray-400 text-center mb-8">Enter your new password below.</p>

            {message && <p className="text-red-400 text-center mb-4">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-white mb-2 text-sm">New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white focus:border-elvion-primary outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block text-white mb-2 text-sm">Confirm Password</label>
                    <input
                        type="password"
                        required
                        className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white focus:border-elvion-primary outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>
            </form>
        </>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-elvion-dark px-4">
            <div className="bg-elvion-card p-8 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl">
                <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
