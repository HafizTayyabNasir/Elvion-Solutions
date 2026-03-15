"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { Users, Plus, X, FolderOpen, DollarSign, Mail, Building2, ChevronRight, ChevronDown, Search } from "lucide-react";

interface ProjectPayment {
  id: number;
  amount: number;
  status: string;
}

interface ProjectTask {
  id: number;
  status: string;
}

interface ClientProject {
  id: number;
  name: string;
  status: string;
  payments: ProjectPayment[];
  tasks: ProjectTask[];
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ClientWithProjects extends Client {
  projects: ClientProject[];
  totalReceived: number;
  totalPending: number;
}

const statusLabels: Record<string, string> = { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
const getStatusColor = (s: string) => {
  const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
  return c[s] || "bg-gray-100 text-gray-700";
};

export default function AdminClientsPage() {
  const [clientsData, setClientsData] = useState<ClientWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [openProjectDropdown, setOpenProjectDropdown] = useState<number | null>(null);
  const [projectDropdownPos, setProjectDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const fetchData = () => {
    Promise.all([
      fetchAPI("/crm/contacts"),
      fetchAPI("/projects"),
    ]).then(([contacts, projects]) => {
      const clientsList: Client[] = Array.isArray(contacts) ? contacts : [];
      const projectsList: ClientProject[] = Array.isArray(projects) ? projects : [];

      const enriched: ClientWithProjects[] = clientsList.map((client) => {
        const clientProjects = projectsList.filter((p: any) => {
          const members = p.members || [];
          return members.some((m: any) => m.role === "client" && m.user?.id === client.id);
        });

        const totalReceived = clientProjects.reduce((sum, p) => {
          return sum + (p.payments || []).filter((pay) => pay.status === "received").reduce((s, pay) => s + pay.amount, 0);
        }, 0);

        const totalPending = clientProjects.reduce((sum, p) => {
          return sum + (p.payments || []).filter((pay) => pay.status === "pending").reduce((s, pay) => s + pay.amount, 0);
        }, 0);

        return { ...client, projects: clientProjects, totalReceived, totalPending };
      });

      setClientsData(enriched);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const clientRes = await fetchAPI("/crm/contacts", {
        method: "POST",
        body: JSON.stringify(clientForm),
        headers: { "Content-Type": "application/json" },
      });
      if (!clientRes || !clientRes.id) throw new Error("Client creation failed");
      setShowAddModal(false);
      setClientForm({ name: "", email: "" });
      fetchData();
    } catch (err: any) {
      setAddError(err.message || "Error occurred");
    } finally {
      setAddLoading(false);
    }
  };

  const handleProjectStatusChange = async (projectId: number, newStatus: string) => {
    try {
      await fetchAPI(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const calcProjectProgress = (tasks: ProjectTask[]) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100);
  };

  const filtered = clientsData.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  // Summary stats
  const totalClients = clientsData.length;
  const totalProjects = clientsData.reduce((s, c) => s + c.projects.length, 0);
  const totalReceivedAll = clientsData.reduce((s, c) => s + c.totalReceived, 0);
  const totalPendingAll = clientsData.reduce((s, c) => s + c.totalPending, 0);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 mt-1">Manage clients and their projects</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Clients</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totalClients}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Projects</p>
          <p className="text-lg font-bold text-blue-400">{totalProjects}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Received</p>
          <p className="text-lg font-bold text-green-500">${totalReceivedAll.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Pending</p>
          <p className="text-lg font-bold text-orange-500">${totalPendingAll.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white"
        />
      </div>

      {/* Client Rows */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>{search ? "No clients match your search." : "No clients found."}</p>
          {!search && <p className="text-sm mt-1">Click &quot;Add Client&quot; to create your first client.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center gap-4 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-lg transition-all hover:border-elvion-primary/30 group"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-lg shrink-0">
                {client.name?.charAt(0)?.toUpperCase() || "C"}
              </div>

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{client.name}</h3>
                  {client.company && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0"><Building2 size={10} /> {client.company}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={10} /> {client.email}</p>
              </div>

              {/* Projects with Progress */}
              <div className="hidden md:block min-w-[280px] max-w-[360px]">
                <div className="flex items-center gap-1 mb-1.5">
                  <FolderOpen size={12} className="text-blue-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{client.projects.length} Project{client.projects.length !== 1 ? "s" : ""}</span>
                </div>
                {client.projects.length > 0 ? (
                  <div className="space-y-1.5">
                    {client.projects.slice(0, 3).map((p) => {
                      const progress = calcProjectProgress(p.tasks || []);
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-gray-800 dark:text-gray-200 font-medium truncate">
                                {p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name}
                              </span>
                              <span className="text-[10px] text-gray-500 shrink-0">{progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-0.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : progress > 0 ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          {/* Project status dropdown */}
                          <div className="relative shrink-0" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (openProjectDropdown === p.id) {
                                  setOpenProjectDropdown(null);
                                  setProjectDropdownPos(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  setProjectDropdownPos({
                                    top: spaceBelow < 170 ? rect.top - 170 : rect.bottom + 4,
                                    left: rect.left,
                                  });
                                  setOpenProjectDropdown(p.id);
                                }
                              }}
                              className={`text-[9px] pl-1.5 pr-4 py-0.5 rounded-full cursor-pointer border border-gray-300 dark:border-white/20 font-semibold flex items-center gap-0.5 ${getStatusColor(p.status)}`}
                            >
                              {statusLabels[p.status] || p.status}
                              <ChevronDown size={8} className="opacity-60" />
                            </button>
                            {openProjectDropdown === p.id && projectDropdownPos && (
                              <>
                                <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenProjectDropdown(null); setProjectDropdownPos(null); }} />
                                <div
                                  className="fixed z-[9999] bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]"
                                  style={{ top: projectDropdownPos.top, left: projectDropdownPos.left }}
                                >
                                  {["active", "on_hold", "completed", "cancelled"].map(status => (
                                    <button
                                      key={status}
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleProjectStatusChange(p.id, status); setOpenProjectDropdown(null); setProjectDropdownPos(null); }}
                                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                                        p.status === status
                                          ? "bg-elvion-primary/10 text-elvion-primary font-semibold"
                                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${
                                        status === "active" ? "bg-green-500" :
                                        status === "on_hold" ? "bg-yellow-500" :
                                        status === "completed" ? "bg-blue-500" :
                                        "bg-red-500"
                                      }`} />
                                      {statusLabels[status]}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {client.projects.length > 3 && (
                      <span className="text-[10px] text-gray-400 px-1.5">+{client.projects.length - 3} more</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic">No projects yet</p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="hidden lg:flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase">Received</p>
                  <p className="text-sm font-bold text-green-500">${client.totalReceived.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase">Pending</p>
                  <p className="text-sm font-bold text-orange-500">${client.totalPending.toLocaleString()}</p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-elvion-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl p-6 w-full max-w-md shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Client Email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  required
                />
              </div>
              {addError && <div className="text-red-500 text-sm">{addError}</div>}
              <button
                type="submit"
                className="w-full bg-elvion-primary text-black rounded-lg font-semibold py-2"
                disabled={addLoading}
              >
                {addLoading ? "Creating..." : "Create Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
