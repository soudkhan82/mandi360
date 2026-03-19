export function formatPostedTime(value?: string | null): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();

  if (diffMs < 60 * 1000) return "Just now";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(
  price?: number | string | null,
  unit?: string | null,
): string {
  if (price === null || price === undefined || price === "") {
    return "Price on call";
  }

  const numericPrice =
    typeof price === "number" ? price : Number(String(price).replace(/,/g, ""));

  if (Number.isNaN(numericPrice)) {
    return "Price on call";
  }

  const formatted = `PKR ${numericPrice.toLocaleString("en-PK")}`;

  return unit && unit.trim().length > 0
    ? `${formatted} / ${unit.trim()}`
    : formatted;
}
