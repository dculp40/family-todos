import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Plus, Search } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { EisenhowerMatrix } from "../components/EisenhowerMatrix.jsx";
import { TaskCard } from "../components/TaskCard.jsx";

export function TaskListPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(params.get("q") || "");
  const sessionClosedRef = useRef(new Map());

  const statusParam = params.get("status") ?? "open";
  const apiStatus = statusParam === "all" ? undefined : statusParam;

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const query = search.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.notes && task.notes.toLowerCase().includes(query)) ||
        (task.opener_name && task.opener_name.toLowerCase().includes(query)),
    );
  }, [search, tasks]);

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await api.listTasks({ token, status: apiStatus });
        if (!cancelled) {
          let merged = data;
          if (statusParam === "open" && sessionClosedRef.current.size > 0) {
            const fetchedIds = new Set(data.map((t) => t.id));
            const sessionClosed = [...sessionClosedRef.current.values()].filter(
              (t) => !fetchedIds.has(t.id),
            );
            merged = [...data, ...sessionClosed];
          }
          setTasks(merged);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to fetch tasks");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchTasks();

    return () => {
      cancelled = true;
    };
  }, [token, apiStatus, statusParam]);

  function updateStatus(nextStatus) {
    setError(null);
    setLoading(true);
    params.set("status", nextStatus);
    setParams(params, { replace: true });
  }

  async function handleToggle(task) {
    try {
      setError(null);
      const newStatus = task.status === "open" ? "closed" : "open";
      const updated = await api.updateTask(
        task.id,
        { status: newStatus },
        token,
      );

      if (newStatus === "closed") {
        sessionClosedRef.current.set(task.id, updated);
      } else {
        sessionClosedRef.current.delete(task.id);
      }

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message || "Unable to update task");
    }
  }

  async function handleTogglePriority(task, fieldOrUpdates) {
    const updates =
      typeof fieldOrUpdates === "string"
        ? { [fieldOrUpdates]: !task[fieldOrUpdates] }
        : fieldOrUpdates;
    try {
      setError(null);
      const updated = await api.updateTask(task.id, updates, token);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message || "Unable to update priority");
    }
  }

  async function handleDelete(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      setError(null);
      await api.deleteTask(task.id, token);
      setTasks((items) => items.filter((item) => item.id !== task.id));
    } catch (err) {
      setError(err.message || "Unable to delete task");
    }
  }

  const showMatrix = !loading && tasks.length > 0;

  return (
    <div className="space-y-8">
      {showMatrix && (
        <EisenhowerMatrix
          tasks={tasks}
          onToggleStatus={handleToggle}
          onTogglePriority={handleTogglePriority}
        />
      )}

      <div className="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full bg-midnight-50 p-1 text-sm font-medium text-midnight-600">
            {[
              { label: "Open", value: "open" },
              { label: "Closed", value: "closed" },
              { label: "All", value: "all" },
            ].map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => updateStatus(option.value)}
                className={`rounded-full px-4 py-2 transition ${
                  statusParam === option.value
                    ? "bg-white text-midnight-900 shadow"
                    : "text-midnight-500 hover:text-midnight-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-300" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-full border border-transparent bg-midnight-50 py-2 pl-10 pr-4 text-sm text-midnight-800 outline-none ring-2 ring-transparent transition focus:border-midnight-200 focus:bg-white focus:ring-midnight-200"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-3xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-midnight-400" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-midnight-200 bg-white/60 px-8 py-12 text-center">
            <p className="font-display text-xl text-midnight-800">
              No tasks yet
            </p>
            <p className="mt-2 text-sm text-midnight-500">
              Start by creating a task. You can assign yourself as the opener.
            </p>
            <button
              type="button"
              onClick={() => navigate("/tasks/new")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-midnight-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-midnight-800"
            >
              <Plus className="h-4 w-4" /> Create one now
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggle}
                onTogglePriority={handleTogglePriority}
                onEdit={() => navigate(`/tasks/${task.id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
