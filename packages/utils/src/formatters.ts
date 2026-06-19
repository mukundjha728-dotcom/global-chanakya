export function formatDate(date: Date | string | number | null | undefined, format: "short" | "long" | "standard" = "standard"): string {
  if (!date) return "";
  const d = new Date(date);
  
  if (format === "short") {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  if (format === "long") {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
