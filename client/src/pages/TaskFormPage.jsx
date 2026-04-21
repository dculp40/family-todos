import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2, Save, Star } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { formatDateTime } from "../utils/dates.js";

const EMPTY_FORM = {
  title: "",
  notes: "",
  status: "open",
  important: false,
  urgent: false,
};

export function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    api
      .getTask(id, token)
      .then((data) => {
        if (cancelled) return;
        setForm({
          title: data.title,
          notes: data.notes || "",
          status: data.status,
          important: !!data.important,
          urgent: !!data.urgent,
        });
        setMeta(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load task");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isEdit) {
        const updated = await api.updateTask(id, form, token);
        setMeta(updated);
      } else {
        await api.createTask(
          {
            title: form.title,
            notes: form.notes,
            important: form.important,
            urgent: form.urgent,
          },
          token,
        );
      }
      navigate("/tasks");
    } catch (err) {
      setError(err.message || "Unable to save task");
    } finally {
      setSaving(false);
    }
  }

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-midnight-600 shadow hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-3xl bg-white/80 p-8 shadow-glow backdrop-blur">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-midnight-400">
            {isEdit ? "Update" : "Create"} task
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-midnight-900">
            {isEdit ? "Edit task details" : "Add something to the family board"}
          </h1>
          <p className="mt-2 text-sm text-midnight-500">
            Tasks start open and record who created or closed them
            automatically.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-midnight-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-midnight-700">
                Title
              </span>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-base text-midnight-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-midnight-200 focus:ring-midnight-200"
                placeholder="Grocery run for Saturday"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-midnight-700">
                Notes
              </span>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={5}
                className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-midnight-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-midnight-200 focus:ring-midnight-200"
                placeholder="List the details, supplies, or context for Allie."
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-midnight-700">
                Priority
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, important: !prev.important }))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    form.important
                      ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
                      : "bg-midnight-50 text-midnight-500 hover:bg-midnight-100"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" /> Important
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, urgent: !prev.urgent }))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    form.urgent
                      ? "bg-red-100 text-red-800 ring-2 ring-red-300"
                      : "bg-midnight-50 text-midnight-500 hover:bg-midnight-100"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Urgent
                </button>
              </div>
            </div>

            {isEdit && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-midnight-700">
                  Status
                </span>
                <div className="flex gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: option.value }))
                      }
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        form.status === option.value
                          ? "bg-midnight-900 text-white shadow"
                          : "bg-midnight-50 text-midnight-600 hover:bg-midnight-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-midnight-400">
                  Closing the task will record you ({user?.displayName}) as the
                  closer when you save.
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-3xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-midnight-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-midnight-900/20 transition hover:bg-midnight-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />{" "}
              {saving ? "Saving" : isEdit ? "Save changes" : "Create task"}
            </button>
          </form>
        )}

        {isEdit && meta && (
          <div className="mt-10 grid gap-4 rounded-3xl border border-midnight-100 bg-white/80 p-6 text-sm text-midnight-600 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-midnight-400">
                Opened by
              </p>
              <p className="mt-1 font-medium text-midnight-800">
                {meta.opener_name || "Unknown"}
              </p>
              <p>{formatDateTime(meta.opened_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-midnight-400">
                Closed by
              </p>
              <p className="mt-1 font-medium text-midnight-800">
                {meta.closer_name || "—"}
              </p>
              <p>{formatDateTime(meta.closed_at)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
