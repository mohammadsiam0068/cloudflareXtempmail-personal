import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  adminLogin,
  adminFetchAllInboxes,
  adminFetchMessages,
  fetchMessage,
  AdminInboxSummary,
  EmailMessage,
} from "@/lib/tempmail-api";
import EmailInbox from "@/components/EmailInbox";
import EmailViewer from "@/components/EmailViewer";
import { ArrowLeft, Shield, LogOut } from "lucide-react";
import { timeAgo } from "@/lib/time";

const SESSION_KEY = "ahcmail_admin_pass";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inboxes, setInboxes] = useState<AdminInboxSummary[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [manualEmail, setManualEmail] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadInboxes();
  }, [authed]);

  const loadInboxes = async () => {
    setRefreshing(true);
    const data = await adminFetchAllInboxes(password);
    setInboxes(data);
    setRefreshing(false);
  };

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    const ok = await adminLogin(password);
    setLoading(false);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, password);
      setAuthed(true);
      toast.success("Welcome, admin");
    } else {
      toast.error("Wrong password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPassword("");
    setInboxes([]);
    setSelectedEmail(null);
  };

  const openInbox = async (email: string) => {
    setSelectedEmail(email);
    setSelectedMessage(null);
    const msgs = await adminFetchMessages(password, email);
    setMessages(msgs);
  };

  const openMessage = async (id: string) => {
    if (!selectedEmail) return;
    const msg = await fetchMessage(selectedEmail, id);
    if (msg) setSelectedMessage(msg);
  };

  const handleManualOpen = () => {
    const trimmed = manualEmail.trim();
    if (!trimmed) return;
    openInbox(trimmed);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 glow-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Admin Access</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            className="w-full bg-secondary rounded-xl px-4 py-3 text-sm mb-3 outline-none border border-border focus:border-primary"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  if (selectedEmail) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-md relative min-h-screen bg-background md:border-x md:border-border flex flex-col">
          <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedEmail(null);
                setSelectedMessage(null);
              }}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              All inboxes
            </button>
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
              {selectedEmail}
            </span>
          </div>

          <main className="flex-1 overflow-y-auto pb-8">
            {selectedMessage ? (
              <EmailViewer message={selectedMessage} onBack={() => setSelectedMessage(null)} />
            ) : (
              <div className="px-4 py-4">
                <EmailInbox
                  messages={messages}
                  isRefreshing={false}
                  onRefresh={() => openInbox(selectedEmail)}
                  onOpenMessage={openMessage}
                  selectedMessage={null}
                  onBack={() => {}}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md relative min-h-screen bg-background md:border-x md:border-border flex flex-col">
        <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-bold">Admin — All Inboxes</h1>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualOpen()}
              placeholder="Enter any email to force-open"
              className="flex-1 bg-secondary rounded-xl px-3 py-2 text-xs font-mono outline-none border border-border focus:border-primary"
            />
            <button
              onClick={handleManualOpen}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-xs font-semibold active:scale-95 transition-all"
            >
              Open
            </button>
          </div>

          <button
            onClick={loadInboxes}
            disabled={refreshing}
            className="mb-3 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {inboxes.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No inboxes yet
              </div>
            ) : (
              inboxes.map((inbox) => (
                <button
                  key={inbox.to_address}
                  onClick={() => openInbox(inbox.to_address)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{inbox.to_address}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {timeAgo(inbox.last_received)}
                    </p>
                  </div>
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-mono shrink-0 ml-2">
                    {inbox.count}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
