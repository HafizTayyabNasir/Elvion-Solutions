"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", category: "support" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ticket = await fetchAPI("/tickets", { method: "POST", body: JSON.stringify(form) });
      router.push(`/customer/tickets/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer/tickets" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Support Ticket</h1>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
          <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none" placeholder="Brief description of your issue" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea required rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none resize-none" placeholder="Describe your issue in detail..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">
              <option value="support">General Support</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="billing">Billing</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition-colors disabled:opacity-50">
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
