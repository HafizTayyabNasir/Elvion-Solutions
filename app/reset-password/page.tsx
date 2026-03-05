"use client";
import { useState, Suspense } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function ResetPasswordForm() {
    const { t } = useLanguage();
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
            setMessage(t("reset.passwordMismatch"));
            return;
        }

        if (!token) {
            setMessage(t("reset.invalidToken"));
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
            setMessage(error.message || t("reset.failedReset"));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center animate-in fade-in zoom-in">
                <h1 className="text-2xl font-bold text-elvion-primary mb-4">{t("reset.successTitle")}</h1>
                <p className="text-gray-300 mb-6">
                    {t("reset.successDesc")}
                </p>
                <Link href="/login">
                    <Button className="w-full">{t("reset.loginNow")}</Button>
                </Link>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">{t("reset.invalidLinkTitle")}</h1>
                <p className="text-gray-300 mb-6">{t("reset.invalidLinkDesc")}</p>
                <Link href="/forgot-password">
                    <Button variant="outline">{t("reset.requestNewLink")}</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">{t("reset.title")}</h1>
            <p className="text-gray-400 text-center mb-8">{t("reset.description")}</p>

            {message && <p className="text-red-400 text-center mb-4">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-white mb-2 text-sm">{t("reset.newPasswordLabel")}</label>
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
                    <label className="block text-white mb-2 text-sm">{t("reset.confirmPasswordLabel")}</label>
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
                    {loading ? t("reset.submitting") : t("reset.submitButton")}
                </Button>
            </form>
        </>
    );
}

export default function ResetPassword() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen flex items-center justify-center bg-elvion-dark px-4">
            <div className="bg-elvion-card p-8 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl">
                <Suspense fallback={<div className="text-white text-center">{t("reset.loading")}</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
