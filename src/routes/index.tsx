import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Users, Activity, ShieldAlert, AlertTriangle, Gauge, Clock, ArrowUpRight, BrainCircuit, Zap,
} from "lucide-react";
import { SectionCard, SeverityBadge, StatCard, StatusPill } from "@/components/layout/primitives";
import { heatmap, riskTrend, weeklyIncidents } from "@/lib/aegis-data";
import { useAegis, useCountUp } from "@/lib/aegis-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AegisIQ" },
      { name: "description", content: "Enterprise SOC dashboard: risk trends, live threats, top risky users." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { users, kpis, stream, incidents, riskScore } = useAegis();
  const navigate = useNavigate();
  const topRisky = [...users].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const latest = incidents[0];

  const critical = useCountUp(kpis.critical);
  const highUsers = useCountUp(kpis.high);
  const sessions = useCountUp(kpis.sessions);
  const avg = useCountUp(kpis.avgRisk);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Security Operations Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time posture across 1,842 privileged identities · Region APAC-IN
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-4" /> Live · updates every 3s
          <span className="ml-3 inline-flex items-center gap-1.5 text-success">
            <span className="size-1.5 rounded-full bg-success pulse-dot-inner" /> All planes healthy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Privileged Users" value="1,842" hint="+18 this week" icon={<Users className="size-4" />} />
        <StatCard label="Active Sessions" value={sessions.toLocaleString()} hint="Live · 24 vendors" icon={<Activity className="size-4" />} accent="success" />
        <div onClick={() => navigate({ to: "/incidents" })} className="cursor-pointer">
          <div className={critical >= 8 ? "animate-pulse" : ""}>
            <StatCard label="Critical Alerts" value={critical} hint="2 unassigned" icon={<ShieldAlert className="size-4" />} accent="critical" trend={{ value: "+3 vs 24h", up: true }} />
          </div>
        </div>
        <StatCard label="High Risk Users" value={highUsers} hint="3 vendors" icon={<AlertTriangle className="size-4" />} accent="warning" />
        <StatCard label="Avg. Risk Score" value={avg} hint="Baseline 38" icon={<Gauge className="size-4" />} accent="indigo" />
        <button onClick={() => navigate({ to: "/incidents" })} className="text-left">
          <StatCard label="Latest Incident" value={latest?.id ?? "—"} hint={`${latest?.subject ?? ""} · ${latest?.openedAt ?? ""}`} icon={<Zap className="size-4" />} accent="critical" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="24-Hour Risk Trend" subtitle="Aggregate behavioural risk across all privileged identities" className="xl:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" /> Risk Score</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent" /> Anomalies</span>
            </div>
          }>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="riskA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anoA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.3)" vertical={false} />
              <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="risk" stroke="var(--primary)" strokeWidth={2} fill="url(#riskA)" isAnimationActive animationDuration={900} />
              <Area type="monotone" dataKey="anomalies" stroke="var(--accent)" strokeWidth={2} fill="url(#anoA)" isAnimationActive animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top Risky Users" subtitle="Ranked by AI Security Twin™ deviation"
          action={<Link to="/users" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">View all <ArrowUpRight className="size-3" /></Link>}>
          <div className="space-y-3">
            {topRisky.map((u, idx) => (
              <button
                onClick={() => navigate(idx === 0 ? { to: "/risk-engine" } : { to: "/users/$id", params: { id: u.id } })}
                key={u.id}
                className="w-full flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-card/60 transition text-left"
              >
                <div className="size-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center text-xs font-semibold">
                  {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{u.role} · {u.department}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${u.riskScore >= 80 ? "text-critical" : u.riskScore >= 60 ? "text-warning" : "text-primary"}`}>{u.riskScore}</div>
                  <div className="w-16 h-1 mt-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${u.riskScore >= 80 ? "bg-critical" : u.riskScore >= 60 ? "bg-warning" : "bg-primary"}`} style={{ width: `${u.riskScore}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Live Threat Timeline" subtitle="Streaming from SOC data-plane"
          action={<span className="text-[11px] inline-flex items-center gap-1.5 text-success"><span className="size-1.5 rounded-full bg-success pulse-dot-inner" /> LIVE</span>}
          className="xl:col-span-2">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {stream.slice(0, 6).map((e, i) => (
              <div key={e.id + i} className={`relative pb-4 last:pb-0 ${i === 0 ? "animate-fade-in" : ""}`}>
                <span className={`absolute -left-[18px] top-1.5 size-3 rounded-full ring-4 ring-background ${e.severity === "critical" ? "bg-critical" : e.severity === "high" ? "bg-warning" : "bg-primary"} ${e.severity === "critical" ? "pulse-dot-inner" : ""}`} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{e.ts}</span>
                  <SeverityBadge level={e.severity} />
                  <StatusPill status={e.status} />
                </div>
                <div className="mt-1 text-sm"><span className="font-medium">{e.user}</span>{" "}<span className="text-muted-foreground">— {e.action}</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Target: <span className="font-mono">{e.target}</span></div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Incidents · Last 7 Days" subtitle="By severity">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={weeklyIncidents}>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.3)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.68 0.02 250)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="critical" stackId="a" fill="var(--critical)" isAnimationActive animationDuration={900} />
              <Bar dataKey="high" stackId="a" fill="var(--warning)" isAnimationActive animationDuration={900} />
              <Bar dataKey="medium" stackId="a" fill="var(--accent)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-critical" /> Critical</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-warning" /> High</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent" /> Medium</span>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Suspicious Activity Heat Map" subtitle="Anomalies by day-of-week × hour" className="xl:col-span-2">
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            <div className="w-8 shrink-0" />
            <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {Array.from({ length: 24 }).map((_, h) => (<div key={h} className="text-center">{h % 3 === 0 ? h : ""}</div>))}
            </div>
          </div>
          <div className="space-y-1 mt-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <div key={d} className="flex gap-1 items-center">
                <div className="w-8 text-[10px] text-muted-foreground">{d}</div>
                <div className="grid gap-1 flex-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                  {heatmap[i].map((v, h) => {
                    const opacity = v / 10;
                    return (
                      <div key={h} title={`${d} ${h}:00 · ${v} anomalies`}
                        className="aspect-square rounded-[3px] border border-border/40 hover:scale-125 transition-transform"
                        style={{ background: v > 7 ? `oklch(0.65 0.24 25 / ${opacity})` : v > 4 ? `oklch(0.78 0.18 75 / ${opacity})` : `oklch(0.82 0.16 220 / ${opacity})` }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Security Twin™" subtitle="Behavioural baseline vs today">
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={riskTrend}>
                <defs>
                  <linearGradient id="twin1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="risk" stroke="url(#twin1)" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={900} />
                <Line type="monotone" dataKey="anomalies" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={900} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/40 border border-border/60">
                <div className="text-lg font-semibold text-primary">{riskScore}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Peak Risk</div>
              </div>
              <div className="p-2 rounded-lg bg-background/40 border border-border/60">
                <div className="text-lg font-semibold text-accent">98%</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Confidence</div>
              </div>
              <div className="p-2 rounded-lg bg-background/40 border border-border/60">
                <div className="text-lg font-semibold text-critical">6</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Signals</div>
              </div>
            </div>
            <Link to="/risk-engine" className="mt-3 flex items-center justify-center gap-1.5 text-xs text-primary hover:underline">
              <BrainCircuit className="size-3.5" /> Open AI Risk Engine
            </Link>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Alerts" subtitle="Last 12 correlated events" action={<Link to="/monitoring" className="text-xs text-primary hover:underline">Go to Live Monitoring →</Link>}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-2 py-2.5">Time</th>
                <th className="text-left font-medium px-2 py-2.5">User</th>
                <th className="text-left font-medium px-2 py-2.5">Department</th>
                <th className="text-left font-medium px-2 py-2.5">Action</th>
                <th className="text-left font-medium px-2 py-2.5">Target</th>
                <th className="text-left font-medium px-2 py-2.5">Severity</th>
                <th className="text-left font-medium px-2 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {stream.slice(0, 8).map((e, i) => (
                <tr key={e.id + i} className="border-b border-border/40 hover:bg-card/40 transition">
                  <td className="px-2 py-2.5 font-mono text-[12px] text-muted-foreground">{e.ts}</td>
                  <td className="px-2 py-2.5"><Link to="/users/$id" params={{ id: e.userId }} className="hover:text-primary">{e.user}</Link></td>
                  <td className="px-2 py-2.5 text-muted-foreground">{e.department}</td>
                  <td className="px-2 py-2.5">{e.action}</td>
                  <td className="px-2 py-2.5 font-mono text-[12px] text-muted-foreground truncate max-w-[220px]">{e.target}</td>
                  <td className="px-2 py-2.5"><SeverityBadge level={e.severity} /></td>
                  <td className="px-2 py-2.5"><StatusPill status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
