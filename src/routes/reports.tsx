import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, RadialBar, RadialBarChart } from "recharts";
import { SectionCard, StatCard } from "@/components/layout/primitives";
import { departmentRisk, incidentCategories, weeklyIncidents } from "@/lib/aegis-data";
import { Download, Timer, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · AegisIQ" },
      { name: "description", content: "Executive risk & incident reports, MTTD / MTTR, department comparison." },
    ],
  }),
  component: Reports,
});

const COLORS = ["var(--primary)", "var(--accent)", "var(--warning)", "var(--critical)", "var(--success)"];

function Reports() {
  const mtt = [
    { name: "MTTR", value: 68, fill: "var(--accent)" },
    { name: "MTTD", value: 82, fill: "var(--primary)" },
  ];

  const downloadPDF = () => {
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) return;
    const rows = departmentRisk.map(d => `<tr><td>${d.department}</td><td style="text-align:right">${d.score}</td></tr>`).join("");
    const cats = incidentCategories.map(c => `<li>${c.name} — <b>${c.value}</b></li>`).join("");
    w.document.write(`<!doctype html><html><head><title>AegisIQ Executive Report</title>
      <style>
        body{font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#111;padding:40px;max-width:780px;margin:auto}
        h1{color:#0891b2;margin:0 0 4px} h2{color:#0f172a;border-bottom:2px solid #0891b2;padding-bottom:4px;margin-top:28px}
        .meta{color:#64748b;font-size:12px;margin-bottom:24px}
        .kpis{display:flex;gap:12px;margin:16px 0}
        .kpi{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:12px}
        .kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b}
        .kpi .v{font-size:22px;font-weight:600;color:#0891b2;margin-top:4px}
        table{width:100%;border-collapse:collapse;font-size:13px} td,th{padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:left}
        .foot{margin-top:40px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px}
      </style></head><body>
      <h1>AegisIQ — Executive Security Report</h1>
      <div class="meta">Tenant: Bank of Maharashtra · Period: Weekly · Generated ${new Date().toLocaleString()}</div>
      <h2>Executive Summary</h2>
      <p>Over the last 7 days AegisIQ processed <b>12,842 events/sec</b> across 6 data planes covering 1,842 privileged identities.
      The AI Security Twin™ engine detected <b>118 incidents</b>, of which <b>18 were critical</b>, most notably INC-2044 — a suspected
      insider data exfiltration by a Core Banking Admin. Mean-Time-To-Detect improved 42% week-over-week to <b>3m 12s</b>.</p>
      <div class="kpis">
        <div class="kpi"><div class="l">MTTD</div><div class="v">3m 12s</div></div>
        <div class="kpi"><div class="l">MTTR</div><div class="v">6m 40s</div></div>
        <div class="kpi"><div class="l">Incidents</div><div class="v">118</div></div>
        <div class="kpi"><div class="l">Avg. Risk</div><div class="v">42</div></div>
      </div>
      <h2>Top Risks by Department</h2>
      <table><thead><tr><th>Department</th><th style="text-align:right">Risk Score</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Incident Categories</h2>
      <ul>${cats}</ul>
      <h2>Recommendations</h2>
      <ol>
        <li>Enforce hardware-key MFA for all Core Banking privileged users (score &gt; 70).</li>
        <li>Revoke standing access for Vendor identities; move to Just-In-Time elevation only.</li>
        <li>Extend AI Security Twin™ baselining window from 30 → 60 days for treasury operators.</li>
        <li>Auto-quarantine hosts on risk score ≥ 88 (currently 6 blocked sessions this week).</li>
      </ol>
      <div class="foot">Report signed with tenant HSM key hsm-boM-01 · aligned with RBI, ISO 27001, SOC 2.</div>
      <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
      </body></html>`);
    w.document.close();
    toast.success("Executive report generated", { description: "Choose 'Save as PDF' in the print dialog" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Weekly risk posture · generated {new Date().toLocaleDateString()}</p>
        </div>
        <button onClick={downloadPDF} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 hover:opacity-90">
          <Download className="size-4" /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="MTTD" value="3m 12s" hint="↓ 42% WoW" icon={<Timer className="size-4" />} accent="primary" />
        <StatCard label="MTTR" value="6m 40s" hint="↓ 28% WoW" icon={<Zap className="size-4" />} accent="indigo" />
        <StatCard label="Incidents this week" value="118" hint="18 critical" accent="critical" />
        <StatCard label="Avg. risk (bank-wide)" value="42" hint="Target: < 50" accent="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Department Risk Comparison" subtitle="Weighted behavioural risk score">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={departmentRisk} layout="vertical">
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.3)" horizontal={false} />
              <XAxis type="number" stroke="oklch(0.68 0.02 250)" fontSize={11} />
              <YAxis dataKey="department" type="category" stroke="oklch(0.68 0.02 250)" fontSize={11} width={130} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {departmentRisk.map((d, i) => (
                  <Cell key={i} fill={d.score >= 70 ? "var(--critical)" : d.score >= 50 ? "var(--warning)" : "var(--primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Incident Categories" subtitle="Distribution across the quarter">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={280}>
              <PieChart>
                <Pie data={incidentCategories} innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value">
                  {incidentCategories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {incidentCategories.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Weekly Incidents" subtitle="Trend across the last 7 days" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyIncidents}>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.3)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.68 0.02 250)" fontSize={11} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="critical" fill="var(--critical)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="high" fill="var(--warning)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="medium" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="MTTD / MTTR Health" subtitle="Percentile against banking peer group">
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart innerRadius="30%" outerRadius="90%" data={mtt} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={12} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs -mt-4">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" /> MTTD p82</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent" /> MTTR p68</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
