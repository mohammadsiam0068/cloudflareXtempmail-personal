// Timezone-aware email date helpers.
// Visitor timezone auto-detected via Intl; falls back to Asia/Dhaka (UTC+6).

const FALLBACK_TZ = "Asia/Dhaka"; // UTC+6

export function getUserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {
    // ignore
  }
  return FALLBACK_TZ;
}

// Backend may send timestamps without an explicit timezone marker
// (e.g. "2026-03-09 10:26:42"). Treat those as UTC so the visitor's
// local timezone conversion is correct.
export function parseEmailDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);
  let s = String(input).trim();
  const hasTZ = /Z$|[+-]\d{2}:?\d{2}$/.test(s);
  if (!hasTZ) {
    // Normalise "YYYY-MM-DD HH:mm:ss" to ISO and assume UTC.
    s = s.replace(" ", "T");
    // Trim fractional beyond ms if present
    s = s.replace(/(\.\d{3})\d+/, "$1");
    s += "Z";
  }
  return new Date(s);
}

export function timeAgo(input: string | number | Date): string {
  const d = parseEmailDate(input);
  const diff = Date.now() - d.getTime();
  if (isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatEmailDate(input: string | number | Date): string {
  const d = parseEmailDate(input);
  if (isNaN(d.getTime())) return "";
  try {
    return d.toLocaleString(undefined, {
      timeZone: getUserTimeZone(),
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return d.toLocaleString();
  }
}
