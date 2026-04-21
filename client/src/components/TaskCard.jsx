import { AlertTriangle, CheckCircle2, Circle, Star, User2 } from "lucide-react";

export function TaskCard({
  task,
  onToggleStatus,
  onTogglePriority,
  onEdit,
  onDelete,
}) {
  const isClosed = task.status === "closed";
  const primaryLabel = isClosed ? "Closed" : "Opened";
  const actor = isClosed ? task.closer_name : task.opener_name;

  return (
    <article className="group flex items-center gap-4 rounded-2xl border border-midnight-100 bg-white/90 px-4 py-3 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onToggleStatus(task)}
        className="shrink-0"
        title={isClosed ? "Reopen" : "Mark done"}
      >
        {isClosed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-midnight-300 hover:text-midnight-500 transition" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2
            className={`truncate font-display text-base font-semibold ${isClosed ? "text-midnight-400 line-through" : "text-midnight-900"}`}
          >
            {task.title}
          </h2>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isClosed
                ? "bg-green-50 text-green-700"
                : "bg-midnight-50 text-midnight-600"
            }`}
          >
            {isClosed ? "Closed" : "Open"}
          </span>
          <button
            type="button"
            onClick={() => onTogglePriority?.(task, "important")}
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
              task.important
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-midnight-50 text-midnight-400 hover:bg-midnight-100"
            }`}
            title={
              task.important ? "Mark as not important" : "Mark as important"
            }
            aria-pressed={task.important}
          >
            <Star
              className={`h-3 w-3 ${task.important ? "text-amber-600" : "text-midnight-300"}`}
            />
            Imp
          </button>
          <button
            type="button"
            onClick={() => onTogglePriority?.(task, "urgent")}
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
              task.urgent
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-midnight-50 text-midnight-400 hover:bg-midnight-100"
            }`}
            title={task.urgent ? "Mark as not urgent" : "Mark as urgent"}
            aria-pressed={task.urgent}
          >
            <AlertTriangle
              className={`h-3 w-3 ${task.urgent ? "text-red-500" : "text-midnight-300"}`}
            />
            Urg
          </button>
        </div>

        {task.notes && (
          <p className="mt-0.5 truncate text-sm text-midnight-500">
            {task.notes}
          </p>
        )}

        <p className="mt-1 flex items-center gap-1 text-xs text-midnight-400">
          <User2 className="h-3 w-3" />
          <span>
            {primaryLabel} by {actor ?? "Unknown"}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-full border border-transparent bg-white px-3 py-1 text-xs font-semibold text-midnight-700 shadow-sm transition hover:border-midnight-200"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-full border border-transparent bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 shadow-sm transition hover:border-red-200"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
