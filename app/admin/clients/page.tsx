"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { Users, FolderOpen, Plus } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchAPI("/crm/contacts").then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    fetchAPI(`/projects?clientId=${client.id}`).then((data) => setProjects(data));
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 mt-1">List of all clients. Click to view their projects.</p>
        </div>
        <Link href="/admin/crm/contacts" className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Client</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {clients.map(client => (
          <button key={client.id} onClick={() => handleClientClick(client)} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 text-left hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-elvion-primary" />
              <span className="font-semibold text-gray-900 dark:text-white">{client.name}</span>
            </div>
            <p className="text-xs text-gray-500">{client.email}</p>
          </button>
        ))}
      </div>
      {selectedClient && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Projects for {selectedClient.name}</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found for this client.</p>
          ) : (
            <div className="grid gap-4">
              {projects.map(project => (
                <Link key={project.id} href={`/admin/projects/${project.id}`} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen size={18} className="text-elvion-primary" />
                    <span className="font-semibold text-gray-900 dark:text-white">{project.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{project.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
