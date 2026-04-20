"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import {
  FolderKanban,
  Ticket,
  Calendar,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  updatedAt: string;
}

interface TicketItem {
  id: number;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Booking {
  id: number;
  date: string;
  time: string;
}

interface Stats {
  projects: number;
  tickets: number;
  bookings: number;
  notifications: number;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    tickets: 0,
    bookings: 0,
    notifications: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, ticketsRes, notificationsRes, bookingsRes] = await Promise.all([
          fetchAPI("/projects/"),
          fetchAPI("/tickets/"),
          fetchAPI("/notifications/"),
          fetchAPI("/slots/my-bookings/"),
        ]);

        const activeProjects = projectsRes.filter(
          (p: Project) => p.status === "active"
        );
        const openTickets = ticketsRes.filter(
          (t: TicketItem) => t.status !== "closed" && t.status !== "resolved"
        );

        setStats({
          projects: activeProjects.length,
          tickets: openTickets.length,
          bookings: Array.isArray(bookingsRes) ? bookingsRes.length : 0,
          notifications: notificationsRes?.unreadCount || 0,
        });

        setRecentProjects(projectsRes.slice(0, 5));
        setRecentTickets(ticketsRes.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      open: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      resolved: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      closed: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const statCards = [
    {
      title: "Active Projects",
      value: stats.projects,
      icon: FolderKanban,
      color: "bg-blue-500",
      href: "/customer/projects",
    },
    {
      title: "Support Tickets",
      value: stats.tickets,
      icon: Ticket,
      color: "bg-purple-500",
      href: "/customer/tickets",
    },
    {
      title: "Bookings",
      value: stats.bookings,
      icon: Calendar,
      color: "bg-green-500",
      href: "/customer/bookings",
    },
    {
      title: "Notifications",
      value: stats.notifications,
      icon: Bell,
      color: "bg-red-500",
      href: "/customer/notifications",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white dark:bg-elvion-card rounded-xl p-6 border border-gray-200 dark:border-white/10 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 ${stat.color}/10 rounded-xl flex items-center justify-center`}
              >
                <stat.icon
                  className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Link
              href="/customer/projects"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No projects yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/customer/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {project.progress}% complete
                        </span>
                      </div>
                    </div>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-elvion-primary rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tickets
            </h2>
            <Link
              href="/customer/tickets"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {recentTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tickets yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/customer/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {ticket.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/customer/tickets/new"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:border-elvion-primary hover:bg-elvion-primary/5 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                New Ticket
              </p>
              <p className="text-xs text-gray-500">Get support</p>
            </div>
          </Link>
          <Link
            href="/appointment"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:border-elvion-primary hover:bg-elvion-primary/5 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Book Appointment
              </p>
              <p className="text-xs text-gray-500">Schedule a call</p>
            </div>
          </Link>
          <Link
            href="/customer/projects"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:border-elvion-primary hover:bg-elvion-primary/5 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                View Projects
              </p>
              <p className="text-xs text-gray-500">Track progress</p>
            </div>
          </Link>
          <Link
            href="/customer/settings"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:border-elvion-primary hover:bg-elvion-primary/5 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Settings
              </p>
              <p className="text-xs text-gray-500">Manage account</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
