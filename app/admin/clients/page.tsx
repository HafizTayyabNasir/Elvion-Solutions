"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { Users, Plus, X } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchAPI("/crm/contacts")
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      setClients([...clients, clientRes]);
      setShowAddModal(false);
      setClientForm({ name: "", email: "" });
    } catch (err: any) {
      setAddError(err.message || "Error occurred");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 mt-1">Click on a client to view their details and projects.</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>No clients found.</p>
          <p className="text-sm mt-1">Click &quot;Add Client&quot; to create your first client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-lg transition-shadow hover:border-elvion-primary/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-sm">
                  {client.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white truncate">{client.name}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{client.email}</p>
              {client.company && <p className="text-xs text-gray-400 truncate mt-0.5">{client.company}</p>}
            </Link>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-elvion-card rounded-xl p-6 w-full max-w-md shadow-lg relative">
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
