import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, LogOut, LucideIcon } from "lucide-react";
import { UserStats } from "@/types/simulation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  navItems: { id: any; icon: LucideIcon; label: string }[];
  displayName: string;
  userEmail: string;
  sidebarAvatar: string | null;
  userStats: UserStats | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  navItems,
  displayName,
  userEmail,
  sidebarAvatar,
  userStats,
  onLogout,
}) => {
  return (
    <aside className="w-20 lg:w-72 bg-card border-r border-border flex flex-col shrink-0 z-40 transition-all duration-300">
      <div className="p-8 flex items-center gap-4 h-24 border-b border-border/50">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform">
          <span className="text-primary-foreground font-black text-lg text-center">P</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-black text-2xl text-foreground tracking-tighter leading-none italic">PULZU</h1>
          <p className="text-[9px] font-black text-primary tracking-[0.3em] uppercase mt-1.5 opacity-80">The Preceptor</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all group relative",
              activeTab === id 
                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 transition-transform", activeTab === id ? "text-primary-foreground" : "text-primary")} />
            <span className="hidden lg:block tracking-tight">{label}</span>
            {activeTab === id && (
              <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-primary-foreground/30 rounded-r-full lg:hidden" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-border space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center">
            {sidebarAvatar ? (
              <img src={sidebarAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{displayName || userEmail}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                {userStats?.currentLevel || "Médico"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ThemeToggle />
          <button 
            onClick={onLogout}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
