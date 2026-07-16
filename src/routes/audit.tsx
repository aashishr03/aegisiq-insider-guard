import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionCard, StatusPill } from "@/components/layout/primitives";
import { Download, Search, Calendar, X } from "lucide-react";
import { useAegis, type AuditEntry } from "@/lib/aegis-store";
import { toast } from "sonner";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs · AegisIQ" },
      { name: "description", content: "Compliance-ready searchable audit trail of every privileged action." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const { audit } = useAegis();
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const logs = useMemo(() => audit.filter(l =>
    (outcome === "all" || l.outcome === outcome) &&
    JSON.stringify(l).toLowerCase().includes(q.toLowerCase())
  ), [audit, q, outcome]);

  const exportCSV = () => {
    const header = "id,timestamp,user,user_id,action,resource,ip,outcome\n";
    const rows = logs.map(l => [l.id, l.ts, `"${l.user}"`, l.userId, `"${l.action}"`, l.resource, l.ip, l.outcome].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aegisiq-audit-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export complete", { description: `${logs.length} audit records downloaded` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable, WORM-stored · RBI, ISO 27001 & SOC 2 aligned</p>
        </div>
        <button onClick={exportCSV} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 hover:opacity-90">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <SectionCard>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by user, resource, action, IP…"
              className="pl-9 pr-3 h-9 w-full rounded-lg bg-background border border-border/60 text-sm outline-none focus:border-primary/60" />
          </div>
          <button className="h-9 px-3 rounded-lg border border-border/60 text-sm inline-flex items-center gap-2 hover:bg-card">
            <Calendar className="size-4" /> Last 24h
          </button>
          <select value={outcome} onChange={e => setOutcome(e.target.value)} className="h-9 px-3 rounded-lg bg-background border border-border/60 text-sm">
            <option value="all">Any outcome</option>
            <option value="success">Success</option>
            <option value="denied">Denied</option>
          </select>
          <div className="ml-auto text-xs text-muted-foreground">{logs.length.toLocaleString()} events</div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-2 py-2.5">Timestamp</th>
                <th className="text-left font-medium px-2 py-2.5">Log ID</th>
                <th className="text-left font-medium px-2 py-2.5">User</th>
                <th className="text-left font-medium px-2 py-2.5">Action</th>
                <th className="text-left font-medium px-2 py-2.5">Resource</th>
                <th className="text-left font-medium px-2 py-2.5">IP</th>
                <th className="text-left font-medium px-2 py-2.5">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} onClick={() => setSelected(l)} className="border-b border-border/40 hover:bg-card/40 cursor-pointer transition font-mono text-[12px]">
                  <td className="px-2 py-2.5 text-muted-foreground">{l.ts}</td>
                  <td className="px-2 py-2.5 text-primary">{l.id}</td>
                  <td className="px-2 py-2.5 font-sans">{l.user}</td>
                  <td className="px-2 py-2.5 font-sans">{l.action}</td>
                  <td className="px-2 py-2.5">{l.resource}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">{l.ip}</td>
                  <td className="px-2 py-2.5"><StatusPill status={l.outcome} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selected && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center px-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg panel p-0 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div><div className="text-xs text-muted-foreground">Audit record</div><div className="text-sm font-semibold text-primary font-mono">{selected.id}</div></div>
              <button onClick={() => setSelected(null)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="flex items-start gap-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground w-32 pt-0.5">{k}</div>
                  <div className="flex-1 font-mono text-[12px] break-all">{String(v)}</div>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-muted-foreground">Signed with tenant HSM key <span className="font-mono">hsm-boM-01</span> · immutable.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
