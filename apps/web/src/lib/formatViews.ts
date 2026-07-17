/**
 * Format a number into Instagram-style compact notation.
 * 
 * Examples:
 *   0      → "0"
 *   999    → "999"
 *   1000   → "1K"
 *   1234   → "1.2K"
 *   10500  → "10.5K"
 *   100000 → "100K"
 *   1000000 → "1M"
 *   1500000 → "1.5M"
 *   1000000000 → "1B"
 */
export function formatViews(count: number): string {
  if (count < 0) count = 0;

  if (count < 1000) {
    return count.toString();
  }

  if (count < 1_000_000) {
    const k = count / 1000;
    // Show one decimal only if it's meaningful (not .0)
    return k >= 100
      ? `${Math.floor(k)}K`
      : k >= 10
        ? `${Math.floor(k * 10) / 10}K`.replace(/\.0K$/, "K")
        : `${Math.floor(k * 10) / 10}K`.replace(/\.0K$/, "K");
  }

  if (count < 1_000_000_000) {
    const m = count / 1_000_000;
    return m >= 100
      ? `${Math.floor(m)}M`
      : m >= 10
        ? `${Math.floor(m * 10) / 10}M`.replace(/\.0M$/, "M")
        : `${Math.floor(m * 10) / 10}M`.replace(/\.0M$/, "M");
  }

  const b = count / 1_000_000_000;
  return b >= 100
    ? `${Math.floor(b)}B`
    : `${Math.floor(b * 10) / 10}B`.replace(/\.0B$/, "B");
}
