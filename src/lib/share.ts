export function encodeEmailParam(email: string): string {
  try {
    return btoa(unescape(encodeURIComponent(email)));
  } catch {
    return "";
  }
}

export function decodeEmailParam(value: string): string | null {
  try {
    const decoded = decodeURIComponent(escape(atob(value)));
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(email: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?email=${encodeURIComponent(encodeEmailParam(email))}`;
}
