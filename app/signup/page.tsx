"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [verifyError, setVerifyError] = useState("");
    const [verifySuccess, setVerifySuccess] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
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
        
        if (value && !/^\d$/.test(value)) return; // Only digits
        
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
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
            const data = await fetchAPI("/register/", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    password: formData.password,
                }),
            });
            
            if (data.requiresVerification) {
                setRequiresVerification(true);
                setResendCooldown(60);
            } else {
                setSuccess(true);
            }
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

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setVerifyError("Please enter all 6 digits");
            return;
        }

        setVerifyLoading(true);
        setVerifyError("");
        try {
            const data = await fetchAPI("/auth/verify-code", {
                method: "POST",
                body: JSON.stringify({ email: formData.email, code }),
            });
            setVerifySuccess(data.message || "Email verified successfully!");
            setTimeout(() => setSuccess(true), 1500);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setVerifyError(err.message);
            } else {
                setVerifyError("Verification failed");
            }
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setResendLoading(true);
        setVerifyError("");
        try {
            const data = await fetchAPI("/auth/resend-verification", {
                method: "POST",
                body: JSON.stringify({ email: formData.email }),
            });
            setVerifySuccess(data.message || "New verification code sent!");
            setResendCooldown(60);
            setVerificationCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setTimeout(() => setVerifySuccess(""), 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setVerifyError(err.message);
            } else {
                setVerifyError("Failed to resend code");
            }
        } finally {
            setResendLoading(false);
        }
    };

    // Verified success — redirect to login
    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-elvion-dark px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-elvion-card p-8 shadow-[0_0_30px_rgba(0,210,141,0.1)] text-center">
                    <div className="w-16 h-16 bg-elvion-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-elvion-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
                    <p className="text-elvion-gray mb-6">
                        Your account has been verified successfully. You can now login.
                    </p>
                    <Link href="/login">
                        <Button className="w-full">Go to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Verification code entry screen
    if (requiresVerification) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-elvion-dark px-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-elvion-card p-8 shadow-[0_0_30px_rgba(0,210,141,0.1)] text-center">
                    <div className="w-16 h-16 bg-elvion-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-elvion-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
                    <p className="text-elvion-gray mb-2">
                        We&apos;ve sent a 6-digit verification code to
                    </p>
                    <p className="text-elvion-primary font-medium mb-6">{formData.email}</p>

                    {verifySuccess && (
                        <div className="mb-4 text-green-500 text-sm bg-green-500/10 p-3 rounded-lg">{verifySuccess}</div>
                    )}
                    {verifyError && (
                        <div className="mb-4 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{verifyError}</div>
                    )}

                    {/* 6-digit code input */}
                    <div className="flex justify-center gap-3 mb-6">
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
                                className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-white/10 bg-elvion-dark text-white outline-none focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary transition-all"
                            />
                        ))}
                    </div>

                    <Button
                        className="w-full mb-4"
                        onClick={handleVerifyCode}
                        disabled={verifyLoading || verificationCode.join('').length !== 6}
                    >
                        {verifyLoading ? "Verifying..." : "Verify Email"}
                    </Button>

                    <div className="border-t border-white/10 pt-4 mt-4">
                        <p className="text-sm text-gray-500 mb-3">
                            Didn&apos;t receive the code? Check your spam folder.
                        </p>
                        <button
                            onClick={handleResendCode}
                            disabled={resendLoading || resendCooldown > 0}
                            className="text-elvion-primary hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {resendLoading
                                ? "Sending..."
                                : resendCooldown > 0
                                    ? `Resend code in ${resendCooldown}s`
                                    : "Resend Verification Code"
                            }
                        </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-4">
                        We also sent a verification link in the email.
                    </p>
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
