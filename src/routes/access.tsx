import { createFileRoute } from "@tanstack/react-router";
import { SectionCard, StatusPill } from "@/components/layout/primitives";
import { useState } from "react";
import { useAegis } from "@/lib/aegis-store";
import type { PrivUser } from "@/lib/aegis-data";
import { X, ShieldCheck, KeyRound, Lock, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/access")({
  head: () => ({
    meta: [
      { title: "Access Control · AegisIQ" },
      { name: "description", content: "Risk-based authentication and privileged access recommendations." },
    ],
  }),
  component: Access,
});

const ACTIONS = [
  { key: "Monitor", icon: ShieldCheck, cls: "border-success/40 text-success bg-success/10" },
  { key: "Require MFA", icon: KeyRound, cls: "border-accent/40 text-accent bg-accent/10" },
  { key: "Temporary Restriction", icon: Lock, cls: "border-warning/40 text-warning bg-warning/10" },
  { key: "Block Session", icon: ShieldOff, cls: "border-critical/40 text-critical bg-critical/10" },
];

function recommend(score: number) {
  if (score >= 85) return "Block Session";
  if (score >= 70) return "Temporary Restriction";
  if (score >= 50) return "Require MFA";
  return "Monitor";
}

function Access() {
  const { users, applied, applyAction, kpis } = useAegis();
  const [confirm, setConfirm] = useState<{ user: PrivUser; action: string } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Risk-based authentication · policies re-evaluated continuously by the AI Risk Engine</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Policies</div><div className="text-xl font-semibold mt-1">128</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Auto-actions today</div><div className="text-xl font-semibold mt-1 text-primary">{42 + Object.keys(applied).length}</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">Sessions blocked</div><div className="text-xl font-semibold mt-1 text-critical">{kpis.blocked}</div></div>
        <div className="panel p-4"><div className="text-[11px] uppercase text-muted-foreground">MFA challenges</div><div className="text-xl font-semibold mt-1 text-accent">{kpis.mfa}</div></div>
      </div>

      <SectionCard title="Risk-Based Recommendations" subtitle="AI-suggested access level for each privileged identity">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-2 py-2.5">User</th>
                <th className="text-left font-medium px-2 py-2.5">Risk</th>
                <th className="text-left font-medium px-2 py-2.5">Current</th>
                <th className="text-left font-medium px-2 py-2.5">Recommended</th>
                <th className="text-left font-medium px-2 py-2.5">Status</th>
                <th className="text-right font-medium px-2 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rec = recommend(u.riskScore);
                const cur = applied[u.id];
                return (
                  <tr key={u.id} className="border-b border-border/40 hover:bg-card/40 transition">
                    <td className="px-2 py-3"><div className="font-medium">{u.name}</div><div className="text-[11px] text-muted-foreground">{u.role}</div></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${u.riskScore >= 80 ? "text-critical" : u.riskScore >= 60 ? "text-warning" : "text-primary"}`}>{u.riskScore}</span>
                        <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${u.riskScore >= 80 ? "bg-critical" : u.riskScore >= 60 ? "bg-warning" : "bg-primary"}`} style={{ width: `${u.riskScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{cur || "Standard Priv · JIT 4h"}</td>
                    <td className="px-2 py-3"><span className={`text-[11px] px-2 py-1 rounded-md border ${ACTIONS.find(a => a.key === rec)?.cls}`}>{rec}</span></td>
                    <td className="px-2 py-3">{cur ? <span className="text-[11px] px-2 py-1 rounded-md border border-success/40 text-success bg-success/10">Applied</span> : <StatusPill status={u.status} />}</td>
                    <td className="px-2 py-3 text-right">
                      <div className="inline-flex gap-1.5 flex-wrap justify-end">
                        {ACTIONS.map(a => (
                          <button key={a.key} onClick={() => setConfirm({ user: u, action: a.key })}
                            className={`h-7 px-2.5 rounded-md text-[11px] border ${a.key === rec ? a.cls + " font-medium" : "border-border/60 hover:bg-card"}`}>
                            {a.key}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center px-4 animate-fade-in" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-md panel p-0 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div className="text-sm font-semibold">Confirm access policy</div>
              <button onClick={() => setConfirm(null)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p>Apply <span className={`text-[11px] px-2 py-1 rounded-md border ${ACTIONS.find(a => a.key === confirm.action)?.cls}`}>{confirm.action}</span> to <span className="font-semibold">{confirm.user.name}</span>?</p>
              <p className="text-xs text-muted-foreground">This will propagate to CyberArk PAM, Active Directory, and the SIEM. An audit entry and notification will be generated automatically.</p>
              <div className="pt-2 flex gap-2 justify-end">
                <button onClick={() => setConfirm(null)} className="h-9 px-3 rounded-lg border border-border/60 text-sm hover:bg-card">Cancel</button>
                <button onClick={() => { applyAction(confirm.user, confirm.action); setConfirm(null); }} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">Apply policy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
