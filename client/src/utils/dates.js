export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value + (value.endsWith("Z") ? "" : "Z"));
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value) {
  if (!value) return "—";
  const date = new Date(value + (value.endsWith("Z") ? "" : "Z"));
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
