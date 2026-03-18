"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import {
  ArrowLeft, Search, Plus, X, Edit2, Trash2, FolderOpen, Users, Calendar, DollarSign,
  ChevronDown, ChevronRight, CheckSquare, UserPlus, Timer, AlertCircle,
  CreditCard, TrendingUp, TrendingDown, Banknote
} from "lucide-react";

interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  userId: number | null; positions: string[];
}

interface Subtask {
  id: number;
  title: string;
  status: string; // pending, in_progress, completed
  taskId: number;
  startDate: string | null;
  dueDate: string | null;
}

interface ProjectTask {
  id: number; title: string; status: string; priority: string;
  dueDate: string | null; startDate: string | null;
  budget: number | null; estimatedHours: number | null; actualHours: number | null;
  assignee: { id: number; name: string } | null;
  subtasks: Subtask[];
}

interface ProjectPayment {
  id: number;
  projectId: number;
  amount: number;
  status: string;
  category: string;
  label: string | null;
  taskId: number | null;
  description: string | null;
  paymentDate: string | null;
  currency?: string;
  createdAt: string;
}

interface Project {
  id: number; name: string; description: string; status: string; priority: string;
  startDate: string; endDate: string; budget: number; progress: number;
  owner: { id: number; name: string; email: string };
  members: { id: number; user: { id: number; name: string; email: string }; role: string }[];
  tasks: ProjectTask[];
  payments: ProjectPayment[];
  _count: { tasks: number; invoices: number; files: number };
}

const statusOptions = ["active", "on_hold", "completed", "cancelled"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const statusLabels: Record<string, string> = { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
const taskStatusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
const subtaskStatusLabels: Record<string, string> = { pending: "Pending", in_progress: "In Progress", completed: "Completed" };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [clientName, setClientName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  // Timeline state
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [showSubtaskForm, setShowSubtaskForm] = useState<number | null>(null);
  const [subtaskForm, setSubtaskForm] = useState({ title: "", startDate: "", dueDate: "" });

  // Status dropdown state
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [openProjectStatusDropdown, setOpenProjectStatusDropdown] = useState(false);
  const [projectDropdownPos, setProjectDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Task creation form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "", priority: "medium", assigneeId: "", startDate: "", dueDate: "",
    budget: "", estimatedHours: "", description: ""
  });

  // Task editing state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskData, setEditingTaskData] = useState({
    title: "", status: "todo", priority: "medium", assigneeId: "", startDate: "", dueDate: "",
    budget: "", estimatedHours: "", actualHours: "", description: ""
  });

  // Edit project state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", status: "active", priority: "medium",
    startDate: "", endDate: "", budget: "", memberIds: [] as number[],
    clientId: "", newClient: { name: "", email: "" }
  });

  // Payment state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "", status: "received", category: "monthly", label: "", taskId: "", description: "", paymentDate: "", currency: "USD"
  });

  const resetPaymentForm = () => setPaymentForm({ amount: "", status: "received", category: "monthly", label: "", taskId: "", description: "", paymentDate: "", currency: "USD" });

  // Timeline handlers
  const toggleTaskExpand = (taskId: number) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleTaskStatusToggle = async (task: ProjectTask) => {
    const statusCycle: Record<string, string> = { todo: "in_progress", in_progress: "done", done: "todo", review: "done" };
    const newStatus = statusCycle[task.status] || "todo";
    try {
      await fetchAPI(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleQuickStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await fetchAPI(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleProjectStatusChange = async (newStatus: string) => {
    try {
      await fetchAPI(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSubtaskStatusToggle = async (taskId: number, subtask: Subtask) => {
    const statusCycle: Record<string, string> = { pending: "in_progress", in_progress: "completed", completed: "pending" };
    const newStatus = statusCycle[subtask.status] || "pending";
    try {
      await fetchAPI(`/tasks/${taskId}/subtasks/${subtask.id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCreateSubtask = async (taskId: number) => {
    if (!subtaskForm.title.trim()) return;
    try {
      await fetchAPI(`/tasks/${taskId}/subtasks`, { method: "POST", body: JSON.stringify(subtaskForm) });
      setSubtaskForm({ title: "", startDate: "", dueDate: "" });
      setShowSubtaskForm(null);
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to create subtask"); }
  };

  const handleDeleteSubtask = async (taskId: number, subtaskId: number) => {
    if (!confirm("Delete this subtask?")) return;
    try {
      await fetchAPI(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const resetTaskForm = () => setTaskForm({
    title: "", priority: "medium", assigneeId: "", startDate: "", dueDate: "",
    budget: "", estimatedHours: "", description: ""
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      const taskData = {
        ...taskForm,
        projectId: Number(projectId),
        assigneeId: taskForm.assigneeId ? Number(taskForm.assigneeId) : null,
        budget: taskForm.budget ? parseFloat(taskForm.budget) : null,
        estimatedHours: taskForm.estimatedHours ? parseFloat(taskForm.estimatedHours) : null
      };
      await fetchAPI("/tasks", { method: "POST", body: JSON.stringify(taskData) });
      resetTaskForm();
      setShowTaskForm(false);
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to create task"); }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task and all its subtasks?")) return;
    try {
      await fetchAPI(`/tasks/${taskId}`, { method: "DELETE" });
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to delete task"); }
  };

  const startEditTask = (task: ProjectTask) => {
    setEditingTaskData({
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assignee?.id?.toString() || "",
      startDate: task.startDate ? task.startDate.split("T")[0] : "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      budget: task.budget?.toString() || "",
      estimatedHours: task.estimatedHours?.toString() || "",
      actualHours: task.actualHours?.toString() || "",
      description: ""
    });
    setEditingTaskId(task.id);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskData({
      title: "", status: "todo", priority: "medium", assigneeId: "", startDate: "", dueDate: "",
      budget: "", estimatedHours: "", actualHours: "", description: ""
    });
  };

  const handleUpdateTask = async (taskId: number) => {
    if (!editingTaskData.title.trim()) return;
    try {
      const taskData = {
        ...editingTaskData,
        assigneeId: editingTaskData.assigneeId ? Number(editingTaskData.assigneeId) : null,
        budget: editingTaskData.budget ? parseFloat(editingTaskData.budget) : null,
        estimatedHours: editingTaskData.estimatedHours ? parseFloat(editingTaskData.estimatedHours) : null,
        actualHours: editingTaskData.actualHours ? parseFloat(editingTaskData.actualHours) : null
      };
      await fetchAPI(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(taskData) });
      cancelEditTask();
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to update task"); }
  };

  const fetchData = () => {
    Promise.all([
      fetchAPI(`/projects/${projectId}`),
      fetchAPI(`/crm/contacts/${clientId}`).catch(() => null),
      fetchAPI("/hr/employees").catch(() => []),
      fetchAPI("/crm/contacts").catch(() => []),
    ]).then(([p, c, e, allClients]) => {
      setProject(p);
      setClientName(c?.name || "Client");
      setEmployees(Array.isArray(e) ? e : (e.employees || []));
      setClients(Array.isArray(allClients) ? allClients : []);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => { fetchData(); }, [projectId, clientId]);

  const employeeOptions = employees.filter((emp) => emp.userId).map((emp) => ({
    id: emp.userId!, name: `${emp.firstName} ${emp.lastName}`, employeeId: emp.employeeId
  }));

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editPaymentId) {
        await fetchAPI(`/projects/${projectId}/payments/${editPaymentId}`, { method: "PUT", body: JSON.stringify(paymentForm) });
      } else {
        await fetchAPI(`/projects/${projectId}/payments`, { method: "POST", body: JSON.stringify(paymentForm) });
      }
      setShowPaymentForm(false);
      setEditPaymentId(null);
      resetPaymentForm();
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to save payment"); }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("Delete this payment entry?")) return;
    try {
      await fetchAPI(`/projects/${projectId}/payments/${paymentId}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const startEditPayment = (p: ProjectPayment) => {
    setPaymentForm({
      amount: p.amount.toString(), status: p.status, category: p.category,
      label: p.label || "", taskId: p.taskId?.toString() || "",
      description: p.description || "", paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : "",
      currency: p.currency || "USD"
    });
    setEditPaymentId(p.id);
    setShowPaymentForm(true);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await fetchAPI(`/projects/${projectId}`, { method: "DELETE" });
      router.push(`/admin/clients/${clientId}`);
    } catch (err) { console.error(err); }
  };

  const startEdit = () => {
    if (!project) return;
    setForm({
      name: project.name, description: project.description || "",
      status: project.status, priority: project.priority || "medium",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      budget: project.budget?.toString() || "",
      memberIds: project.members.filter((m) => m.role !== "client").map((m) => m.user.id),
      clientId: clientId, newClient: { name: "", email: "" }
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
      clientId: form.clientId ? Number(form.clientId) : null,
      memberIds: form.memberIds
    };
    try {
      await fetchAPI(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(body) });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const toggleMember = (userId: number) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(userId) ? f.memberIds.filter(id => id !== userId) : [...f.memberIds, userId]
    }));
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getTaskStatusColor = (s: string) => {
    const c: Record<string, string> = { todo: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", review: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400", done: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" };
    return c[s] || "bg-gray-100 text-gray-600";
  };

  const getSubtaskStatusColor = (s: string) => {
    const c: Record<string, string> = { pending: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", completed: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" };
    return c[s] || "bg-gray-100 text-gray-600";
  };

  const getTimelineNodeColor = (status: string, type: "task" | "subtask") => {
    if (type === "task") {
      if (status === "done") return "bg-green-500 border-green-500";
      if (status === "in_progress" || status === "review") return "bg-blue-500 border-blue-500";
      return "bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600";
    } else {
      if (status === "completed") return "bg-green-400 border-green-400";
      if (status === "in_progress") return "bg-blue-400 border-blue-400";
      return "bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600";
    }
  };

  const getPriorityDot = (p: string) => {
    const c: Record<string, string> = { low: "bg-gray-400", medium: "bg-blue-400", high: "bg-orange-400", urgent: "bg-red-500" };
    return c[p] || "bg-gray-400";
  };

  const calcProgress = (tasks: ProjectTask[]) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100);
  };

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );

  if (!project)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found.</p>
        <Link href={`/admin/clients/${clientId}`} className="text-elvion-primary hover:underline mt-2 inline-block">Back to client</Link>
      </div>
    );

  const progress = project.tasks.length > 0 ? calcProgress(project.tasks) : (project.progress || 0);
  const daysLeft = getDaysLeft(project.endDate);
  const taskBudget = project.tasks.reduce((s, t) => s + (t.budget || 0), 0);
  const taskEstHours = project.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const taskActHours = project.tasks.reduce((s, t) => s + (t.actualHours || 0), 0);
  const overdueTasks = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clients" className="hover:text-elvion-primary">Clients</Link>
        <span>/</span>
        <Link href={`/admin/clients/${clientId}`} className="hover:text-elvion-primary">{clientName}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{statusLabels[project.status]}</span>
              <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`} title={project.priority}></div>
            </div>
            {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-gray-500">
              <span className="flex items-center gap-1"><Users size={12} /> {project.members.length} members</span>
              <span className="flex items-center gap-1"><CheckSquare size={12} /> {project.tasks.filter(t => t.status === "done").length}/{project.tasks.length} tasks</span>
              {project.budget != null && project.budget > 0 && <span className="flex items-center gap-1 text-elvion-primary"><DollarSign size={12} /> {project.budget.toLocaleString()}</span>}
              {taskEstHours > 0 && <span className="flex items-center gap-1"><Timer size={12} /> {taskActHours}/{taskEstHours}h</span>}
              {project.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(project.startDate).toLocaleDateString()}</span>}
              {daysLeft !== null && (
                <span className={`flex items-center gap-1 ${daysLeft < 0 ? "text-red-400 font-medium" : daysLeft < 7 ? "text-yellow-400" : "text-gray-400"}`}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              )}
              {overdueTasks > 0 && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {overdueTasks} overdue tasks</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startEdit} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={16} /></button>
            <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={16} /></button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-medium text-elvion-primary">{progress}%</span></div>
          <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-elvion-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-white/5 px-5 overflow-x-auto">
          {[
            { key: "tasks", label: `Timeline (${project.tasks.length})` },
            { key: "team", label: `Team (${project.members.length})` },
            { key: "budget", label: "Budget & Timeline" },
            { key: "payments", label: `Payments (${project.payments?.length || 0})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === t.key ? "border-elvion-primary text-elvion-primary" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Tasks Tab — Vertical Timeline */}
          {activeTab === "tasks" && (() => {
            const sortedTasks = [...project.tasks].sort((a, b) => {
              const aDate = a.startDate || a.dueDate || "";
              const bDate = b.startDate || b.dueDate || "";
              if (!aDate && !bDate) return 0;
              if (!aDate) return 1;
              if (!bDate) return -1;
              return new Date(aDate).getTime() - new Date(bDate).getTime();
            });

            return (
              <div>
                {/* Task Statistics Card */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50 border border-gray-200 dark:border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.tasks.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                      <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-semibold">Completed</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{project.tasks.filter(t => t.status === "done").length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{project.tasks.filter(t => t.status === "in_progress").length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                      <p className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase font-semibold">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{project.tasks.filter(t => t.status === "todo").length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-semibold">Progress</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{project.tasks.length > 0 ? Math.round((project.tasks.filter(t => t.status === "done").length / project.tasks.length) * 100) : 0}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {project.tasks.length > 0 && (
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full transition-all" style={{ width: `${project.tasks.length > 0 ? Math.round((project.tasks.filter(t => t.status === "done").length / project.tasks.length) * 100) : 0}%` }}></div>
                    </div>
                  )}
                </div>

                {/* Add Task Form */}
                {showTaskForm ? (
                  <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-elvion-dark/30 border border-gray-200 dark:border-white/10">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Create New Task</h3>
                    <form onSubmit={handleCreateTask} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          required
                          type="text"
                          placeholder="Task title *"
                          value={taskForm.title}
                          onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                        />
                        <select
                          value={taskForm.priority}
                          onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={taskForm.assigneeId}
                          onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                        >
                          <option value="">Select Assignee</option>
                          {employeeOptions.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={taskForm.startDate}
                            onChange={e => setTaskForm({ ...taskForm, startDate: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={taskForm.dueDate}
                            onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="Budget ($)"
                          step="0.01"
                          min="0"
                          value={taskForm.budget}
                          onChange={e => setTaskForm({ ...taskForm, budget: e.target.value })}
                          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Est. Hours"
                          step="0.5"
                          min="0"
                          value={taskForm.estimatedHours}
                          onChange={e => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <textarea
                        placeholder="Description (optional)"
                        rows={2}
                        value={taskForm.description}
                        onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm resize-none"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 text-sm"
                        >
                          Create Task
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowTaskForm(false); resetTaskForm(); }}
                          className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-white/20 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-elvion-primary/10 border border-elvion-primary/30 text-elvion-primary font-medium hover:bg-elvion-primary/20 transition-colors text-sm"
                  >
                    <Plus size={16} /> Add Task
                  </button>
                )}

                {project.tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No tasks yet. Create a new task to start planning your project.</p>
                ) : (
                  <div className="relative">
                    {/* Project Start */}
                    {project.startDate && (
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-4 h-4 rounded-full bg-elvion-primary ring-4 ring-elvion-primary/20 shrink-0"></div>
                        <span className="text-xs font-semibold text-elvion-primary">Project Start — {new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Vertical Timeline */}
                    <div className="relative ml-[7px]">
                      {/* Continuous vertical line */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10"></div>

                      {sortedTasks.map((task) => {
                        const isExpanded = expandedTasks.has(task.id);
                        const subtasks = task.subtasks || [];
                        const completedSubtasks = subtasks.filter(s => s.status === "completed").length;
                        const taskOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

                        return (
                          <div key={task.id} className="relative pl-8 pb-6 last:pb-0">
                            {/* Task Node Circle */}
                            <div
                              className={`absolute left-0 top-2 w-3.5 h-3.5 rounded-full -translate-x-1/2 border-2 cursor-pointer hover:scale-125 transition-transform z-10 ${getTimelineNodeColor(task.status, "task")}`}
                              onClick={() => handleTaskStatusToggle(task)}
                              title={`Click to change status (${taskStatusLabels[task.status] || task.status})`}
                            ></div>

                            {/* Task Card - Edit or View Mode */}
                            {editingTaskId === task.id ? (
                              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 p-4">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Edit Task</h3>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                      required
                                      type="text"
                                      placeholder="Task title *"
                                      value={editingTaskData.title}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    />
                                    <select
                                      value={editingTaskData.priority}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, priority: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <select
                                      value={editingTaskData.assigneeId}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, assigneeId: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    >
                                      <option value="">Unassigned</option>
                                      {employeeOptions.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                      <input
                                        type="date"
                                        value={editingTaskData.startDate}
                                        onChange={e => setEditingTaskData({ ...editingTaskData, startDate: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                                      <input
                                        type="date"
                                        value={editingTaskData.dueDate}
                                        onChange={e => setEditingTaskData({ ...editingTaskData, dueDate: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                      />
                                    </div>
                                    <input
                                      type="number"
                                      placeholder="Budget ($)"
                                      step="0.01"
                                      min="0"
                                      value={editingTaskData.budget}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, budget: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    />
                                    <input
                                      type="number"
                                      placeholder="Est. Hours"
                                      step="0.5"
                                      min="0"
                                      value={editingTaskData.estimatedHours}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, estimatedHours: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <select
                                      value={editingTaskData.status}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, status: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    >
                                      <option value="todo">To Do</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="review">Review</option>
                                      <option value="done">Done</option>
                                    </select>
                                    <input
                                      type="number"
                                      placeholder="Actual Hours"
                                      step="0.5"
                                      min="0"
                                      value={editingTaskData.actualHours}
                                      onChange={e => setEditingTaskData({ ...editingTaskData, actualHours: e.target.value })}
                                      className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateTask(task.id)}
                                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 text-sm"
                                    >
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={cancelEditTask}
                                      className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-white/20 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 dark:bg-elvion-dark/30 rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:border-gray-300 dark:hover:border-white/20 transition-colors group">
                                {/* Header Row */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => toggleTaskExpand(task.id)}>
                                    {isExpanded
                                      ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                                      : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{task.title}</h4>
                                    <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                                      <button
                                        onClick={(e) => {
                                          if (openStatusDropdown === task.id) {
                                            setOpenStatusDropdown(null);
                                            setDropdownPos(null);
                                          } else {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const spaceBelow = window.innerHeight - rect.bottom;
                                            const menuHeight = 140;
                                            setDropdownPos({
                                              top: spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4,
                                              left: rect.left,
                                            });
                                            setOpenStatusDropdown(task.id);
                                          }
                                        }}
                                        className={`text-[11px] pl-2 pr-5 py-1 rounded-full cursor-pointer border border-gray-300 dark:border-white/20 outline-none font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center gap-1 ${getTaskStatusColor(task.status)}`}
                                      >
                                        {taskStatusLabels[task.status] || task.status}
                                        <ChevronDown size={10} className="opacity-60" />
                                      </button>
                                      {openStatusDropdown === task.id && dropdownPos && (
                                        <>
                                          <div className="fixed inset-0 z-[9998]" onClick={() => { setOpenStatusDropdown(null); setDropdownPos(null); }} />
                                          <div
                                            className="fixed z-[9999] bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]"
                                            style={{ top: dropdownPos.top, left: dropdownPos.left }}
                                          >
                                            {(["todo", "in_progress", "review", "done"] as const).map(status => (
                                              <button
                                                key={status}
                                                onClick={() => { handleQuickStatusChange(task.id, status); setOpenStatusDropdown(null); setDropdownPos(null); }}
                                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                                                  task.status === status
                                                    ? "bg-elvion-primary/10 text-elvion-primary font-semibold"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                                }`}
                                              >
                                                <span className={`w-2 h-2 rounded-full ${
                                                  status === "todo" ? "bg-gray-400" :
                                                  status === "in_progress" ? "bg-blue-500" :
                                                  status === "review" ? "bg-yellow-500" :
                                                  "bg-green-500"
                                                }`} />
                                                {taskStatusLabels[status]}
                                              </button>
                                            ))}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(task.priority)}`} title={task.priority}></div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 group">
                                    {task.assignee && <span className="flex items-center gap-1"><Users size={10} />{task.assignee.name}</span>}
                                    {task.budget ? <span className="text-elvion-primary">${task.budget.toLocaleString()}</span> : null}
                                    {subtasks.length > 0 && (
                                      <span className="text-[10px]">{completedSubtasks}/{subtasks.length}</span>
                                    )}
                                    <button
                                      onClick={() => startEditTask(task)}
                                      className="p-1 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Edit task"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Delete task"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Date Row */}
                                <div className="mt-1.5 ml-5 flex items-center gap-3 text-[10px] text-gray-400">
                                  {task.startDate && <span>{new Date(task.startDate).toLocaleDateString()}</span>}
                                  {task.startDate && task.dueDate && <span>→</span>}
                                  {task.dueDate && (
                                    <span className={taskOverdue ? "text-red-400 font-medium" : ""}>
                                      {new Date(task.dueDate).toLocaleDateString()}
                                      {taskOverdue && " (overdue)"}
                                    </span>
                                  )}
                                  {task.estimatedHours ? <span className="ml-auto"><Timer size={9} className="inline mr-0.5" />{task.actualHours || 0}/{task.estimatedHours}h</span> : null}
                                </div>

                                {/* Subtask Progress Bar (compact) */}
                                {subtasks.length > 0 && (
                                  <div className="mt-2 ml-5">
                                    <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0}%` }}></div>
                                    </div>
                                  </div>
                                )}

                                {/* Expanded: Subtasks Timeline */}
                                {isExpanded && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5">
                                    {subtasks.length > 0 && (
                                      <div className="relative ml-3">
                                        {/* Subtask vertical line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-white/10"></div>

                                        {subtasks.map(subtask => (
                                          <div key={subtask.id} className="relative pl-6 pb-3 last:pb-0 group">
                                            {/* Subtask Node (smaller) */}
                                            <div
                                              className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 border-2 cursor-pointer hover:scale-150 transition-transform z-10 ${getTimelineNodeColor(subtask.status, "subtask")}`}
                                              onClick={() => handleSubtaskStatusToggle(task.id, subtask)}
                                              title={`Click to change status (${subtaskStatusLabels[subtask.status] || subtask.status})`}
                                            ></div>

                                            {/* Subtask Content */}
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{subtask.title}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${getSubtaskStatusColor(subtask.status)}`}>
                                                  {subtaskStatusLabels[subtask.status] || subtask.status}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                                {subtask.dueDate && (
                                                  <span className="text-[10px] text-gray-400">{new Date(subtask.dueDate).toLocaleDateString()}</span>
                                                )}
                                                <button onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                                                  className="p-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded">
                                                  <Trash2 size={10} />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Add Subtask */}
                                    {showSubtaskForm === task.id ? (
                                      <div className="mt-2 ml-3 flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Subtask title..."
                                          value={subtaskForm.title}
                                          onChange={e => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                                          onKeyDown={e => { if (e.key === "Enter") handleCreateSubtask(task.id); }}
                                          className="flex-1 p-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white"
                                          autoFocus
                                        />
                                        <input
                                          type="date"
                                          value={subtaskForm.dueDate}
                                          onChange={e => setSubtaskForm({ ...subtaskForm, dueDate: e.target.value })}
                                          className="p-1.5 text-[10px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white w-28"
                                        />
                                        <button onClick={() => handleCreateSubtask(task.id)}
                                          className="px-2.5 py-1.5 text-[10px] bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90">
                                          Add
                                        </button>
                                        <button onClick={() => { setShowSubtaskForm(null); setSubtaskForm({ title: "", startDate: "", dueDate: "" }); }}
                                          className="p-1 text-gray-400 hover:text-gray-600">
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setShowSubtaskForm(task.id)}
                                        className="mt-2 ml-3 flex items-center gap-1 text-[10px] text-gray-400 hover:text-elvion-primary transition-colors">
                                        <Plus size={10} /> Add subtask
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Project End */}
                    {project.endDate && (
                      <div className="flex items-center gap-3 mt-6 ml-[7px]">
                        <div className="w-4 h-4 rounded-full bg-red-400 ring-4 ring-red-400/20 shrink-0 -translate-x-1/2"></div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-red-400">Project End — {new Date(project.endDate).toLocaleDateString()}</span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                if (openProjectStatusDropdown) {
                                  setOpenProjectStatusDropdown(false);
                                  setProjectDropdownPos(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const menuHeight = 170;
                                  setProjectDropdownPos({
                                    top: spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4,
                                    left: rect.left,
                                  });
                                  setOpenProjectStatusDropdown(true);
                                }
                              }}
                              className={`text-[11px] pl-2 pr-5 py-1 rounded-full cursor-pointer border border-gray-300 dark:border-white/20 outline-none font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center gap-1 ${getStatusColor(project.status)}`}
                            >
                              {statusLabels[project.status] || project.status}
                              <ChevronDown size={10} className="opacity-60" />
                            </button>
                            {openProjectStatusDropdown && projectDropdownPos && (
                              <>
                                <div className="fixed inset-0 z-[9998]" onClick={() => { setOpenProjectStatusDropdown(false); setProjectDropdownPos(null); }} />
                                <div
                                  className="fixed z-[9999] bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[150px]"
                                  style={{ top: projectDropdownPos.top, left: projectDropdownPos.left }}
                                >
                                  {statusOptions.map(status => (
                                    <button
                                      key={status}
                                      onClick={() => { handleProjectStatusChange(status); setOpenProjectStatusDropdown(false); setProjectDropdownPos(null); }}
                                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                                        project.status === status
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Owner */}
              <div className="p-3 rounded-lg border border-elvion-primary/30 bg-elvion-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary text-xs font-bold">{project.owner.name?.charAt(0) || "?"}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{project.owner.name}</p>
                    <p className="text-[10px] text-elvion-primary font-medium">Owner</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{project.owner.email}</p>
                <p className="text-[10px] text-gray-500 mt-1">{project.tasks.filter(t => t.assignee?.id === project.owner.id).length} tasks assigned</p>
              </div>
              {/* Client */}
              {project.members.filter(m => m.role === "client" && m.user.id !== project.owner.id).map(m => (
                <div key={m.id} className="p-3 rounded-lg border border-green-400 bg-green-50 dark:bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-600 text-xs font-bold">{m.user.name?.charAt(0) || "C"}</div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">{m.user.name}</p>
                      <p className="text-[10px] text-green-600 font-medium">Client</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{m.user.email}</p>
                </div>
              ))}
              {/* Members */}
              {project.members.filter(m => m.role !== "client" && m.user.id !== project.owner.id).map(m => (
                <div key={m.id} className="p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">{m.user.name?.charAt(0) || "?"}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{m.role}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{m.user.email}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{project.tasks.filter(t => t.assignee?.id === m.user.id).length} tasks assigned</p>
                </div>
              ))}
            </div>
          )}

          {/* Budget & Timeline Tab */}
          {activeTab === "budget" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                  <p className="text-[10px] text-gray-500 uppercase">Project Budget</p>
                  <p className="text-lg font-bold text-elvion-primary">${(project.budget || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                  <p className="text-[10px] text-gray-500 uppercase">Task Budgets Total</p>
                  <p className="text-lg font-bold text-yellow-400">${taskBudget.toLocaleString()}</p>
                  {project.budget > 0 && <p className="text-[10px] text-gray-400">{Math.round((taskBudget / project.budget) * 100)}% of project budget</p>}
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                  <p className="text-[10px] text-gray-500 uppercase">Est. Hours</p>
                  <p className="text-lg font-bold text-blue-400">{taskEstHours}h</p>
                  <p className="text-[10px] text-gray-400">{taskActHours}h actual worked</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                  <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                  {project.startDate && project.endDate ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                      <p className="text-[10px] text-gray-400">{new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}</p>
                    </>
                  ) : <p className="text-sm text-gray-400">No dates set</p>}
                </div>
              </div>

              {project.tasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Budget by Team Member</h4>
                  <div className="space-y-2">
                    {(() => {
                      const byAssignee: Record<string, { name: string; budget: number; hours: number; tasks: number }> = {};
                      project.tasks.forEach(t => {
                        const key = t.assignee?.name || "Unassigned";
                        if (!byAssignee[key]) byAssignee[key] = { name: key, budget: 0, hours: 0, tasks: 0 };
                        byAssignee[key].budget += t.budget || 0;
                        byAssignee[key].hours += t.estimatedHours || 0;
                        byAssignee[key].tasks += 1;
                      });
                      return Object.values(byAssignee).sort((a, b) => b.budget - a.budget).map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-elvion-dark/30 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-elvion-primary/10 flex items-center justify-center text-[10px] font-bold text-elvion-primary">{a.name.charAt(0)}</div>
                            <span className="text-gray-900 dark:text-white">{a.name}</span>
                            <span className="text-[10px] text-gray-400">{a.tasks} tasks</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {a.hours > 0 && <span>{a.hours}h</span>}
                            <span className="text-elvion-primary font-medium">${a.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (() => {
            const payments: ProjectPayment[] = project.payments || [];
            const totalReceived = payments.filter(p => p.status === "received").reduce((s, p) => s + p.amount, 0);
            const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
            const grandTotal = totalReceived + totalPending;

            const monthlyPayments = payments.filter(p => p.category === "monthly");
            const taskPayments = payments.filter(p => p.category === "task");
            const modulePayments = payments.filter(p => p.category === "module");

            const monthlyReceived = monthlyPayments.filter(p => p.status === "received").reduce((s, p) => s + p.amount, 0);
            const monthlyPending = monthlyPayments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
            const taskReceived = taskPayments.filter(p => p.status === "received").reduce((s, p) => s + p.amount, 0);
            const taskPending = taskPayments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
            const moduleReceived = modulePayments.filter(p => p.status === "received").reduce((s, p) => s + p.amount, 0);
            const modulePending = modulePayments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);

            const monthlyGroups: Record<string, { received: number; pending: number; entries: ProjectPayment[] }> = {};
            monthlyPayments.forEach(p => {
              const key = p.label || (p.paymentDate ? new Date(p.paymentDate).toLocaleString("default", { month: "long", year: "numeric" }) : "Unknown");
              if (!monthlyGroups[key]) monthlyGroups[key] = { received: 0, pending: 0, entries: [] };
              monthlyGroups[key][p.status as "received" | "pending"] += p.amount;
              monthlyGroups[key].entries.push(p);
            });

            const taskGroups: Record<string, { received: number; pending: number; entries: ProjectPayment[] }> = {};
            taskPayments.forEach(p => {
              const key = p.label || "Untitled Task";
              if (!taskGroups[key]) taskGroups[key] = { received: 0, pending: 0, entries: [] };
              taskGroups[key][p.status as "received" | "pending"] += p.amount;
              taskGroups[key].entries.push(p);
            });

            const moduleGroups: Record<string, { received: number; pending: number; entries: ProjectPayment[] }> = {};
            modulePayments.forEach(p => {
              const key = p.label || "Untitled Module";
              if (!moduleGroups[key]) moduleGroups[key] = { received: 0, pending: 0, entries: [] };
              moduleGroups[key][p.status as "received" | "pending"] += p.amount;
              moduleGroups[key].entries.push(p);
            });

            const receivedPercent = grandTotal > 0 ? Math.round((totalReceived / grandTotal) * 100) : 0;
            const budgetReceivedPercent = project.budget ? Math.round((totalReceived / project.budget) * 100) : 0;

            return (
              <div className="space-y-6">
                {/* Grand Total Banner */}
                <div className="p-5 rounded-xl bg-linear-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-300 dark:border-green-500/30">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider flex items-center gap-2"><Banknote size={14} /> Total Payment Received</p>
                      <p className="text-4xl font-extrabold text-green-600 dark:text-green-400 mt-1">${totalReceived.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{payments.filter(p => p.status === "received").length} received payment(s) of {payments.length} total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Budget: <span className="font-semibold text-gray-700 dark:text-gray-300">${(project.budget || 0).toLocaleString()}</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">Collected: <span className="font-bold text-green-600 dark:text-green-400">{budgetReceivedPercent}%</span></p>
                      <div className="w-40 h-2 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(budgetReceivedPercent, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={14} className="text-green-500" /><span className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase">Total Received</span></div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">${totalReceived.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                    <div className="flex items-center gap-1.5 mb-1"><TrendingDown size={14} className="text-orange-500" /><span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium uppercase">Total Pending</span></div>
                    <p className="text-xl font-bold text-orange-500">${totalPending.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-1.5 mb-1"><DollarSign size={14} className="text-blue-500" /><span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">Grand Total</span></div>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-elvion-primary/5 border border-elvion-primary/20">
                    <div className="flex items-center gap-1.5 mb-1"><Banknote size={14} className="text-elvion-primary" /><span className="text-[10px] text-elvion-primary font-medium uppercase">Collection Rate</span></div>
                    <p className="text-xl font-bold text-elvion-primary">{receivedPercent}%</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark/40">
                    <p className="text-[10px] text-gray-500 uppercase font-medium flex items-center gap-1"><Calendar size={10} /> Monthly</p>
                    <div className="flex items-baseline gap-2 mt-1"><span className="text-sm font-bold text-green-500">${monthlyReceived.toLocaleString()}</span><span className="text-[10px] text-gray-400">received</span></div>
                    <div className="flex items-baseline gap-2"><span className="text-sm font-bold text-orange-500">${monthlyPending.toLocaleString()}</span><span className="text-[10px] text-gray-400">pending</span></div>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark/40">
                    <p className="text-[10px] text-gray-500 uppercase font-medium flex items-center gap-1"><CheckSquare size={10} /> Task</p>
                    <div className="flex items-baseline gap-2 mt-1"><span className="text-sm font-bold text-green-500">${taskReceived.toLocaleString()}</span><span className="text-[10px] text-gray-400">received</span></div>
                    <div className="flex items-baseline gap-2"><span className="text-sm font-bold text-orange-500">${taskPending.toLocaleString()}</span><span className="text-[10px] text-gray-400">pending</span></div>
                  </div>
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark/40">
                    <p className="text-[10px] text-gray-500 uppercase font-medium flex items-center gap-1"><FolderOpen size={10} /> Module</p>
                    <div className="flex items-baseline gap-2 mt-1"><span className="text-sm font-bold text-green-500">${moduleReceived.toLocaleString()}</span><span className="text-[10px] text-gray-400">received</span></div>
                    <div className="flex items-baseline gap-2"><span className="text-sm font-bold text-orange-500">${modulePending.toLocaleString()}</span><span className="text-[10px] text-gray-400">pending</span></div>
                  </div>
                </div>

                {/* Add Payment Button */}
                <div className="flex justify-end">
                  <button onClick={() => { resetPaymentForm(); setEditPaymentId(null); setShowPaymentForm(true); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90">
                    <Plus size={14} /> Add Payment
                  </button>
                </div>

                {/* Add/Edit Payment Form */}
                {showPaymentForm && (
                  <div className="p-4 rounded-xl border border-elvion-primary/30 bg-elvion-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={14} />{editPaymentId ? "Edit Payment" : "Add Payment"}</h4>
                      <button onClick={() => { setShowPaymentForm(false); setEditPaymentId(null); resetPaymentForm(); }} className="p-1 hover:bg-white/10 rounded"><X size={14} className="text-gray-400" /></button>
                    </div>
                    <form onSubmit={handlePaymentSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Amount *</label>
                        <input required type="number" step="0.01" min="0.01" value={paymentForm.amount}
                          onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          placeholder="0.00"
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Currency</label>
                        <select value={paymentForm.currency || "USD"} onChange={e => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm">
                          <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                          <option value="PKR">PKR</option><option value="INR">INR</option><option value="SAR">SAR</option><option value="AED">AED</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Status</label>
                        <select value={paymentForm.status} onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm">
                          <option value="received">Received</option><option value="pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Category</label>
                        <select value={paymentForm.category} onChange={e => setPaymentForm({ ...paymentForm, category: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm">
                          <option value="monthly">Monthly</option><option value="task">Task</option><option value="module">Module</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Label / Month</label>
                        <input type="text" value={paymentForm.label}
                          onChange={e => setPaymentForm({ ...paymentForm, label: e.target.value })}
                          placeholder={paymentForm.category === "monthly" ? "e.g. January 2026" : paymentForm.category === "module" ? "e.g. Module 1 – UI" : "e.g. Homepage Task"}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Payment Date</label>
                        <input type="date" value={paymentForm.paymentDate}
                          onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                      </div>
                      {paymentForm.category === "task" && (
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Link to Task</label>
                          <select value={paymentForm.taskId} onChange={e => setPaymentForm({ ...paymentForm, taskId: e.target.value })}
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm">
                            <option value="">None</option>
                            {project.tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </select>
                        </div>
                      )}
                      <div className="col-span-full">
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Description</label>
                        <input type="text" value={paymentForm.description}
                          onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
                          placeholder="Optional notes…"
                          className="w-full p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                      </div>
                      <div className="col-span-full flex gap-2 justify-end">
                        <button type="button" onClick={() => { setShowPaymentForm(false); setEditPaymentId(null); resetPaymentForm(); }}
                          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90">
                          {editPaymentId ? "Update" : "Save Payment"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Monthly Payments */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-elvion-dark/50 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> Monthly Payments</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-500 font-semibold">${monthlyReceived.toLocaleString()} received</span>
                      <span className="text-orange-500 font-semibold">${monthlyPending.toLocaleString()} pending</span>
                    </div>
                  </div>
                  {Object.keys(monthlyGroups).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-elvion-dark/30">
                          <th className="px-4 py-2 font-medium">Month</th>
                          <th className="px-4 py-2 font-medium text-green-500">Received</th>
                          <th className="px-4 py-2 font-medium text-orange-500">Pending</th>
                          <th className="px-4 py-2 font-medium">Total</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Description</th>
                          <th className="px-4 py-2"></th>
                        </tr></thead>
                        <tbody>
                          {Object.entries(monthlyGroups).map(([month, group]) => (
                            group.entries.map((p, idx) => (
                              <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 group/row">
                                {idx === 0 && (
                                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white align-top" rowSpan={group.entries.length}>
                                    <div>{month}</div>
                                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">{group.entries.length} entry(s)</div>
                                  </td>
                                )}
                                <td className="px-4 py-2.5 text-green-600 dark:text-green-400 font-medium">{p.status === "received" ? `$${p.amount.toLocaleString()}` : <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                                <td className="px-4 py-2.5 text-orange-500 font-medium">{p.status === "pending" ? `$${p.amount.toLocaleString()}` : <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                                {idx === 0 && (
                                  <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white align-top" rowSpan={group.entries.length}>
                                    ${(group.received + group.pending).toLocaleString()}
                                  </td>
                                )}
                                <td className="px-4 py-2.5 text-gray-400 text-xs">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                                <td className="px-4 py-2.5 text-gray-400 text-xs max-w-50 truncate">{p.description || "—"}</td>
                                <td className="px-4 py-2.5">
                                  <div className="hidden group-hover/row:flex gap-1 justify-end">
                                    <button onClick={() => startEditPayment(p)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded"><Edit2 size={12} /></button>
                                    <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ))}
                          <tr className="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-elvion-dark/30 font-semibold text-xs uppercase">
                            <td className="px-4 py-2 text-gray-500">Total</td>
                            <td className="px-4 py-2 text-green-600 dark:text-green-400">${monthlyReceived.toLocaleString()}</td>
                            <td className="px-4 py-2 text-orange-500">${monthlyPending.toLocaleString()}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">${(monthlyReceived + monthlyPending).toLocaleString()}</td>
                            <td colSpan={3}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-center text-gray-400 text-sm">No monthly payments recorded yet.</p>
                  )}
                </div>

                {/* Task Payments */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-elvion-dark/50 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><CheckSquare size={14} className="text-purple-500" /> Task Payments</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-500 font-semibold">${taskReceived.toLocaleString()} received</span>
                      <span className="text-orange-500 font-semibold">${taskPending.toLocaleString()} pending</span>
                    </div>
                  </div>
                  {taskPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-elvion-dark/30">
                          <th className="px-4 py-2 font-medium">Task / Label</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Description</th>
                          <th className="px-4 py-2"></th>
                        </tr></thead>
                        <tbody>
                          {taskPayments.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 group/row">
                              <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{p.label || "Task Payment"}</td>
                              <td className="px-4 py-2.5 font-bold">${p.amount.toLocaleString()}</td>
                              <td className="px-4 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "received" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"}`}>{p.status}</span></td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs max-w-50 truncate">{p.description || "—"}</td>
                              <td className="px-4 py-2.5">
                                <div className="hidden group-hover/row:flex gap-1 justify-end">
                                  <button onClick={() => startEditPayment(p)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded"><Edit2 size={12} /></button>
                                  <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-elvion-dark/30 font-semibold text-xs uppercase">
                            <td className="px-4 py-2 text-gray-500">Total</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">${(taskReceived + taskPending).toLocaleString()}</td>
                            <td className="px-4 py-2"><span className="text-green-500">${taskReceived.toLocaleString()}</span> / <span className="text-orange-500">${taskPending.toLocaleString()}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-center text-gray-400 text-sm">No task payments recorded yet.</p>
                  )}
                </div>

                {/* Module Payments */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-elvion-dark/50 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FolderOpen size={14} className="text-indigo-500" /> Module Payments</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-500 font-semibold">${moduleReceived.toLocaleString()} received</span>
                      <span className="text-orange-500 font-semibold">${modulePending.toLocaleString()} pending</span>
                    </div>
                  </div>
                  {modulePayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-elvion-dark/30">
                          <th className="px-4 py-2 font-medium">Module</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Description</th>
                          <th className="px-4 py-2"></th>
                        </tr></thead>
                        <tbody>
                          {modulePayments.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 group/row">
                              <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{p.label || "Module Payment"}</td>
                              <td className="px-4 py-2.5 font-bold">${p.amount.toLocaleString()}</td>
                              <td className="px-4 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "received" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"}`}>{p.status}</span></td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                              <td className="px-4 py-2.5 text-gray-400 text-xs max-w-50 truncate">{p.description || "—"}</td>
                              <td className="px-4 py-2.5">
                                <div className="hidden group-hover/row:flex gap-1 justify-end">
                                  <button onClick={() => startEditPayment(p)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded"><Edit2 size={12} /></button>
                                  <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-elvion-dark/30 font-semibold text-xs uppercase">
                            <td className="px-4 py-2 text-gray-500">Total</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white">${(moduleReceived + modulePending).toLocaleString()}</td>
                            <td className="px-4 py-2"><span className="text-green-500">${moduleReceived.toLocaleString()}</span> / <span className="text-orange-500">${modulePending.toLocaleString()}</span></td>
                            <td colSpan={3}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-center text-gray-400 text-sm">No module payments recorded yet.</p>
                  )}
                </div>

                {/* All Payments — Expandable */}
                {payments.length > 0 && (
                  <details className="group rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <summary className="cursor-pointer px-4 py-3 bg-gray-50 dark:bg-elvion-dark/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 select-none">
                      <ChevronRight size={14} className="group-open:rotate-90 transition-transform" /> View All {payments.length} Payment Entries
                    </summary>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-elvion-dark/30">
                          <th className="px-4 py-2 font-medium">Label</th>
                          <th className="px-4 py-2 font-medium">Category</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2"></th>
                        </tr></thead>
                        <tbody>
                          {payments.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 group/row">
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{p.label || "—"}</td>
                              <td className="px-4 py-2 capitalize text-gray-500 text-xs">{p.category}</td>
                              <td className="px-4 py-2 text-gray-400 text-xs">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                              <td className="px-4 py-2 font-bold">${p.amount.toLocaleString()}</td>
                              <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "received" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"}`}>{p.status}</span></td>
                              <td className="px-4 py-2">
                                <div className="hidden group-hover/row:flex gap-1 justify-end">
                                  <button onClick={() => startEditPayment(p)} className="p-1 text-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"><Edit2 size={12} /></button>
                                  <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}

                {payments.length === 0 && !showPaymentForm && (
                  <div className="text-center py-8 text-gray-400">
                    <CreditCard size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No payments recorded yet.</p>
                    <p className="text-xs mt-1">Click &quot;Add Payment&quot; to track received or pending payments.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Project</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Project Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Budget ($)</label><input type="number" step="0.01" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              {/* Team Members */}
              <div>
                <label className="block text-sm text-gray-500 mb-2"><UserPlus size={14} className="inline mr-1" />Team Members</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-50 overflow-y-auto p-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-elvion-dark">
                  {employeeOptions.map(emp => (
                    <label key={emp.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${form.memberIds.includes(emp.id) ? "bg-elvion-primary/10 border border-elvion-primary/30" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                      <input type="checkbox" checked={form.memberIds.includes(emp.id)} onChange={() => toggleMember(emp.id)} className="accent-elvion-primary" />
                      <div>
                        <p className="text-gray-900 dark:text-white text-xs font-medium">{emp.name}</p>
                        <p className="text-gray-400 text-[10px]">{emp.employeeId}</p>
                      </div>
                    </label>
                  ))}
                  {employeeOptions.length === 0 && <p className="text-xs text-gray-400 col-span-full text-center py-2">No employees with accounts found</p>}
                </div>
                {form.memberIds.length > 0 && <p className="text-xs text-elvion-primary mt-1">{form.memberIds.length} team member(s) selected</p>}
              </div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">Update Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
