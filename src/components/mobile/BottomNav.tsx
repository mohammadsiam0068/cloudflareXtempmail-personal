import { motion } from "framer-motion";
import { Inbox, Sparkles, Settings } from "lucide-react";

export type Tab = "inbox" | "new" | "settings";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  unreadCount?: number;
}

const tabs: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "new", label: "Generate", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

const BottomNav = ({ active, onChange, unreadCount = 0 }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-background/85 backdrop-blur-xl border-t border-border glow-nav">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex-1 h-full flex items-center justify-center group active:scale-95 transition-transform"
              aria-label={tab.label}
            >
              <div className="flex flex-col items-center gap-1 relative">
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -inset-x-4 -inset-y-2 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {tab.id === "inbox" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold font-mono">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors relative ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
