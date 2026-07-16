import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionCard, SeverityBadge, StatusPill } from "@/components/layout/primitives";
import { Filter, Pause, Play, Search, X } from "lucide-react";
import { useAegis } from "@/lib/aegis-store";
import type { LiveEvent, Severity } from "@/lib/aegis-data";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Live Monitoring · AegisIQ" },
      { name: "description", content: "Real-time stream of privileged user activity across the bank." },
    ],
  }),
  component: LiveMonitoring,
});

const SEVS: Severity[] = ["critical", "high", "medium", "low", "info"];

function LiveMonitoring() {
  const { stream, paused, setPaused } = useAegis();
  const [sev, setSev] = useState<Severity | "all">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<LiveEvent | null>(null);

  const filtered = useMemo(() => stream.filter(e =>
    (sev === "all" || e.severity === sev) &&
    (!q || (e.user + e.action + e.target + e.department).toLowerCase().includes(q.toLowerCase()))
  ), [stream, sev, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Streaming privileged-session telemetry · new event every 2s</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search events…"
              className="pl-9 pr-3 h-9 w-56 rounded-lg bg-background border border-border/60 text-sm outline-none focus:border-primary/60" />
          </div>
          <select value={sev} onChange={e => setSev(e.target.value as Severity | "all")} className="h-9 px-3 rounded-lg bg-background border border-border/60 text-sm">
            <option value="all">All severity</option>
            {SEVS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setPaused(!paused)}
            className={`h-9 px-3 rounded-lg text-sm inline-flex items-center gap-2 border ${paused ? "border-warning/40 text-warning bg-warning/10" : "border-success/40 text-success bg-success/10"}`}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? "Resume" : "Pause stream"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Events / sec</div><div className="text-xl font-semibold mt-1 text-primary">12,842</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Streamed (session)</div><div className="text-xl font-semibold mt-1">{stream.length}</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Flagged</div><div className="text-xl font-semibold mt-1 text-warning">{stream.filter(e => e.status === "flagged").length}</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Blocked</div><div className="text-xl font-semibold mt-1 text-critical">{stream.filter(e => e.status === "blocked").length}</div></div>
      </div>

      <SectionCard title="Event Stream" subtitle={`${filtered.length} of ${stream.length} events`}
        action={<span className={`text-[11px] inline-flex items-center gap-1.5 ${paused ? "text-warning" : "text-success"}`}>
          <span className={`size-1.5 rounded-full ${paused ? "bg-warning" : "bg-success pulse-dot-inner"}`} /> {paused ? "PAUSED" : "LIVE"}
        </span>}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-2 py-2.5">Timestamp</th>
                <th className="text-left font-medium px-2 py-2.5">User</th>
                <th className="text-left font-medium px-2 py-2.5">Department</th>
                <th className="text-left font-medium px-2 py-2.5">Action</th>
                <th className="text-left font-medium px-2 py-2.5">Target</th>
                <th className="text-left font-medium px-2 py-2.5">Severity</th>
                <th className="text-left font-medium px-2 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={`${e.id}-${i}`} onClick={() => setSelected(e)}
                  className={`border-b border-border/40 hover:bg-card/40 cursor-pointer transition ${i === 0 && !paused ? "animate-fade-in bg-primary/5" : ""}`}>
                  <td className="px-2 py-2.5 font-mono text-[12px] text-muted-foreground">{e.ts}</td>
                  <td className="px-2 py-2.5"><Link to="/users/$id" params={{ id: e.userId }} onClick={ev => ev.stopPropagation()} className="hover:text-primary">{e.user}</Link></td>
                  <td className="px-2 py-2.5 text-muted-foreground">{e.department}</td>
                  <td className="px-2 py-2.5">{e.action}</td>
                  <td className="px-2 py-2.5 font-mono text-[12px] text-muted-foreground truncate max-w-[280px]">{e.target}</td>
                  <td className="px-2 py-2.5"><SeverityBadge level={e.severity} /></td>
                  <td className="px-2 py-2.5"><StatusPill status={e.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-xs text-muted-foreground py-8">No events match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selected && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center px-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg panel p-0 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Event · {selected.id}</div>
                <div className="text-sm font-semibold">{selected.action}</div>
              </div>
              <button onClick={() => setSelected(null)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {[
                ["Timestamp", selected.ts],
                ["User", `${selected.user} · ${selected.userId}`],
                ["Department", selected.department],
                ["Target", selected.target],
                ["Severity", selected.severity.toUpperCase()],
                ["Status", selected.status.toUpperCase()],
                ["Correlation ID", `corr-${selected.id}-${Math.random().toString(36).slice(2, 6)}`],
                ["Detection engine", "AegisIQ AI Security Twin™ v4"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground w-32 pt-0.5">{k}</div>
                  <div className="flex-1 font-mono text-[12px] break-all">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
