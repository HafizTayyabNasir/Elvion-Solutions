"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MessageSquare, Trash2, Users, Plus, Edit2, Save, X, Briefcase, Mail, Download,
  FolderKanban, Ticket, Receipt, UserPlus, Handshake, TrendingUp, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/Button";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Types
interface Message { id: number; name: string; email: string; message: string; date: string; }
interface Slot { id: number; date: string; time: string; is_booked: boolean; booked_by?: string | null; booked_by_name?: string | null; }
interface Comment { id: number; user_name: string; text: string; date: string; }
interface UserItem { id: number; name: string | null; email: string; isAdmin: boolean; createdAt: string; }
interface InternshipApplication { id: number; fullName: string; personalEmail: string; universityEmail: string; fieldOfInterest: string; expectations: string; cvFileName: string | null; cvFileUrl: string | null; createdAt: string; }

interface DashboardStats {
  totalUsers: number; activeProjects: number; openTickets: number;
  totalLeads: number; totalDeals: number; totalRevenue: number; pendingInvoices: number;
}

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<"overview" | "messages" | "appointments" | "comments" | "users" | "internships">("overview");

    const [messages, setMessages] = useState<Message[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [internships, setInternships] = useState<InternshipApplication[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, activeProjects: 0, openTickets: 0, totalLeads: 0, totalDeals: 0, totalRevenue: 0, pendingInvoices: 0 });
    const [loading, setLoading] = useState(true);

    const [newSlotDate, setNewSlotDate] = useState("");
    const [newSlotTime, setNewSlotTime] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    // Fetch overview stats
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchStats = async () => {
            try {
                const [usersRes, projectsRes, ticketsRes, leadsRes, dealsRes, invoicesRes] = await Promise.all([
                    fetchAPI("/users").catch(() => []),
                    fetchAPI("/projects").catch(() => []),
                    fetchAPI("/tickets").catch(() => []),
                    fetchAPI("/crm/leads").catch(() => []),
                    fetchAPI("/crm/deals").catch(() => []),
                    fetchAPI("/invoices").catch(() => []),
                ]);
                setStats({
                    totalUsers: Array.isArray(usersRes) ? usersRes.length : 0,
                    activeProjects: Array.isArray(projectsRes) ? projectsRes.filter((p: {status: string}) => p.status === "active").length : 0,
                    openTickets: Array.isArray(ticketsRes) ? ticketsRes.filter((t: {status: string}) => t.status !== "closed" && t.status !== "resolved").length : 0,
                    totalLeads: Array.isArray(leadsRes) ? leadsRes.length : 0,
                    totalDeals: Array.isArray(dealsRes) ? dealsRes.length : 0,
                    totalRevenue: Array.isArray(invoicesRes) ? invoicesRes.filter((i: {status: string}) => i.status === "paid").reduce((s: number, i: {total: number}) => s + i.total, 0) : 0,
                    pendingInvoices: Array.isArray(invoicesRes) ? invoicesRes.filter((i: {status: string}) => i.status === "sent" || i.status === "overdue").length : 0,
                });
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [isAuthenticated]);

    // Fetch tab data
    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchMessages = async () => { try { setMessages(await fetchAPI("/messages/")); } catch (e) { console.error(e); } };
        const fetchSlots = async () => { try { setSlots(await fetchAPI("/slots/")); } catch (e) { console.error(e); } };
        const fetchComments = async () => { try { setComments(await fetchAPI("/comments/")); } catch (e) { console.error(e); } };
        const fetchUsers = async () => { try { setUsers(await fetchAPI("/users")); } catch (e) { console.error(e); } };
        const fetchInternships = async () => { try { setInternships(await fetchAPI("/internship")); } catch (e) { console.error(e); } };

        if (activeTab === "messages") fetchMessages();
        if (activeTab === "appointments") fetchSlots();
        if (activeTab === "comments") fetchComments();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "internships") fetchInternships();
    }, [activeTab, isAuthenticated]);

    const handleDeleteMessage = async (id: number) => { if (!confirm("Are you sure?")) return; try { await fetchAPI(`/messages/${id}`, { method: "DELETE" }); setMessages(messages.filter(m => m.id !== id)); } catch (e) { console.error(e); } };
    const handleAddSlot = async () => { if (!newSlotDate || !newSlotTime) return; try { const s = await fetchAPI("/slots/", { method: "POST", body: JSON.stringify({ date: newSlotDate, time: newSlotTime }) }); setSlots([...slots, s]); setNewSlotTime(""); } catch (e) { console.error(e); } };
    const handleDeleteSlot = async (id: number) => { if (!confirm("Are you sure?")) return; try { await fetchAPI(`/slots/${id}`, { method: "DELETE" }); setSlots(slots.filter(s => s.id !== id)); } catch (e) { console.error(e); } };
    const handleDeleteComment = async (id: number) => { if (!confirm("Are you sure?")) return; try { await fetchAPI(`/comments/${id}`, { method: "DELETE" }); setComments(comments.filter(c => c.id !== id)); } catch (e) { console.error(e); } };
    const startEditComment = (c: Comment) => { setEditingCommentId(c.id); setEditCommentText(c.text); };
    const saveEditComment = async () => { if (editingCommentId === null) return; try { const u = await fetchAPI(`/comments/${editingCommentId}`, { method: "PUT", body: JSON.stringify({ text: editCommentText }) }); setComments(comments.map(c => c.id === editingCommentId ? u : c)); setEditingCommentId(null); } catch (e) { console.error(e); } };

    const statCards = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500", href: "/admin/users" },
        { title: "Active Projects", value: stats.activeProjects, icon: FolderKanban, color: "bg-green-500", href: "/admin/projects" },
        { title: "Open Tickets", value: stats.openTickets, icon: Ticket, color: "bg-purple-500", href: "/admin/tickets" },
        { title: "Leads", value: stats.totalLeads, icon: UserPlus, color: "bg-orange-500", href: "/admin/crm/leads" },
        { title: "Deals", value: stats.totalDeals, icon: Handshake, color: "bg-cyan-500", href: "/admin/crm/deals" },
        { title: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500", href: "/admin/invoices" },
        { title: "Pending Invoices", value: stats.pendingInvoices, icon: Receipt, color: "bg-red-500", href: "/admin/invoices" },
    ];

    const tabs = [
        { id: "overview" as const, label: "Overview", icon: TrendingUp },
        { id: "messages" as const, label: "Messages", icon: MessageSquare },
        { id: "appointments" as const, label: "Slots", icon: Calendar },
        { id: "comments" as const, label: "Comments", icon: MessageSquare },
        { id: "users" as const, label: "Users", icon: Users },
        { id: "internships" as const, label: "Internships", icon: Briefcase },
    ];

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name || "Admin"}</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-elvion-primary text-black" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(stat => (
                            <Link key={stat.title} href={stat.href} className="bg-white dark:bg-elvion-card rounded-xl p-6 border border-gray-200 dark:border-white/10 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 ${stat.color}/10 rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                {[
                                    { href: "/admin/projects", icon: FolderKanban, color: "green", label: "Manage Projects", desc: "Create & track" },
                                    { href: "/admin/crm/leads", icon: UserPlus, color: "orange", label: "CRM Leads", desc: "Sales pipeline" },
                                    { href: "/admin/invoices", icon: Receipt, color: "emerald", label: "Invoices", desc: "Billing" },
                                    { href: "/admin/tickets", icon: Ticket, color: "purple", label: "Tickets", desc: "Support" },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className={`w-10 h-10 bg-${a.color}-500/10 rounded-lg flex items-center justify-center`}>
                                            <a.icon className={`w-5 h-5 text-${a.color}-500`} />
                                        </div>
                                        <div><p className="font-medium text-gray-900 dark:text-white">{a.label}</p><p className="text-xs text-gray-500">{a.desc}</p></div>
                                        <ArrowRight size={16} className="ml-auto text-gray-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CRM Pipeline</h2>
                            <div className="space-y-4">
                                {[
                                    { label: "Leads", value: stats.totalLeads, color: "orange", pct: Math.min(stats.totalLeads * 10, 100) },
                                    { label: "Deals", value: stats.totalDeals, color: "cyan", pct: Math.min(stats.totalDeals * 15, 100) },
                                    { label: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, color: "emerald", pct: Math.min(stats.totalRevenue / 100, 100) },
                                ].map(p => (
                                    <div key={p.label}>
                                        <div className="flex justify-between mb-1"><span className="text-sm text-gray-500">{p.label}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{p.value}</span></div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className={`bg-${p.color}-500 h-2 rounded-full`} style={{ width: `${p.pct}%` }}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MESSAGES */}
            {activeTab === "messages" && (
                <div className="bg-white dark:bg-elvion-card border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5"><tr><th className="p-4 text-gray-900 dark:text-white">Date</th><th className="p-4 text-gray-900 dark:text-white">Name</th><th className="p-4 text-gray-900 dark:text-white">Email</th><th className="p-4 text-gray-900 dark:text-white">Message</th><th className="p-4 text-gray-900 dark:text-white">Action</th></tr></thead>
                        <tbody>
                            {messages.map(m => (
                                <tr key={m.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="p-4 text-elvion-primary">{m.date}</td><td className="p-4 font-semibold text-gray-900 dark:text-white">{m.name}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{m.email}</td><td className="p-4 text-gray-500 dark:text-gray-400">{m.message}</td>
                                    <td className="p-4"><Trash2 size={16} className="cursor-pointer text-red-400 hover:text-red-500" onClick={() => handleDeleteMessage(m.id)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {messages.length === 0 && <div className="p-8 text-center text-gray-500">No messages yet</div>}
                </div>
            )}

            {/* APPOINTMENTS */}
            {activeTab === "appointments" && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-elvion-card p-6 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full"><label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Date</label><input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="w-full bg-gray-50 dark:bg-elvion-dark border border-gray-200 dark:border-white/20 p-3 rounded-lg text-gray-900 dark:text-white" /></div>
                        <div className="w-full"><label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Time</label><input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="w-full bg-gray-50 dark:bg-elvion-dark border border-gray-200 dark:border-white/20 p-3 rounded-lg text-gray-900 dark:text-white" /></div>
                        <Button onClick={handleAddSlot} className="w-full md:w-auto h-[50px]"><Plus size={18} /> Add Slot</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slots.map(slot => (
                            <div key={slot.id} className="bg-white dark:bg-elvion-card p-4 rounded-xl border border-gray-200 dark:border-white/10">
                                <div className="flex justify-between items-start mb-3"><div><p className="text-gray-500 text-xs">{slot.date}</p><p className="text-gray-900 dark:text-white text-lg font-bold">{slot.time}</p></div><button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button></div>
                                <span className={`text-xs px-2 py-1 rounded ${slot.is_booked ? 'bg-red-100 dark:bg-red-400/10 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-elvion-primary/10 text-green-600 dark:text-elvion-primary'}`}>{slot.is_booked ? 'Booked' : 'Available'}</span>
                                {slot.is_booked && (slot.booked_by || slot.booked_by_name) && (<div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5"><p className="text-xs text-gray-400 mb-1">Booked by:</p>{slot.booked_by_name && <p className="font-semibold text-sm text-gray-900 dark:text-white">{slot.booked_by_name}</p>}{slot.booked_by && <p className="text-elvion-primary text-xs">{slot.booked_by}</p>}</div>)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* COMMENTS */}
            {activeTab === "comments" && (
                <div className="grid gap-4">
                    {comments.map(c => (
                        <div key={c.id} className="bg-white dark:bg-elvion-card p-6 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="flex justify-between mb-2"><p className="font-bold text-gray-900 dark:text-white">{c.user_name} <span className="text-xs text-gray-500 font-normal">({c.date})</span></p>
                                <div className="flex gap-2">{editingCommentId === c.id ? (<><Save size={18} className="cursor-pointer text-elvion-primary" onClick={saveEditComment} /><X size={18} className="cursor-pointer text-gray-400" onClick={() => setEditingCommentId(null)} /></>) : (<><Edit2 size={18} className="cursor-pointer text-blue-400" onClick={() => startEditComment(c)} /><Trash2 size={18} className="cursor-pointer text-red-400" onClick={() => handleDeleteComment(c.id)} /></>)}</div>
                            </div>
                            {editingCommentId === c.id ? <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full bg-gray-50 dark:bg-elvion-dark border border-elvion-primary p-2 rounded text-gray-900 dark:text-white" /> : <p className="text-gray-600 dark:text-gray-300">{c.text}</p>}
                        </div>
                    ))}
                    {comments.length === 0 && <div className="p-8 text-center text-gray-500">No comments yet</div>}
                </div>
            )}

            {/* USERS */}
            {activeTab === "users" && (
                <div className="bg-white dark:bg-elvion-card border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5"><tr><th className="p-4 text-gray-900 dark:text-white">ID</th><th className="p-4 text-gray-900 dark:text-white">Name</th><th className="p-4 text-gray-900 dark:text-white">Email</th><th className="p-4 text-gray-900 dark:text-white">Role</th><th className="p-4 text-gray-900 dark:text-white">Joined</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="p-4 text-elvion-primary">{u.id}</td><td className="p-4 font-semibold text-gray-900 dark:text-white">{u.name || "N/A"}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.isAdmin ? 'bg-elvion-primary text-black' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                                    <td className="p-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* INTERNSHIPS */}
            {activeTab === "internships" && (
                <div className="grid gap-4">
                    {internships.map(app => (
                        <div key={app.id} className="bg-white dark:bg-elvion-card p-6 rounded-xl border border-gray-200 dark:border-white/10">
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{app.fullName}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500"><div className="flex items-center gap-2"><Mail size={16} className="text-elvion-primary" /><span>{app.personalEmail}</span></div>{app.universityEmail && <div className="flex items-center gap-2"><Mail size={16} className="text-elvion-primary" /><span>{app.universityEmail}</span></div>}</div>
                                </div>
                                <button onClick={async () => { if (!confirm("Delete?")) return; try { await fetchAPI(`/internship/${app.id}`, { method: "DELETE" }); setInternships(internships.filter(a => a.id !== app.id)); } catch (e) { console.error(e); } }} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                <div><span className="text-sm text-gray-400">Field:</span><p className="text-gray-900 dark:text-white font-semibold">{app.fieldOfInterest}</p></div>
                                {app.expectations && <div><span className="text-sm text-gray-400">Expectations:</span><p className="text-gray-700 dark:text-gray-300">{app.expectations}</p></div>}
                                {app.cvFileName && (
                                    <div><span className="text-sm text-gray-400">CV:</span>
                                        <div className="flex items-center gap-3 mt-1"><p className="text-elvion-primary">{app.cvFileName}</p>
                                            <button onClick={async () => { try { const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"; const token = localStorage.getItem("token"); const headers: HeadersInit = {}; if (token) headers["Authorization"] = `Bearer ${token}`; const res = await fetch(`${API_URL}/internship/${app.id}/cv`, { headers }); if (!res.ok) throw new Error("Failed"); const blob = await res.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = app.cvFileName || "cv.pdf"; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); } catch (e) { console.error(e); alert("Failed to download CV"); } }} className="flex items-center gap-1 px-3 py-1 bg-elvion-primary/20 hover:bg-elvion-primary/30 text-elvion-primary rounded-lg transition-colors text-sm"><Download size={14} /> Download</button>
                                        </div>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-white/5">Applied: {new Date(app.createdAt).toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                    {internships.length === 0 && <div className="p-8 text-center text-gray-500"><Briefcase size={48} className="mx-auto mb-4 opacity-50" /><p>No applications yet</p></div>}
                </div>
            )}
        </div>
    );
}
