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
  Handshake,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
    <div className="min-h-screen bg-elvion-dark flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-elvion-card border border-white/10 shadow-lg text-white hover:bg-white/5 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-elvion-card border-r border-white/10 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-[70px]"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-elvion-primary rounded-lg flex items-center justify-center text-black font-bold shrink-0">
              E
            </div>
            {sidebarOpen && (
              <span className="text-lg font-semibold text-white truncate">
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
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
                  title={!sidebarOpen ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-elvion-primary/10 text-elvion-primary"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={20} className="shrink-0" />
                  {sidebarOpen && <span className="font-medium flex-1 truncate">{item.name}</span>}
                  {hasChildren && sidebarOpen && (
                    <ChevronRight size={16} className={`transform transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
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
                            : "text-gray-400 hover:text-white"
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
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className={`mt-3 flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors w-full ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-[70px]"}`}>
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
