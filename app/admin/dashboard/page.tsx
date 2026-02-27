"use client";
import { useState, useEffect } from "react";
import { Calendar, MessageSquare, Trash2, Users, LogOut, Plus, Edit2, Save, X, Briefcase, Mail, Download } from "lucide-react";
import { Button } from "@/components/Button";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Types matching Backend
interface Message {
    id: number;
    name: string;
    email: string;
    message: string;
    date: string;
}

interface Slot {
    id: number;
    date: string;
    time: string;
    is_booked: boolean;
    booked_by?: string | null;
    booked_by_name?: string | null;
}

interface Comment {
    id: number;
    user_name: string; // backend uses user_name
    text: string;
    date: string;
}

interface User {
    id: number;
    name: string | null;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

interface InternshipApplication {
    id: number;
    fullName: string;
    personalEmail: string;
    universityEmail: string;
    fieldOfInterest: string;
    expectations: string;
    cvFileName: string | null;
    cvFileUrl: string | null;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"messages" | "appointments" | "comments" | "users" | "internships">("messages");

    const [messages, setMessages] = useState<Message[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [internships, setInternships] = useState<InternshipApplication[]>([]);

    const [newSlotDate, setNewSlotDate] = useState("");
    const [newSlotTime, setNewSlotTime] = useState("");

    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    // Protect Route
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Fetch Data based on Active Tab
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchMessages = async () => {
            try {
                const data = await fetchAPI("/messages/");
                setMessages(data);
            } catch (error) { console.error(error); }
        };
        const fetchSlots = async () => {
            try {
                const data = await fetchAPI("/slots/");
                setSlots(data);
            } catch (error) { console.error(error); }
        };
        const fetchComments = async () => {
            try {
                const data = await fetchAPI("/comments/");
                setComments(data);
            } catch (error) { console.error(error); }
        };
        const fetchUsers = async () => {
            try {
                const data = await fetchAPI("/users");
                setUsers(data);
            } catch (error) { console.error(error); }
        };
        const fetchInternships = async () => {
            try {
                const data = await fetchAPI("/internship");
                setInternships(data);
            } catch (error) { console.error(error); }
        };

        if (activeTab === "messages") fetchMessages();
        if (activeTab === "appointments") fetchSlots();
        if (activeTab === "comments") fetchComments();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "internships") fetchInternships();
    }, [activeTab, isAuthenticated]);

    // Actions
    const handleDeleteMessage = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchAPI(`/messages/${id}`, { method: "DELETE" });
            setMessages(messages.filter((m) => m.id !== id));
        } catch (error) { console.error(error); alert("Failed to delete"); }
    };

    const handleAddSlot = async () => {
        if (!newSlotDate || !newSlotTime) return;
        try {
            const newSlot = await fetchAPI("/slots/", {
                method: "POST",
                body: JSON.stringify({ date: newSlotDate, time: newSlotTime }),
            });
            setSlots([...slots, newSlot]);
            setNewSlotTime("");
        } catch (error) { console.error(error); alert("Failed to add slot"); }
    };

    const handleDeleteSlot = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchAPI(`/slots/${id}`, { method: "DELETE" });
            setSlots(slots.filter((s) => s.id !== id));
        } catch (error) { console.error(error); alert("Failed to delete"); }
    };

    const handleDeleteComment = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchAPI(`/comments/${id}`, { method: "DELETE" });
            setComments(comments.filter((c) => c.id !== id));
        } catch (error) { console.error(error); alert("Failed to delete"); }
    };

    const startEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.text);
    };

    const saveEditComment = async () => {
        if (editingCommentId === null) return;
        try {
            const updated = await fetchAPI(`/comments/${editingCommentId}`, {
                method: "PUT",
                body: JSON.stringify({ text: editCommentText }),
            });
            setComments(comments.map((c) => (c.id === editingCommentId ? updated : c)));
            setEditingCommentId(null);
        } catch (error) { console.error(error); alert("Failed to update"); }
    };

    if (isLoading || !user?.is_admin) return <div className="min-h-screen bg-elvion-dark flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen flex bg-elvion-dark text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-elvion-card border-r border-white/10 hidden md:flex flex-col p-6 fixed h-full z-10">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold tracking-tight">ADMIN<span className="text-elvion-primary">.</span></h2>
                    <p className="text-xs text-elvion-gray">Dashboard</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <button onClick={() => setActiveTab("messages")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'messages' ? 'bg-elvion-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                        <MessageSquare size={18} /> Messages
                    </button>

                    <button onClick={() => setActiveTab("appointments")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'appointments' ? 'bg-elvion-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                        <Calendar size={18} /> Manage Slots
                    </button>

                    <button onClick={() => setActiveTab("comments")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'comments' ? 'bg-elvion-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                        <Users size={18} /> User Comments
                    </button>

                    <button onClick={() => setActiveTab("users")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'users' ? 'bg-elvion-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                        <Users size={18} /> All Users
                    </button>

                    <button onClick={() => setActiveTab("internships")} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'internships' ? 'bg-elvion-primary text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}>
                        <Briefcase size={18} /> Internship Applications
                    </button>
                </nav>

                <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 mt-auto p-3 text-left">
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto pt-24">
                {/* MESSAGES TAB */}
                {activeTab === "messages" && (
                    <div className="animate-in fade-in">
                        <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
                        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-white/5 text-white">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Message</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((m) => (
                                        <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 text-elvion-primary">{m.date}</td>
                                            <td className="p-4 text-white font-semibold">{m.name}</td>
                                            <td className="p-4">{m.email}</td>
                                            <td className="p-4">{m.message}</td>
                                            <td className="p-4"><Trash2 size={16} className="cursor-pointer text-red-400" onClick={() => handleDeleteMessage(m.id)} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* APPOINTMENTS TAB */}
                {activeTab === "appointments" && (
                    <div className="animate-in fade-in">
                        <h1 className="text-3xl font-bold mb-6">Daily Meeting Slots</h1>

                        {/* Add Slot */}
                        <div className="bg-elvion-card p-6 rounded-xl border border-white/10 mb-8 flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full">
                                <label className="text-sm text-gray-400 mb-1 block">Date</label>
                                <input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)} className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white color-scheme-dark" />
                            </div>
                            <div className="w-full">
                                <label className="text-sm text-gray-400 mb-1 block">Time</label>
                                <input type="time" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} className="w-full bg-elvion-dark border border-white/20 p-3 rounded-lg text-white color-scheme-dark" />
                            </div>
                            <Button onClick={handleAddSlot} className="w-full md:w-auto h-[50px]"><Plus size={18} /> Add Slot</Button>
                        </div>

                        {/* View Slots */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {slots.map((slot) => (
                                <div key={slot.id} className="bg-elvion-card p-4 rounded-xl border border-white/10 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-elvion-gray text-xs">{slot.date}</p>
                                            <p className="text-white text-lg font-bold">{slot.time}</p>
                                        </div>
                                        <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                    <div className="mt-auto">
                                        <span className={`text-xs px-2 py-1 rounded inline-block ${slot.is_booked ? 'bg-red-400/10 text-red-400' : 'bg-elvion-primary/10 text-elvion-primary'}`}>
                                            {slot.is_booked ? 'Booked' : 'Available'}
                                        </span>
                                        {slot.is_booked && (slot.booked_by || slot.booked_by_name) && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-xs text-gray-400 mb-1">Booked by:</p>
                                                {slot.booked_by_name && (
                                                    <p className="text-white font-semibold text-sm">{slot.booked_by_name}</p>
                                                )}
                                                {slot.booked_by && (
                                                    <p className="text-elvion-primary text-xs">{slot.booked_by}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* COMMENTS TAB */}
                {activeTab === "comments" && (
                    <div className="animate-in fade-in">
                        <h1 className="text-3xl font-bold mb-6">Manage User Comments</h1>
                        <div className="grid gap-4">
                            {comments.map((c) => (
                                <div key={c.id} className="bg-elvion-card p-6 rounded-xl border border-white/10">
                                    <div className="flex justify-between mb-2">
                                        <p className="font-bold text-white">{c.user_name} <span className="text-xs text-gray-500 font-normal">({c.date})</span></p>
                                        <div className="flex gap-2">
                                            {editingCommentId === c.id ? (
                                                <>
                                                    <Save size={18} className="cursor-pointer text-elvion-primary" onClick={saveEditComment} />
                                                    <X size={18} className="cursor-pointer text-gray-400" onClick={() => setEditingCommentId(null)} />
                                                </>
                                            ) : (
                                                <>
                                                    <Edit2 size={18} className="cursor-pointer text-blue-400" onClick={() => startEditComment(c)} />
                                                    <Trash2 size={18} className="cursor-pointer text-red-400" onClick={() => handleDeleteComment(c.id)} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {editingCommentId === c.id ? (
                                        <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-elvion-dark border border-elvion-primary p-2 rounded text-white" />
                                    ) : (
                                        <p className="text-gray-300">{c.text}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && (
                    <div className="animate-in fade-in">
                        <h1 className="text-3xl font-bold mb-6">All Users</h1>
                        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="bg-white/5 text-white">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4 text-elvion-primary">{u.id}</td>
                                            <td className="p-4 text-white font-semibold">{u.name || "N/A"}</td>
                                            <td className="p-4">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${u.isAdmin ? 'bg-elvion-primary text-black' : 'bg-gray-600 text-white'}`}>
                                                    {u.isAdmin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* INTERNSHIP APPLICATIONS TAB */}
                {activeTab === "internships" && (
                    <div className="animate-in fade-in">
                        <h1 className="text-3xl font-bold mb-6">Internship Applications</h1>
                        <div className="grid gap-4">
                            {internships.map((app) => (
                                <div key={app.id} className="bg-elvion-card p-6 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{app.fullName}</h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-elvion-primary" />
                                                    <span>{app.personalEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={16} className="text-elvion-primary" />
                                                    <span>{app.universityEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Are you sure you want to delete this application?")) return;
                                                try {
                                                    await fetchAPI(`/internship/${app.id}`, { method: "DELETE" });
                                                    setInternships(internships.filter((a) => a.id !== app.id));
                                                } catch (error) {
                                                    console.error(error);
                                                    alert("Failed to delete");
                                                }
                                            }}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-400">Field of Interest:</span>
                                            <p className="text-white font-semibold">{app.fieldOfInterest}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-400">Expectations:</span>
                                            <p className="text-white">{app.expectations}</p>
                                        </div>
                                        {app.cvFileName && (
                                            <div>
                                                <span className="text-sm text-gray-400">CV:</span>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-elvion-primary">{app.cvFileName}</p>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                console.log('Downloading CV for application:', app.id);
                                                                const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
                                                                const token = localStorage.getItem("token");
                                                                const headers: HeadersInit = {};
                                                                if (token) {
                                                                    headers["Authorization"] = `Bearer ${token}`;
                                                                }

                                                                const response = await fetch(`${API_URL}/internship/${app.id}/cv`, {
                                                                    headers,
                                                                });

                                                                console.log('Response status:', response.status);
                                                                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                                                                if (!response.ok) {
                                                                    const errorText = await response.text();
                                                                    console.error('Error response:', errorText);
                                                                    throw new Error(`Failed to download CV: ${response.status} ${errorText}`);
                                                                }

                                                                const blob = await response.blob();
                                                                console.log('Blob created:', blob.size, blob.type);

                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement("a");
                                                                a.href = url;
                                                                a.download = app.cvFileName || "cv.pdf";
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                window.URL.revokeObjectURL(url);
                                                                document.body.removeChild(a);
                                                                console.log('Download initiated successfully');
                                                            } catch (error) {
                                                                console.error('Download error:', error);
                                                                alert(`Failed to download CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1 bg-elvion-primary/20 hover:bg-elvion-primary/30 text-elvion-primary rounded-lg transition-colors text-sm"
                                                    >
                                                        <Download size={14} />
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 pt-2 border-t border-white/5">
                                            Applied on: {new Date(app.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {internships.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No internship applications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
