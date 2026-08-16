import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Leaf, Pencil, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DOMAINS } from "@/lib/tempmail-api";

export type EmailMode = "random" | "natural" | "custom";

interface NewViewProps {
  mode: EmailMode;
  onModeChange: (mode: EmailMode) => void;
  onGenerate: () => void;
  onCustomGenerate: (username: string, domain: string) => void;
}

const modes: {
  id: EmailMode;
  label: string;
  description: string;
  icon: typeof Shuffle;
  color: string;
  bg: string;
}[] = [
  {
    id: "random",
    label: "Random",
    description: "Fully randomized letters & numbers",
    icon: Shuffle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "natural",
    label: "Natural",
    description: "Real name + random digits",
    icon: Leaf,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Your own username & domain",
    icon: Pencil,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const NewView = ({ mode, onModeChange, onGenerate, onCustomGenerate }: NewViewProps) => {
  const [customName, setCustomName] = useState("");
  const [customDomain, setCustomDomain] = useState(DOMAINS[0]);

  const handleCustomSubmit = () => {
    const name = customName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (!name) {
      toast.error("Please enter a valid name");
      return;
    }
    onCustomGenerate(name, customDomain);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 pb-1"
      >
        <h2 className="text-2xl font-bold font-display tracking-tight mb-1">
          New Email
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose how to generate your new address
        </p>
      </motion.div>

      {/* Mode Cards */}
      <div className="space-y-2.5">
        {modes.map((m, i) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onModeChange(m.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left active:scale-[0.98] ${
                isActive
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 ${m.color}`} strokeWidth={2.3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold font-display">{m.label}</span>
                  {isActive && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? "text-primary" : "text-muted-foreground/40"
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Custom Input */}
      <AnimatePresence mode="wait">
        {mode === "custom" ? (
          <motion.div
            key="custom-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Username
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="john.doe"
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Domain
                </label>
                <select
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      @{d}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCustomSubmit}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 glow-primary"
              >
                <Sparkles className="w-4 h-4" />
                Create Address
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="generate-btn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onGenerate}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 glow-primary"
          >
            <Sparkles className="w-4 h-4" />
            Generate New Address
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewView;
