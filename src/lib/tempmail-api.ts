export const DOMAINS = [
  "echoinbox.eu.cc", "echomail.eu.cc", "echotemp.eu.cc", "mailecho.eu.cc", "mailr.eu.cc","mailrly.eu.cc","multisms.eu.cc","tapmail.eu.cc","telegramtg.eu.cc"];

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface TempEmail {
  address: string;
  domain: string;
  createdAt: number;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
}

export interface EmailMessage {
  id: string;
  from_address: string;
  from_name: string;
  to_address: string;
  subject: string;
  preview: string;
  text_content?: string;
  html_content?: string;
  received_at: string;
  is_read: boolean;
  has_attachments: boolean;
  attachments?: EmailAttachment[];
}

const DOMAIN_PREF_KEY = "ahcmail_selected_domains";

export function getSelectedDomains(): string[] {
  try {
    const raw = localStorage.getItem(DOMAIN_PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      const valid = parsed.filter((d) => DOMAINS.includes(d));
      if (valid.length > 0) return valid;
    }
  } catch {}
  return [...DOMAINS];
}

export function setSelectedDomains(domains: string[]) {
  const valid = domains.filter((d) => DOMAINS.includes(d));
  const toSave = valid.length > 0 ? valid : [...DOMAINS];
  localStorage.setItem(DOMAIN_PREF_KEY, JSON.stringify(toSave));
}

function getActiveDomains(): string[] {
  return getSelectedDomains();
}

function pickRandomDomain(): string {
  const active = getActiveDomains();
  return active[Math.floor(Math.random() * active.length)];
}

function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateTempEmail(): TempEmail {
  const username = generateRandomString(10);
  const domain = pickRandomDomain();
  return { address: `${username}@${domain}`, domain, createdAt: Date.now() };
}

let namesCache: string[] | null = null;

async function loadNames(): Promise<string[]> {
  if (namesCache) return namesCache;
  try {
    const res = await fetch("/names.json");
    namesCache = await res.json();
    return namesCache!;
  } catch {
    return ["user", "mail", "temp", "inbox"];
  }
}

export async function generateNaturalEmail(): Promise<TempEmail> {
  const names = await loadNames();
  const name = names[Math.floor(Math.random() * names.length)].toLowerCase();
  const digits = Math.floor(Math.random() * 900) + 100;
  const username = `${name}${digits}`;
  const domain = pickRandomDomain();
  return { address: `${username}@${domain}`, domain, createdAt: Date.now() };
}

export function generateCustomEmail(username: string, domain: string): TempEmail {
  return { address: `${username}@${domain}`, domain, createdAt: Date.now() };
}

const STORAGE_KEY = "ahcmail_current_email";
const STORAGE_MODE_KEY = "ahcmail_email_mode";

export function saveEmailToStorage(email: TempEmail, mode: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(email));
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function loadEmailFromStorage(): { email: TempEmail; mode: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const mode = localStorage.getItem(STORAGE_MODE_KEY) || "random";
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.createdAt) parsed.createdAt = Date.now();
      return { email: parsed, mode };
    }
  } catch {}
  return null;
}

export function clearEmailStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);
}

export async function fetchMessages(email: string): Promise<EmailMessage[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/messages?email=${encodeURIComponent(email)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchMessage(email: string, id: string): Promise<EmailMessage | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/messages/${id}?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getAttachmentUrl(emailId: string, attachmentId: string): string {
  return `${API_BASE}/api/messages/${emailId}/attachments/${attachmentId}`;
}

export async function deleteEmail(email: string): Promise<void> {
  if (!API_BASE) return;
  try {
    await fetch(`${API_BASE}/api/messages?email=${encodeURIComponent(email)}`, { method: "DELETE" });
  } catch {}
}

export interface AdminInboxSummary {
  to_address: string;
  count: number;
  last_received: string;
}

export async function adminLogin(password: string): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/api/admin/all`, {
      headers: { "X-Admin-Password": password },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminFetchAllInboxes(password: string): Promise<AdminInboxSummary[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/all`, {
      headers: { "X-Admin-Password": password },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function adminFetchMessages(password: string, email: string): Promise<EmailMessage[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/api/admin/messages?email=${encodeURIComponent(email)}`, {
      headers: { "X-Admin-Password": password },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
