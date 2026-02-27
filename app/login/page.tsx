"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await fetchAPI("/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            login(data.access_token);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-elvion-dark">
            <div className="w-full max-w-md bg-elvion-card p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,210,141,0.1)]">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Login</h1>
                {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
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
