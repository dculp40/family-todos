import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, GripVertical, Star } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const QUADRANTS = [
  {
    key: "do",
    label: "Do First",
    sublabel: "Important & Urgent",
    filter: (t) => t.important && t.urgent,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    accent: "text-red-600",
    dot: "bg-red-400",
  },
  {
    key: "schedule",
    label: "Schedule",
    sublabel: "Important & Not Urgent",
    filter: (t) => t.important && !t.urgent,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    accent: "text-amber-600",
    dot: "bg-amber-400",
  },
  {
    key: "delegate",
    label: "Delegate",
    sublabel: "Not Important & Urgent",
    filter: (t) => !t.important && t.urgent,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    accent: "text-blue-600",
    dot: "bg-blue-400",
  },
  {
    key: "eliminate",
    label: "Eliminate",
    sublabel: "Session only · drag here to dismiss",
    filter: (t) => !t.important && !t.urgent,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    accent: "text-slate-500",
    dot: "bg-slate-400",
  },
];

const QUADRANT_STATE = {
  do: { important: true, urgent: true },
  schedule: { important: true, urgent: false },
  delegate: { important: false, urgent: true },
  eliminate: { important: false, urgent: false },
};

function quadrantKeyForTask(task) {
  if (task.important && task.urgent) return "do";
  if (task.important && !task.urgent) return "schedule";
  if (!task.important && task.urgent) return "delegate";
  return "eliminate";
}

function DraggableMatrixItem({
  task,
  quadrant,
  onOpen,
  onToggleStatus,
  onTogglePriority,
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <MatrixItem
      task={task}
      quadrant={quadrant}
      onOpen={onOpen}
      onToggleStatus={onToggleStatus}
      onTogglePriority={onTogglePriority}
      listeners={listeners}
      attributes={attributes}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
}

function QuadrantColumn({
  quadrant,
  items,
  onNavigate,
  onToggleStatus,
  onTogglePriority,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant.key });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[140px] rounded-2xl border ${quadrant.border} ${quadrant.bg} p-4 transition ${
        isOver ? "ring-2 ring-midnight-200" : ""
      }`}
    >
      <div className="mb-2">
        <p className={`text-sm font-semibold ${quadrant.text}`}>
          {quadrant.label}
        </p>
        <p className={`text-[10px] ${quadrant.accent}`}>{quadrant.sublabel}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs italic text-midnight-300">Drop a task here</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((task) => (
            <DraggableMatrixItem
              key={task.id}
              task={task}
              quadrant={quadrant}
              onOpen={() => onNavigate(task.id)}
              onToggleStatus={onToggleStatus}
              onTogglePriority={onTogglePriority}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MatrixItem({
  task,
  quadrant,
  onOpen,
  onToggleStatus,
  onTogglePriority,
  listeners = {},
  attributes = {},
  setNodeRef,
  style,
  isOverlay = false,
}) {
  const Component = isOverlay ? "div" : "li";
  const className = `group flex items-center gap-2 rounded-xl bg-white/80 px-3 py-1.5 text-xs shadow-sm transition hover:shadow ${
    isOverlay ? "ring-2 ring-midnight-200" : ""
  }`;

  return (
    <Component
      ref={setNodeRef}
      style={style}
      className={className}
      data-task-id={task.id}
    >
      <button
        type="button"
        className="cursor-grab rounded-full p-1 text-midnight-300 transition hover:text-midnight-500 active:cursor-grabbing"
        aria-label="Drag to another quadrant"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${quadrant.dot}`} />
      <button
        type="button"
        onClick={onOpen}
        className={`min-w-0 flex-1 truncate text-left font-medium ${quadrant.text} hover:underline`}
      >
        {task.title}
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onTogglePriority?.(task, "important")}
          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition ${
            task.important
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-transparent bg-transparent text-midnight-300 hover:border-midnight-200 hover:bg-white"
          }`}
          title={task.important ? "Mark as not important" : "Mark as important"}
          aria-pressed={task.important}
        >
          <Star
            className={`h-3.5 w-3.5 ${task.important ? "text-amber-600" : "text-current"}`}
          />
        </button>
        <button
          type="button"
          onClick={() => onTogglePriority?.(task, "urgent")}
          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition ${
            task.urgent
              ? "border-red-300 bg-red-50 text-red-600"
              : "border-transparent bg-transparent text-midnight-300 hover:border-midnight-200 hover:bg-white"
          }`}
          title={task.urgent ? "Mark as not urgent" : "Mark as urgent"}
          aria-pressed={task.urgent}
        >
          <AlertTriangle
            className={`h-3.5 w-3.5 ${task.urgent ? "text-red-500" : "text-current"}`}
          />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onToggleStatus(task)}
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-midnight-400 opacity-0 transition hover:bg-midnight-100 group-hover:opacity-100"
      >
        Done
      </button>
    </Component>
  );
}

export function EisenhowerMatrix({ tasks, onToggleStatus, onTogglePriority }) {
  const navigate = useNavigate();
  const openTasks = tasks.filter((t) => t.status === "open");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState(null);
  const [sessionEliminated, setSessionEliminated] = useState(() => new Set());
  const activeTask = useMemo(
    () => openTasks.find((task) => task.id === activeId) || null,
    [openTasks, activeId],
  );
  const quadrants = useMemo(
    () =>
      QUADRANTS.map((quadrant) => {
        if (quadrant.key === "eliminate") {
          return {
            quadrant,
            items: openTasks.filter((t) => sessionEliminated.has(t.id)),
          };
        }

        return {
          quadrant,
          items: openTasks.filter(
            (t) => !sessionEliminated.has(t.id) && quadrant.filter(t),
          ),
        };
      }),
    [openTasks, sessionEliminated],
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    const { over, active } = event;
    if (!over) return;
    const targetKey = over.id;
    const targetConfig = QUADRANT_STATE[targetKey];
    if (!targetConfig) return;
    const task = openTasks.find((t) => t.id === active.id);
    if (!task) return;
    const currentQuadrant = sessionEliminated.has(task.id)
      ? "eliminate"
      : quadrantKeyForTask(task);
    if (currentQuadrant === targetKey) return;

    if (targetKey === "eliminate") {
      setSessionEliminated((prev) => {
        const next = new Set(prev);
        next.add(task.id);
        return next;
      });
      return;
    }

    if (sessionEliminated.has(task.id)) {
      setSessionEliminated((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }

    onTogglePriority?.(task, targetConfig);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleEliminateAction(task, fieldOrUpdates) {
    setSessionEliminated((prev) => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
    onTogglePriority?.(task, fieldOrUpdates);
  }

  function handleEliminateToggleStatus(task) {
    setSessionEliminated((prev) => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
    onToggleStatus(task);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="rounded-3xl bg-white/70 p-6 shadow-glow backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-midnight-900">
              Priority Matrix
            </h2>
            <p className="text-xs text-midnight-400">
              Open tasks sorted by importance &amp; urgency
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-midnight-400">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" /> Important
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" /> Urgent
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quadrants.map(({ quadrant, items }) => (
            <QuadrantColumn
              key={quadrant.key}
              quadrant={quadrant}
              items={items}
              onNavigate={(id) => navigate(`/tasks/${id}`)}
              onToggleStatus={
                quadrant.key === "eliminate"
                  ? handleEliminateToggleStatus
                  : onToggleStatus
              }
              onTogglePriority={
                quadrant.key === "eliminate"
                  ? handleEliminateAction
                  : onTogglePriority
              }
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <MatrixItem
            task={activeTask}
            quadrant={
              QUADRANTS.find(
                (q) =>
                  q.key ===
                  (sessionEliminated.has(activeTask.id)
                    ? "eliminate"
                    : quadrantKeyForTask(activeTask)),
              ) || QUADRANTS[0]
            }
            onOpen={() => navigate(`/tasks/${activeTask.id}`)}
            onToggleStatus={onToggleStatus}
            onTogglePriority={onTogglePriority}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
