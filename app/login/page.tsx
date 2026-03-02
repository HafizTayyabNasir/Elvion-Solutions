"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
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
    const [showVerification, setShowVerification] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email verified successfully! You can now login.');
        }
    }, [searchParams]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            const newCode = [...verificationCode];
            digits.forEach((digit, i) => {
                if (index + i < 6) newCode[index + i] = digit;
            });
            setVerificationCode(newCode);
            const nextIndex = Math.min(index + digits.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }
        if (value && !/^\d$/.test(value)) return;
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        setShowVerification(false);

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
                    setShowVerification(true);
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

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }
        setVerifyLoading(true);
        setError("");
        try {
            const data = await fetchAPI("/auth/verify-code", {
                method: "POST",
                body: JSON.stringify({ email: resendEmail, code }),
            });
            setSuccess(data.message || "Email verified! You can now login.");
            setShowVerification(false);
            setVerificationCode(["", "", "", "", "", ""]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (resendCooldown > 0) return;
        setResendLoading(true);
        setError("");
        try {
            const data = await fetchAPI("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: resendEmail }),
            });
            setSuccess(data.message || "New verification code sent!");
            setResendCooldown(60);
            setVerificationCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend verification code");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-elvion-dark">
            <div className="w-full max-w-md bg-elvion-card p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,210,141,0.1)]">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Login</h1>
                {success && <div className="text-green-500 text-sm mb-4 text-center bg-green-500/10 p-3 rounded-lg">{success}</div>}
                {error && <div className="text-red-500 text-sm mb-4 text-center bg-red-500/10 p-3 rounded-lg">{error}</div>}
                
                {showVerification && (
                    <div className="mb-4 p-4 bg-elvion-dark border border-elvion-primary/20 rounded-xl">
                        <p className="text-elvion-gray text-sm mb-3 text-center">
                            Your email is not verified. Enter the 6-digit code from your email:
                        </p>
                        <div className="flex justify-center gap-2 mb-4">
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                        handleCodeChange(0, paste);
                                    }}
                                    className="w-10 h-12 text-center text-lg font-bold rounded-lg border border-white/10 bg-elvion-card text-white outline-none focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary transition-all"
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleVerifyCode}
                            disabled={verifyLoading || verificationCode.join('').length !== 6}
                            className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition disabled:opacity-50 mb-3"
                        >
                            {verifyLoading ? "Verifying..." : "Verify Code"}
                        </button>
                        <div className="text-center">
                            <button
                                onClick={handleResendVerification}
                                disabled={resendLoading || resendCooldown > 0}
                                className="text-elvion-primary hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading
                                    ? "Sending..."
                                    : resendCooldown > 0
                                        ? `Resend code in ${resendCooldown}s`
                                        : "Didn't receive the code? Resend"
                                }
                            </button>
                        </div>
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
