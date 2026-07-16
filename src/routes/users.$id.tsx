import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { RiskGauge, SectionCard, SeverityBadge, StatusPill } from "@/components/layout/primitives";
import { liveEvents, riskTrend, users } from "@/lib/aegis-data";
import { ArrowLeft, Fingerprint, MapPin, Monitor, Clock, ShieldCheck, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/users/$id")({
  loader: ({ params }) => {
    const user = users.find((u) => u.id === params.id);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.user.name} · AegisIQ` : "User · AegisIQ" },
      { name: "description", content: "Privileged user behavioural profile and AI Security Twin™." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UserProfile,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">User not found. <Link to="/users" className="text-primary">Back to directory</Link></div>
  ),
});

function UserProfile() {
  const { user } = Route.useLoaderData();
  const events = liveEvents.filter((e) => e.userId === user.id);

  const behaviourRadar = [
    { axis: "Login Time", baseline: 80, today: 30 },
    { axis: "Device", baseline: 90, today: 20 },
    { axis: "Location", baseline: 85, today: 45 },
    { axis: "Data Volume", baseline: 40, today: 95 },
    { axis: "Access Scope", baseline: 55, today: 88 },
    { axis: "Command Mix", baseline: 60, today: 92 },
  ];

  return (
    <div className="space-y-6">
      <Link to="/users" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="size-3.5" /> All users
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Identity card */}
        <SectionCard className="xl:col-span-2">
          <div className="flex items-start gap-5">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 grid place-items-center text-2xl font-semibold glow-cyan">
              {user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                {user.vendor && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">VENDOR</span>}
                <StatusPill status={user.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{user.role} · {user.department} · {user.id}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1"><Clock className="size-3" /> Typical login</div>
                  <div className="mt-1 font-medium">09:45 – 19:20 IST</div>
                </div>
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1"><Monitor className="size-3" /> Normal device</div>
                  <div className="mt-1 font-medium">MBP-RD-11</div>
                </div>
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1"><MapPin className="size-3" /> Baseline location</div>
                  <div className="mt-1 font-medium">Pune HQ, IN</div>
                </div>
                <div className="p-3 rounded-lg bg-background/40 border border-border/60">
                  <div className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1"><Fingerprint className="size-3" /> MFA method</div>
                  <div className="mt-1 font-medium">FIDO2 · Push</div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Current Risk Score" subtitle="AI Security Twin™ deviation">
          <div className="flex flex-col items-center">
            <RiskGauge score={user.riskScore} size={200} />
            <div className="mt-2 flex items-center gap-2">
              {user.riskScore >= 80 ? (
                <span className="inline-flex items-center gap-1 text-critical text-sm"><ShieldAlert className="size-4" /> Critical deviation</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success text-sm"><ShieldCheck className="size-4" /> Within tolerance</span>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Behaviour Baseline vs Today" subtitle="6-dimension AI Security Twin™" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={behaviourRadar}>
              <PolarGrid stroke="oklch(0.30 0.03 260 / 0.5)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.68 0.02 250)", fontSize: 10 }} />
              <PolarRadiusAxis stroke="oklch(0.30 0.03 260 / 0.5)" tick={false} />
              <Radar name="Baseline" dataKey="baseline" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
              <Radar name="Today" dataKey="today" stroke="var(--critical)" fill="var(--critical)" fillOpacity={0.25} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Risk History · 24h" subtitle="Behavioural risk over time" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="uh1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--critical)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--critical)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.30 0.03 260 / 0.3)" vertical={false} />
              <XAxis dataKey="hour" stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.03 258)", border: "1px solid oklch(0.32 0.03 260 / 0.6)", borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="risk" stroke="var(--critical)" strokeWidth={2} fill="url(#uh1)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Behaviour Timeline" subtitle="Recent actions by this identity">
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No recent events in current window.</div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {events.map((e) => (
              <div key={e.id} className="relative pb-4 last:pb-0">
                <span className={`absolute -left-[18px] top-1.5 size-3 rounded-full ring-4 ring-background ${e.severity === "critical" ? "bg-critical" : e.severity === "high" ? "bg-warning" : "bg-primary"}`} />
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-muted-foreground">{e.ts}</span>
                  <SeverityBadge level={e.severity} />
                  <StatusPill status={e.status} />
                </div>
                <div className="mt-1 text-sm"><span className="font-medium">{e.action}</span> <span className="text-muted-foreground">— {e.target}</span></div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
