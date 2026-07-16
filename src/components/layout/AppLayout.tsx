import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Activity, Users, BrainCircuit, ShieldAlert, Lock, ScrollText,
  FileBarChart2, Settings, Search, Bell, ShieldCheck, LogOut, Sparkles, Play, X, ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AICopilot } from "./AICopilot";
import { useAegis } from "@/lib/aegis-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/users", label: "Users", icon: Users },
  { to: "/risk-engine", label: "AI Risk Engine", icon: BrainCircuit },
  { to: "/incidents", label: "Incident Investigation", icon: ShieldAlert },
  { to: "/access", label: "Access Control", icon: Lock },
  { to: "/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = nav.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));
  const { auth, logout, notifications, unreadCount, markAllRead, markRead, users, incidents, audit, runDemo, demoRunning } = useAegis();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return { users: [], incidents: [], logs: [] };
    const s = q.toLowerCase();
    return {
      users: users.filter(u => (u.name + u.role + u.department + u.email + u.id).toLowerCase().includes(s)).slice(0, 5),
      incidents: incidents.filter(i => (i.id + i.title + i.subject).toLowerCase().includes(s)).slice(0, 5),
      logs: audit.filter(l => (l.action + l.resource + l.user).toLowerCase().includes(s)).slice(0, 5),
    };
  }, [q, users, incidents, audit]);

  const openNotification = (n: typeof notifications[number]) => {
    markRead(n.id);
    setBellOpen(false);
    if (n.incidentId) navigate({ to: "/incidents" });
  };

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border/60 bg-sidebar/90 backdrop-blur-md sticky top-0 h-screen flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border/60">
          <div className="size-9 rounded-lg grid place-items-center bg-primary/10 glow-cyan">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-[15px]">
              Aegis<span className="text-primary text-glow">IQ</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Privileged Access AI
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Security Operations
          </div>
          {nav.map((n) => {
            const isActive = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                  isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary shadow-[0_0_10px_var(--primary)]" />
                )}
                <n.icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/60">
          <div className="panel p-3 relative overflow-hidden scanline">
            <span className="scanline-bar" />
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-success pulse-dot-inner" />
                <span className="relative inline-flex rounded-full size-2 bg-success" />
              </span>
              <span className="text-foreground/90">SOC Feed</span>
              <span className="ml-auto text-muted-foreground">LIVE</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              Ingesting 12,842 events/s across 6 data planes.
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 bg-background/70 backdrop-blur-md sticky top-0 z-40 flex items-center gap-4 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Bank of Maharashtra</span>
            <span className="text-border">/</span>
            <span className="text-foreground">{active?.label ?? "AegisIQ"}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={runDemo}
              disabled={demoRunning}
              className="h-9 px-3 rounded-lg text-sm inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 border border-primary/40 text-primary hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles className="size-4" /> {demoRunning ? "Demo running…" : "Demo Scenario"}
            </button>

            <button onClick={() => setSearchOpen(true)} className="relative flex items-center gap-2 h-9 w-72 px-3 rounded-lg bg-card/70 border border-border/60 text-sm text-muted-foreground hover:border-primary/40 transition text-left">
              <Search className="size-4" />
              <span className="flex-1 truncate">Search users, incidents, sessions…</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">⌘K</kbd>
            </button>

            <div className="relative" ref={bellRef}>
              <button onClick={() => setBellOpen(o => !o)} className="relative size-9 rounded-lg grid place-items-center hover:bg-card border border-border/60">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-critical text-[10px] grid place-items-center text-white font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-11 w-96 panel p-0 overflow-hidden animate-scale-in z-50">
                  <div className="p-3 border-b border-border/60 flex items-center justify-between">
                    <div className="text-sm font-semibold">Notifications</div>
                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">All caught up.</div>}
                    {notifications.map(n => (
                      <button key={n.id} onClick={() => openNotification(n)} className={`w-full text-left p-3 border-b border-border/40 hover:bg-card/60 transition flex gap-3 ${!n.read ? "bg-primary/[0.04]" : ""}`}>
                        <span className={`mt-1 size-2 rounded-full shrink-0 ${n.severity === "critical" ? "bg-critical" : n.severity === "high" ? "bg-warning" : n.severity === "medium" ? "bg-accent" : "bg-primary"} ${!n.read ? "pulse-dot-inner" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium truncate">{n.title}</div>
                            <span className="text-[10px] text-muted-foreground ml-auto">{n.ts}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
                        </div>
                        <ChevronRight className="size-3 text-muted-foreground mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userRef}>
              <button onClick={() => setUserOpen(o => !o)} className="flex items-center gap-2 pl-3 border-l border-border/60">
                <div className="size-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center text-xs font-semibold">
                  {auth?.name.split(" ").map(n => n[0]).slice(0, 2).join("") || "KB"}
                </div>
                <div className="leading-tight text-left">
                  <div className="text-sm font-medium">{auth?.name || "Karan Bhatia"}</div>
                  <div className="text-[11px] text-muted-foreground">{auth?.role || "SOC Analyst · L2"}</div>
                </div>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-12 w-56 panel p-1.5 animate-scale-in z-50">
                  <div className="px-3 py-2 border-b border-border/60">
                    <div className="text-xs text-muted-foreground">Signed in as</div>
                    <div className="text-sm truncate">{auth?.email}</div>
                  </div>
                  <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="w-full text-left px-3 py-2 rounded text-sm inline-flex items-center gap-2 hover:bg-card text-critical">
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 relative">
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
          <div className="relative p-6">{children}</div>
        </main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm grid place-items-start pt-24 px-4 animate-fade-in" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl panel p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border/60">
              <Search className="size-4 text-muted-foreground" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search users, incidents, audit logs…" className="flex-1 bg-transparent outline-none text-sm" />
              <button onClick={() => setSearchOpen(false)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q && <div className="p-8 text-center text-xs text-muted-foreground">Start typing to search across the platform.</div>}
              {q && results.users.length === 0 && results.incidents.length === 0 && results.logs.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">No results for “{q}”.</div>
              )}
              {results.users.length > 0 && <Section title="Users">
                {results.users.map(u => (
                  <button key={u.id} onClick={() => { setSearchOpen(false); navigate({ to: "/users/$id", params: { id: u.id } }); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card text-left">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center text-[10px] font-semibold">{u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm truncate">{u.name}</div><div className="text-[11px] text-muted-foreground truncate">{u.role} · {u.department}</div></div>
                    <span className="text-[11px] font-mono text-muted-foreground">{u.id}</span>
                  </button>
                ))}
              </Section>}
              {results.incidents.length > 0 && <Section title="Incidents">
                {results.incidents.map(i => (
                  <button key={i.id} onClick={() => { setSearchOpen(false); navigate({ to: "/incidents" }); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card text-left">
                    <ShieldAlert className="size-4 text-critical" />
                    <div className="flex-1 min-w-0"><div className="text-sm truncate">{i.id} · {i.title}</div><div className="text-[11px] text-muted-foreground">{i.subject} · {i.openedAt}</div></div>
                  </button>
                ))}
              </Section>}
              {results.logs.length > 0 && <Section title="Audit logs">
                {results.logs.map(l => (
                  <button key={l.id} onClick={() => { setSearchOpen(false); navigate({ to: "/audit" }); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card text-left">
                    <ScrollText className="size-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0"><div className="text-sm truncate">{l.action}</div><div className="text-[11px] text-muted-foreground truncate">{l.user} · {l.resource}</div></div>
                    <span className="text-[10px] font-mono text-muted-foreground">{l.id}</span>
                  </button>
                ))}
              </Section>}
            </div>
          </div>
        </div>
      )}

      <AICopilot />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
