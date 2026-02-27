"use client";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
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

        setLoading(true);
        try {
            await fetchAPI("/register/", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });
            alert("Account created! Please login.");
            router.push("/login");
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-elvion-dark px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-elvion-card p-8 shadow-[0_0_30px_rgba(0,210,141,0.1)]">
                <h1 className="mb-2 text-center text-2xl font-bold text-white">Create Account</h1>
                <p className="mb-6 text-center text-sm text-elvion-gray">Join Elvion Solutions today</p>

                {error && <div className="mb-4 text-center text-sm text-red-500">{error}</div>}

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
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Password</label>
                        <input
                            name="password"
                            type="password"
                            onChange={handleChange}
                            className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary"
                            required
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
