"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-elvion-dark"><div className="text-white">Loading...</div></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerificationResend, setShowVerificationResend] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email verified successfully! You can now login.');
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        setShowVerificationResend(false);

        try {
            const data = await fetchAPI("/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            login(data.access_token);
        } catch (err: unknown) {
            if (err instanceof Error) {
                const message = err.message;
                if (message.includes('verify your email') || message.includes('requiresVerification')) {
                    setShowVerificationResend(true);
                    setResendEmail(email);
                }
                setError(message.includes(':') ? message.split(':').slice(1).join(':').trim() : message);
            } else {
                setError("Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setError("");
        try {
            const data = await fetchAPI("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: resendEmail }),
            });
            setSuccess(data.message || "Done! You can now try logging in.");
            setShowVerificationResend(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send verification email");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-elvion-dark">
            <div className="w-full max-w-md bg-elvion-card p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,210,141,0.1)]">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Login</h1>
                {success && <div className="text-green-500 text-sm mb-4 text-center bg-green-500/10 p-3 rounded-lg">{success}</div>}
                {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
                
                {showVerificationResend && (
                    <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-500 text-sm mb-3">Your email is not verified yet.</p>
                        <button
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className="w-full py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
                        >
                            {resendLoading ? "Sending..." : "Resend Verification Email"}
                        </button>
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-elvion-dark border border-white/10 p-3 rounded-lg text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-elvion-dark border border-white/10 p-3 rounded-lg text-white"
                            required
                        />
                        <div className="flex justify-end mt-1">
                            <Link href="/forgot-password" className="text-sm text-elvion-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <Button className="w-full mt-4" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>
                <p className="text-center text-gray-500 mt-4 text-sm">
                    Don&apos;t have an account? <Link href="/signup" className="text-elvion-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
