export function formatPostedTime(dateString: string) {
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return posted.toLocaleDateString();
}

export function formatPrice(value: number | null | undefined) {
  if (value == null) return "Price on request";

  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(value);
}