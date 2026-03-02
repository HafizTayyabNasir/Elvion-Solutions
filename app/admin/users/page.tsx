"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Trash2, Shield, ShieldOff, UserCheck, UserX, Mail, Calendar, MoreVertical } from "lucide-react";

interface User {
  id: number; name: string; email: string; phone: string; isAdmin: boolean;
  isVerified: boolean; createdAt: string; _count?: { projects: number; tickets: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchUsers = () => {
    fetchAPI("/users").then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggleAdmin = async (user: User) => {
    if (!confirm(`${user.isAdmin ? "Remove" : "Grant"} admin access for ${user.name}?`)) return;
    try {
      await fetchAPI(`/users/${user.id}`, { method: "PUT", body: JSON.stringify({ isAdmin: !user.isAdmin }) });
      fetchUsers();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    setOpenMenu(null);
  };

  const toggleVerified = async (user: User) => {
    try {
      await fetchAPI(`/users/${user.id}`, { method: "PUT", body: JSON.stringify({ isVerified: !user.isVerified }) });
      fetchUsers();
    } catch (err) { console.error(err); }
    setOpenMenu(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to DELETE "${name}"?\n\nThis will permanently remove the user and all their data. This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetchAPI(`/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
      console.error(err);
    }
    setDeleting(null);
    setOpenMenu(null);
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
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1><p className="text-gray-500 mt-1">Manage system users — click the ⋮ menu or the red Delete button to remove a user</p></div>
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

      {/* User Cards - always visible on all screen sizes */}
      <div className="grid gap-4">
        {filtered.map(user => (
          <div key={user.id} className={`bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 transition-all ${deleting === user.id ? "opacity-50 pointer-events-none" : "hover:border-elvion-primary/30"}`}>
            <div className="flex items-center justify-between">
              {/* Left: User info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-full bg-elvion-primary/10 flex items-center justify-center text-elvion-primary font-bold text-lg shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${user.isAdmin ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" : "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400"}`}>
                      {user.isAdmin ? "ADMIN" : "USER"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${user.isVerified ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                      {user.isVerified ? "✓ Verified" : "✗ Unverified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate"><Mail size={12} /> {user.email}</span>
                    <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Right: Action buttons - ALWAYS VISIBLE */}
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {/* Toggle Admin Button */}
                <button
                  onClick={() => toggleAdmin(user)}
                  title={user.isAdmin ? "Remove admin role" : "Grant admin role"}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    user.isAdmin
                      ? "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                      : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
                  }`}
                >
                  {user.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </button>

                {/* Toggle Verified Button */}
                <button
                  onClick={() => toggleVerified(user)}
                  title={user.isVerified ? "Mark as unverified" : "Mark as verified"}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    user.isVerified
                      ? "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20"
                      : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                  }`}
                >
                  {user.isVerified ? <UserX size={14} /> : <UserCheck size={14} />}
                  {user.isVerified ? "Unverify" : "Verify"}
                </button>

                {/* DELETE BUTTON - Big and Red - Always visible */}
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  disabled={deleting === user.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
                >
                  <Trash2 size={14} />
                  <span>{deleting === user.id ? "Deleting..." : "Delete"}</span>
                </button>

                {/* Mobile: 3-dot menu for extra actions */}
                <div className="relative sm:hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id); }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === user.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-elvion-card border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={() => toggleAdmin(user)}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {user.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                        {user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => toggleVerified(user)}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {user.isVerified ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.isVerified ? "Unverify" : "Verify"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}
