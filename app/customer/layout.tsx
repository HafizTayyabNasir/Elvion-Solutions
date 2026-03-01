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
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Receipt,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/customer/projects", icon: FolderKanban },
  { name: "Support Tickets", href: "/customer/tickets", icon: Ticket },
  { name: "Invoices", href: "/customer/invoices", icon: Receipt },
  { name: "Reports", href: "/customer/reports", icon: FileText },
  { name: "Bookings", href: "/customer/bookings", icon: Calendar },
  { name: "Notifications", href: "/customer/notifications", icon: Bell },
  { name: "Settings", href: "/customer/settings", icon: Settings },
];

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notifications?unread=true", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-elvion-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
          <Link href="/customer/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-elvion-primary rounded-lg flex items-center justify-center text-black font-bold shrink-0">
              E
            </div>
            {sidebarOpen && (
              <span className="text-lg font-semibold text-white truncate">
                Portal
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
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={!sidebarOpen ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-elvion-primary/10 text-elvion-primary"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                {item.name === "Notifications" && notificationCount > 0 && (
                  <span
                    className={`absolute ${
                      sidebarOpen ? "right-3" : "top-1 right-1"
                    } bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}
                  >
                    {notificationCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
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
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
