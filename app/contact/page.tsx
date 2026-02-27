"use client";
import { Button } from "@/components/Button";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        try {
            await fetchAPI("/messages/", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    date: new Date().toISOString().split('T')[0] // Send current date
                }),
            });
            setStatus("Message sent successfully!");
            setFormData({ name: "", email: "", message: "" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                setStatus(error.message);
            } else {
                setStatus("Failed to send message.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-10 md:grid-cols-2">
            <div>
                <h1 className="mb-6 text-4xl font-bold text-white">Let&apos;s Start Your Digital Journey</h1>
                <p className="mb-8 text-elvion-gray">
                    Ready to see that growth arrow point straight up? Let&apos;s talk.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-elvion-card text-elvion-primary">
                            <Mail />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Email Us</p>
                            <p className="font-semibold">team@elvionsolutions.com</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-elvion-card text-elvion-primary">
                            <Phone />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Call Us</p>
                            <p className="font-semibold">+92 326 5942996</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-elvion-card p-8">
                <h2 className="mb-6 text-2xl font-bold text-white">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary" 
                        required 
                    />
                    <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary" 
                        required 
                    />
                    <textarea 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        rows={4} 
                        placeholder="Your Message" 
                        className="w-full rounded-lg border border-white/10 bg-elvion-dark p-3 text-white outline-none focus:border-elvion-primary" 
                        required 
                    />
                    {status && <p className={`text-center text-sm ${status.includes("success") ? "text-green-500" : "text-red-500"}`}>{status}</p>}
                    <Button className="w-full" disabled={loading}>
                        {loading ? "Sending..." : "Send Message"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
