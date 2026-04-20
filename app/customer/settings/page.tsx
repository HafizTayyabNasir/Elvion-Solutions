"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import { User, Lock, Bell, Shield } from "lucide-react";

export default function CustomerSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await fetchAPI("/users", { method: "PUT", body: JSON.stringify(profile) });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update" });
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await fetchAPI("/users", { method: "PUT", body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPassword }) });
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswords({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to change password" });
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "password" as const, label: "Security", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage({ type: "", text: "" }); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {activeTab === "profile" && (
        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={profile.email} disabled
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-elvion-dark/50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={18} /> Change Password</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input type="password" required value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input type="password" required value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none" />
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
          {[
            { label: "Email notifications for project updates", key: "projectUpdates" },
            { label: "Email notifications for ticket responses", key: "ticketResponses" },
            { label: "Email notifications for invoice reminders", key: "invoiceReminders" },
            { label: "Browser push notifications", key: "pushNotifications" },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{pref.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-elvion-primary"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
