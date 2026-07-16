import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RiskGauge, SectionCard } from "@/components/layout/primitives";
import { AlertTriangle, ChevronDown, BrainCircuit, ShieldOff, KeyRound, Bell, FileText } from "lucide-react";
import { useAegis, useCountUp } from "@/lib/aegis-store";
import { toast } from "sonner";

export const Route = createFileRoute("/risk-engine")({
  head: () => ({
    meta: [
      { title: "AI Risk Engine · AegisIQ" },
      { name: "description", content: "Explainable risk scoring and recommended actions from the AegisIQ AI." },
    ],
  }),
  component: RiskEngine,
});

const signals = [
  { key: "device", label: "Unknown Device", weight: 22, evidence: "VPN-Mumbai-02 · IP 10.24.19.7 · Device fingerprint unseen for 90d", detail: "The privileged session originated from a device fingerprint that has never been registered in the AegisIQ trust store within the last 90 days." },
  { key: "hours", label: "Outside Working Hours", weight: 14, evidence: "Login at 04:12 IST · baseline 09:45–19:20", detail: "User's behavioural baseline shows 96% of activity between 09:45 and 19:20 IST. Current session deviates by 5h 33m." },
  { key: "usb", label: "USB Device", weight: 18, evidence: "SanDisk 64GB · fingerprint 0x77e2 · unregistered", detail: "A removable storage device was attached to jump-host MBP-RD-11. Serial not present in CyberArk allow-list." },
  { key: "bulk", label: "Bulk Download", weight: 26, evidence: "500 files · 1.2 GB · \\\\fs01\\payments\\Q3", detail: "12× the user's 30-day rolling average export volume. Files include Q3 payment reconciliations." },
  { key: "esc", label: "Privilege Escalation", weight: 18, evidence: "`sudo -i` on jump-01 · blocked by policy PE-042", detail: "Attempted horizontal privilege escalation to root. Blocked by CyberArk policy PE-042." },
  { key: "dev", label: "Behaviour Deviation", weight: 8, evidence: "6-dimensional AI Security Twin™ divergence 87%", detail: "Aggregate deviation across time-of-day, network path, data volume, sequence entropy, keyboard cadence, and command graph." },
];

function RiskEngine() {
  const { riskScore, riskConfidence } = useAegis();
  const [open, setOpen] = useState<string | null>("bulk");
  const score = useCountUp(riskScore);
  const conf = useCountUp(riskConfidence);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Risk Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explainable scoring for <span className="text-foreground font-medium">Rahul Deshmukh · U-1042 · Core Banking Admin</span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard className="xl:col-span-1">
          <div className="flex flex-col items-center py-4">
            <RiskGauge score={score} size={240} />
            <div className="mt-4 text-center">
              <div className={`text-lg font-semibold ${score >= 85 ? "text-critical" : score >= 70 ? "text-warning" : "text-primary"}`}>
                {score >= 85 ? "Critical" : score >= 70 ? "High" : score >= 50 ? "Medium" : "Low"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Percentile 99.4 across bank</div>
            </div>
            <div className="mt-6 w-full grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                <div className="text-lg font-semibold text-primary">{conf}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Confidence</div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                <div className="text-lg font-semibold text-accent">6</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Signals</div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/60">
                <div className="text-lg font-semibold text-warning">87%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deviation</div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Why AegisIQ flagged this user" subtitle="SHAP-style contribution · click to expand" className="xl:col-span-2">
          <div className="space-y-2">
            {signals.map((s) => {
              const isOpen = open === s.key;
              return (
                <div key={s.key} className="border border-border/60 rounded-lg overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : s.key)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-card/60">
                    <AlertTriangle className="size-4 text-warning shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{s.label}</div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-critical transition-all duration-700"
                          style={{ width: `${(s.weight / 30) * 100}%`, boxShadow: "0 0 10px oklch(0.65 0.24 25 / 0.5)" }} />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">+{s.weight} pts</span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-border/40 bg-background/30 animate-fade-in">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Evidence</div>
                      <div className="text-xs font-mono mt-1">{s.evidence}</div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-3">Analyst detail</div>
                      <div className="text-sm mt-1">{s.detail}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recommended Actions" subtitle="Playbook auto-generated by the AI Security Analyst"
        action={<span className="text-[11px] inline-flex items-center gap-1.5 text-primary"><BrainCircuit className="size-3.5" /> AegisIQ-Copilot · v4</span>}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { i: ShieldOff, l: "Block privileged session", cls: "text-critical border-critical/30 bg-critical/5" },
            { i: KeyRound, l: "Force step-up MFA", cls: "text-warning border-warning/30 bg-warning/5" },
            { i: Bell, l: "Notify SOC lead + Compliance", cls: "text-primary border-primary/30 bg-primary/5" },
            { i: FileText, l: "Generate investigation report", cls: "text-accent border-accent/30 bg-accent/5" },
          ].map((a) => (
            <button key={a.l} onClick={() => toast.success(a.l, { description: "Action dispatched to SOAR" })}
              className={`p-3 rounded-lg border text-left hover:bg-card/60 transition ${a.cls}`}>
              <a.i className="size-4 mb-2" />
              <div className="text-sm font-medium text-foreground">{a.l}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Auto-executable · reversible</div>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
