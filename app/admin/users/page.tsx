"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Edit2, Trash2, Shield, ShieldOff, UserCheck, UserX, Mail, Calendar } from "lucide-react";

interface User {
  id: number; name: string; email: string; phone: string; isAdmin: boolean;
  isVerified: boolean; createdAt: string; _count?: { projects: number; tickets: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const fetchUsers = () => {
    fetchAPI("/users").then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (user: User) => {
    if (!confirm(`${user.isAdmin ? "Remove" : "Grant"} admin access for ${user.name}?`)) return;
    try {
      await fetchAPI(`/users/${user.id}`, { method: "PUT", body: JSON.stringify({ isAdmin: !user.isAdmin }) });
      fetchUsers();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const toggleVerified = async (user: User) => {
    try {
      await fetchAPI(`/users/${user.id}`, { method: "PUT", body: JSON.stringify({ isVerified: !user.isVerified }) });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try { await fetchAPI(`/users/${id}`, { method: "DELETE" }); fetchUsers(); } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || (filterRole === "admin" ? u.isAdmin : !u.isAdmin);
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1><p className="text-gray-500 mt-1">Manage system users</p></div>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-lg">{users.filter(u => u.isAdmin).length} Admins</span>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">{users.length} Total</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2">
          {["all", "admin", "user"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterRole === r ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {r === "all" ? "All" : r === "admin" ? "Admins" : "Users"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-white/5"><tr>
              <th className="p-4 text-gray-900 dark:text-white font-medium">User</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Contact</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Role</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Verified</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Joined</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-elvion-primary/10 flex items-center justify-center text-elvion-primary font-bold text-sm">{user.name.charAt(0).toUpperCase()}</div>
                      <div><p className="font-medium text-gray-900 dark:text-white">{user.name}</p></div>
                    </div>
                  </td>
                  <td className="p-4"><div className="space-y-1"><p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>{user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}</div></td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${user.isAdmin ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"}`}>
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleVerified(user)} className={`flex items-center gap-1 text-xs ${user.isVerified ? "text-green-500" : "text-gray-400"}`}>
                      {user.isVerified ? <UserCheck size={14} /> : <UserX size={14} />}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td className="p-4 text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button onClick={() => toggleAdmin(user)} title={user.isAdmin ? "Remove admin" : "Make admin"} className={`p-1.5 rounded ${user.isAdmin ? "hover:bg-orange-50 dark:hover:bg-orange-500/10 text-orange-500" : "hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-500"}`}>
                        {user.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No users found</div>}
      </div>
    </div>
  );
}
