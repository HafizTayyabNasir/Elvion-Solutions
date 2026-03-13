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
    const [showAddModal, setShowAddModal] = useState(false);
    const [clientForm, setClientForm] = useState({ name: '', email: '' });
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

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
        <button
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Client
        </button>
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
                <button
                  key={project.id}
                  className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-lg transition-shadow text-left w-full focus:outline-elvion-primary"
                  aria-label={`View project ${project.name}`}
                  onClick={() => {
                    // Analytics event
                    if (window && typeof window !== "undefined") {
                      window?.gtag?.("event", "view_project", { projectId: project.id, projectName: project.name });
                    }
                    window.location.href = `/admin/projects/${project.id}`;
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen size={18} className="text-elvion-primary" />
                    <span className="font-semibold text-gray-900 dark:text-white">{project.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{project.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-elvion-card rounded-xl p-6 w-full max-w-lg shadow-lg relative">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowAddModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Add Client & Project</h2>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setAddLoading(true);
                  setAddError('');
                  setAddSuccess('');
                  try {
                    // Create client
                    const clientRes = await fetchAPI('/crm/contacts', {
                      method: 'POST',
                      body: JSON.stringify(clientForm),
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (!clientRes || !clientRes.id) throw new Error('Client creation failed');
                    // Create project linked to client
                    const projectRes = await fetchAPI('/projects', {
                      method: 'POST',
                      body: JSON.stringify({ ...projectForm, clientId: clientRes.id }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (!projectRes || !projectRes.id) throw new Error('Project creation failed');
                    setAddSuccess('Client and project created successfully!');
                    setClients([...clients, clientRes]);
                    setShowAddModal(false);
                    setClientForm({ name: '', email: '' });
                    setProjectForm({ name: '', description: '' });
                  } catch (err: any) {
                    setAddError(err.message || 'Error occurred');
                  } finally {
                    setAddLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-semibold mb-2">Client Details</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={clientForm.name}
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 mb-2"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientForm.email}
                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Project Details</h3>
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 mb-2"
                    required
                  />
                  <textarea
                    placeholder="Project Description"
                    value={projectForm.description}
                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                {addError && <div className="text-red-500">{addError}</div>}
                {addSuccess && <div className="text-green-500">{addSuccess}</div>}
                <button type="submit" className="w-full bg-elvion-primary text-black rounded-lg font-semibold py-2 mt-2" disabled={addLoading}>
                  {addLoading ? 'Creating...' : 'Create Client & Project'}
                </button>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
