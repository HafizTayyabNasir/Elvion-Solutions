"use client";
import { useState } from "react";

interface Client {
  id: number;
  name: string;
  email: string;
}

interface ClientSelectProps {
  clients: Client[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export default function ClientSelect({ clients, value, onChange }: ClientSelectProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search client by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-2 p-2 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"
      />
      <select
        value={value ?? ""}
        onChange={e => onChange(Number(e.target.value) || null)}
        className="w-full p-2 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"
      >
        <option value="">Select client...</option>
        {filtered.map(c => (
          <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
        ))}
      </select>
    </div>
  );
}
