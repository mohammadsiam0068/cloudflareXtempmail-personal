import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Mail, RefreshCcw, QrCode, Link2, X, Download, Timer } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import EmailInbox from "@/components/EmailInbox";
import EmailViewer from "@/components/EmailViewer";
import { EmailMessage } from "@/lib/tempmail-api";
import { buildShareUrl } from "@/lib/share";

interface InboxViewProps {
  email: string | null;
  createdAt: number | null;
  lifetimeMs: number;
  messages: EmailMessage[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenMessage: (id: string) => void;
  selectedMessage: EmailMessage | null;
  onBack: () => void;
  onRegenerate: () => void;
}

function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "0:00";
  const totalSec = Math.floor(remainingMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const InboxView = ({
  email,
  createdAt,
  lifetimeMs,
  messages,
  isRefreshing,
  onRefresh,
  onOpenMessage,
  selectedMessage,
  onBack,
  onRegenerate,
}: InboxViewProps) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [spinRegen, setSpinRegen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const shareUrl = email ? buildShareUrl(email) : "";

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!qrOpen || !shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 640, margin: 2 })
      .then(setQrData)
      .catch(() => toast.error("Failed to generate QR code"));
  }, [qrOpen, shareUrl]);

  const handleCopy = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setSpinRegen(true);
    onRegenerate();
    setTimeout(() => setSpinRegen(false), 600);
  };

  const handleDownloadQr = () => {
    if (!qrData) return;
    const a = document.createElement("a");
    a.href = qrData;
    a.download = `${(email || "address").replace(/[^a-z0-9]/gi, "_")}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("QR code downloaded");
  };

  if (selectedMessage) {
    return <EmailViewer message={selectedMessage} onBack={onBack} />;
  }

  const remainingMs = createdAt ? createdAt + lifetimeMs - now : 0;
  const countdownLabel = formatCountdown(remainingMs);

  const actions = [
    {
      label: "Copy address",
      icon: copied ? Check : Copy,
      onClick: handleCopy,
      accent: true,
    },
    { label: "Change address", icon: RefreshCcw, onClick: handleRegenerate, spin: spinRegen },
    { label: "Show QR code", icon: QrCode, onClick: () => setQrOpen(true) },
    { label: "Copy share link", icon: linkCopied ? Check : Link2, onClick: handleCopyLink },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Email address card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden glow-card"
      >
        <div className="flex items-center gap-3 p-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-0.5">
              Your address
            </p>
            <p className="font-mono text-sm text-foreground break-all leading-snug">
              {email || "Loading..."}
            </p>
          </div>
        </div>

        {createdAt && (
          <div className="flex items-center gap-1.5 px-3.5 pb-2.5">
            <Timer className="w-3 h-3 text-amber-500/80" />
            <span className="text-[10px] font-mono text-amber-500/80 font-medium">
              New address in {countdownLabel}
            </span>
          </div>
        )}

        {/* Action bar */}
        <div className="grid grid-cols-4 gap-2 px-3 pb-3 pt-1 border-t border-border/50">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              aria-label={a.label}
              className={`h-11 mt-2 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                a.accent
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              }`}
            >
              <a.icon className={`w-4 h-4 ${a.spin ? "animate-spin" : ""}`} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Inbox list */}
      <EmailInbox
        messages={messages}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onOpenMessage={onOpenMessage}
        selectedMessage={null}
        onBack={onBack}
      />

      {/* QR modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs bg-card border border-border rounded-3xl p-5 text-center glow-card"
            >
              <button
                onClick={() => setQrOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-foreground mb-1">Share address</p>
              <p className="text-[11px] text-muted-foreground mb-4">
                Scan to open this inbox
              </p>
              {qrData ? (
                <button
                  onClick={handleDownloadQr}
                  className="block w-full rounded-2xl overflow-hidden bg-white p-3 active:scale-95 transition-transform"
                  aria-label="Download QR code"
                >
                  <img src={qrData} alt={`QR code for ${email}`} className="w-full h-auto" />
                </button>
              ) : (
                <div className="w-full aspect-square rounded-2xl bg-secondary animate-pulse" />
              )}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Download className="w-3 h-3" /> Tap the QR to download
              </p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground break-all">
                {email}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InboxView;
