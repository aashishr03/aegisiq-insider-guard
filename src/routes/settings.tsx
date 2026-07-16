import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/layout/primitives";
import { useAegis } from "@/lib/aegis-store";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AegisIQ" },
      { name: "description", content: "Configure risk thresholds, integrations and notification channels." },
    ],
  }),
  component: SettingsPage,
});


function SettingsPage() {
  const { thresholds, setThresholds } = useAegis();
  const [ai, setAi] = useState({ twin: true, quarantine: true, shap: true, vendor: false });
  const [t, setT] = useState(thresholds);

  const commit = (next: typeof t) => { setT(next); setThresholds(next); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Tenant · Bank of Maharashtra · Region APAC-IN</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="AI Risk Engine" subtitle="Behavioural model & thresholds">
          <div className="space-y-4">
            {[
              { l: "Enable AI Security Twin™", d: "Continuously baseline every privileged identity", k: "twin" as const },
              { l: "Auto-quarantine on critical", d: "Isolate host when score ≥ block threshold", k: "quarantine" as const },
              { l: "Explainable AI (SHAP)", d: "Attach signal contribution to every alert", k: "shap" as const },
              { l: "Vendor over-access learning", d: "Detect scope creep from 3rd-party contractors", k: "vendor" as const },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/60">
                <div>
                  <div className="text-sm font-medium">{r.l}</div>
                  <div className="text-[11px] text-muted-foreground">{r.d}</div>
                </div>
                <Toggle on={ai[r.k]} onChange={v => setAi({ ...ai, [r.k]: v })} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Risk Thresholds" subtitle="Drag to change · Risk Engine re-evaluates immediately">
          <div className="space-y-5">
            {[
              { l: "Monitor →", k: "monitor" as const, c: "var(--primary)" },
              { l: "MFA challenge →", k: "mfa" as const, c: "var(--accent)" },
              { l: "Restrict access →", k: "restrict" as const, c: "var(--warning)" },
              { l: "Block session →", k: "block" as const, c: "var(--critical)" },
            ].map((row) => (
              <div key={row.k}>
                <div className="flex items-center justify-between text-sm">
                  <span>{row.l}</span>
                  <span className="font-mono text-muted-foreground">{t[row.k]}</span>
                </div>
                <input type="range" min={10} max={100} value={t[row.k]}
                  onChange={e => setT({ ...t, [row.k]: Number(e.target.value) })}
                  onMouseUp={() => commit(t)} onTouchEnd={() => commit(t)}
                  className="w-full mt-1 accent-primary" />
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${t[row.k]}%`, background: row.c, boxShadow: `0 0 10px ${row.c}` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Integrations" subtitle="Data planes ingesting into AegisIQ">
          <div className="grid grid-cols-2 gap-3">
            {["Finacle CBS", "PeopleSoft HR", "Active Directory", "CyberArk PAM", "Splunk SIEM", "Palo Alto NGFW", "AWS CloudTrail", "SWIFT Gateway"].map((s) => (
              <div key={s} className="p-3 rounded-lg bg-background/40 border border-border/60 flex items-center gap-3">
                <div className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center font-semibold text-xs">{s.slice(0, 2)}</div>
                <div className="flex-1">
                  <div className="text-sm">{s}</div>
                  <div className="text-[10px] text-success">Connected</div>
                </div>
                <Toggle on onChange={() => {}} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notifications" subtitle="Where to route alerts">
          <div className="space-y-3">
            {[
              { l: "SOC pager (PagerDuty)", d: "Critical alerts only", on: true },
              { l: "Compliance email digest", d: "Daily 09:00 IST", on: true },
              { l: "Executive weekly PDF", d: "Every Monday 08:00", on: true },
              { l: "SMS to on-call", d: "Critical after hours", on: false },
            ].map((r, i) => {
              const [on, setOn] = [r.on, (v: boolean) => void v];
              return (
                <NotifRow key={r.l} label={r.l} desc={r.d} initial={on} />
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function NotifRow({ label, desc, initial }: { label: string; desc: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/60">
      <div><div className="text-sm font-medium">{label}</div><div className="text-[11px] text-muted-foreground">{desc}</div></div>
      <Toggle on={on} onChange={setOn} />
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!on)} className={`w-10 h-6 rounded-full p-0.5 transition ${on ? "bg-primary/80" : "bg-muted"}`}>
      <div className={`size-5 rounded-full bg-white transition-transform ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}
