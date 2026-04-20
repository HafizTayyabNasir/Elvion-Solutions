"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, Phone, Mail, Building, Tag } from "lucide-react";

interface Contact {
  id: number; name: string; email: string; phone: string; company: string;
  position: string; notes: string; tags: string; leadId: number | null;
  user: { name: string }; lead?: { name: string }; createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", position: "", notes: "", tags: "" });

  const fetchContacts = () => {
    fetchAPI("/crm/contacts").then(setContacts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetchAPI(`/crm/contacts/${editId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await fetchAPI("/crm/contacts", { method: "POST", body: JSON.stringify(form) });
      }
      setShowForm(false); setEditId(null);
      setForm({ name: "", email: "", phone: "", company: "", position: "", notes: "", tags: "" });
      fetchContacts();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact?")) return;
    try { await fetchAPI(`/crm/contacts/${id}`, { method: "DELETE" }); fetchContacts(); } catch (err) { console.error(err); }
  };

  const startEdit = (c: Contact) => {
    setForm({ name: c.name, email: c.email, phone: c.phone || "", company: c.company || "", position: c.position || "", notes: c.notes || "", tags: c.tags || "" });
    setEditId(c.id); setShowForm(true);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM - Contacts</h1><p className="text-gray-500 mt-1">Manage your customer contacts</p></div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", email: "", phone: "", company: "", position: "", notes: "", tags: "" }); }}
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Contact</button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search contacts by name, email, company..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Contact" : "New Contact"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Email *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Position</label><input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Tags</label><input placeholder="comma-separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm text-gray-500 mb-1">Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Contact" : "Create Contact"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(contact => (
          <div key={contact.id} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:border-elvion-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-elvion-primary/10 flex items-center justify-center text-elvion-primary font-bold text-sm">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(contact)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(contact.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
            {contact.position && <p className="text-xs text-gray-500">{contact.position}</p>}
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-1.5"><Mail size={12} /> {contact.email}</p>
              {contact.phone && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Phone size={12} /> {contact.phone}</p>}
              {contact.company && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Building size={12} /> {contact.company}</p>}
            </div>
            {contact.tags && (
              <div className="mt-3 flex flex-wrap gap-1">
                {contact.tags.split(",").map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-elvion-primary/10 text-elvion-primary flex items-center gap-1"><Tag size={8} />{tag.trim()}</span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-3">{new Date(contact.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No contacts found</div>}
    </div>
  );
}
