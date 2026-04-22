"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import { Save, User, Lock, Clock } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [password, setPassword] = useState({ current: "", newPass: "", confirm: "" });
  const [officeHours, setOfficeHours] = useState({ office_start_time: "09:00", office_end_time: "18:00" });

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "", phone: "" });
  }, [user]);

  useEffect(() => {
    if (activeTab === "office") {
      fetchAPI("/settings").then((data: Record<string, string>) => {
        setOfficeHours({
          office_start_time: data.office_start_time || "09:00",
          office_end_time:   data.office_end_time   || "18:00",
        });
      }).catch(() => {});
    }
  }, [activeTab]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      await fetchAPI(`/users/${user?.userId}`, { method: "PUT", body: JSON.stringify(profile) });
      setMessage("Profile updated successfully");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage("");
    if (password.newPass !== password.confirm) { setMessage("Passwords don't match"); setSaving(false); return; }
    try {
      await fetchAPI(`/users/${user?.userId}`, { method: "PUT", body: JSON.stringify({ password: password.newPass, currentPassword: password.current }) });
      setMessage("Password changed successfully");
      setPassword({ current: "", newPass: "", confirm: "" });
    } catch (err) { setMessage(err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };

  const saveOfficeHours = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      await fetchAPI("/settings", { method: "POST", body: JSON.stringify(officeHours) });
      setMessage("Office hours updated successfully");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Failed"); }
    setSaving(false);
  };

  const tabs = [
    { id: "profile", label: "Profile",      icon: User },
    { id: "security", label: "Security",    icon: Lock },
    { id: "office",   label: "Office Hours", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-gray-500 mt-1">Manage your account settings</p></div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-elvion-primary text-black" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 dark:bg-green-500/10 text-green-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"}`}>
          {message}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            <div><label className="block text-sm text-gray-500 mb-1">Name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm text-gray-500 mb-1">Email</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm text-gray-500 mb-1">Phone</label><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 disabled:opacity-50"><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4 max-w-lg">
            <div><label className="block text-sm text-gray-500 mb-1">Current Password</label><input type="password" required value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm text-gray-500 mb-1">New Password</label><input type="password" required minLength={6} value={password.newPass} onChange={e => setPassword({ ...password, newPass: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm text-gray-500 mb-1">Confirm Password</label><input type="password" required value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 disabled:opacity-50"><Lock size={16} /> {saving ? "Saving..." : "Change Password"}</button>
          </form>
        </div>
      )}

      {activeTab === "office" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Office Hours</h2>
          <p className="text-sm text-gray-500 mb-6">
            Set the official office start and end times. Employees who clock in after the start time will be automatically marked as <span className="text-yellow-500 font-medium">Late</span>.
          </p>
          <form onSubmit={saveOfficeHours} className="space-y-5 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                  <Clock size={14} /> Office Start Time
                </label>
                <input
                  type="time"
                  required
                  value={officeHours.office_start_time}
                  onChange={e => setOfficeHours(h => ({ ...h, office_start_time: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm focus:outline-none focus:border-elvion-primary"
                />
                <p className="text-xs text-gray-400 mt-1">Employees clocking in after this time are marked Late</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                  <Clock size={14} /> Office End Time
                </label>
                <input
                  type="time"
                  required
                  value={officeHours.office_end_time}
                  onChange={e => setOfficeHours(h => ({ ...h, office_end_time: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm focus:outline-none focus:border-elvion-primary"
                />
                <p className="text-xs text-gray-400 mt-1">Used as default clock-out in attendance records</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400">
              Current hours: <strong>{officeHours.office_start_time}</strong> — <strong>{officeHours.office_end_time}</strong>
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : "Save Office Hours"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
