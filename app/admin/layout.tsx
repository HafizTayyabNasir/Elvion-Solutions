"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  Ticket,
  FileText,
  Users,
  UserPlus,
  Handshake,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "CRM", href: "/admin/crm", icon: Handshake, children: [
    { name: "Leads", href: "/admin/crm/leads" },
    { name: "Contacts", href: "/admin/crm/contacts" },
    { name: "Deals", href: "/admin/crm/deals" },
  ]},
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Tasks", href: "/admin/tasks", icon: FileText },
  { name: "Tickets", href: "/admin/tickets", icon: Ticket },
  { name: "Invoices", href: "/admin/invoices", icon: Receipt },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Auto-expand CRM menu if on CRM page
  useEffect(() => {
    if (pathname?.startsWith("/admin/crm")) {
      setExpandedMenu("CRM");
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elvion-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-elvion-dark">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white dark:bg-elvion-card shadow-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-elvion-card border-r border-gray-200 dark:border-white/10 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-elvion-primary rounded-lg flex items-center justify-center text-black font-bold">
              E
            </div>
            {sidebarOpen && (
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <ChevronLeft size={20} className={`transform transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenu === item.name;

            return (
              <div key={item.name}>
                <Link
                  href={hasChildren ? "#" : item.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      setExpandedMenu(isExpanded ? null : item.name);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-elvion-primary/10 text-elvion-primary"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="font-medium flex-1">{item.name}</span>}
                  {hasChildren && sidebarOpen && (
                    <ChevronLeft size={16} className={`transform transition-transform ${isExpanded ? "-rotate-90" : "rotate-180"}`} />
                  )}
                </Link>
                {hasChildren && isExpanded && sidebarOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? "text-elvion-primary bg-elvion-primary/5"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className={`mt-4 flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors ${sidebarOpen ? "w-full" : "justify-center w-full"}`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
