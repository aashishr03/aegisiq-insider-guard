import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionCard, StatusPill } from "@/components/layout/primitives";
import { departments } from "@/lib/aegis-data";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useAegis } from "@/lib/aegis-store";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Privileged Users · AegisIQ" },
      { name: "description", content: "Directory of privileged users with behavioural risk scores." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const { users } = useAegis();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [risk, setRisk] = useState("all");

  const filtered = useMemo(() => users.filter(u => {
    if (dept !== "all" && u.department !== dept) return false;
    if (risk === "critical" && u.riskScore < 80) return false;
    if (risk === "high" && (u.riskScore < 60 || u.riskScore >= 80)) return false;
    if (risk === "medium" && (u.riskScore < 40 || u.riskScore >= 60)) return false;
    if (risk === "low" && u.riskScore >= 40) return false;
    return (u.name + u.role + u.department + u.email).toLowerCase().includes(q.toLowerCase());
  }), [users, q, dept, risk]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Privileged Users</h1>
        <p className="text-sm text-muted-foreground mt-1">1,842 identities · click a user to open their AI Security Twin™</p>
      </div>

      <SectionCard>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search users by name, role or department…"
              className="pl-9 pr-3 h-9 w-full rounded-lg bg-background border border-border/60 text-sm outline-none focus:border-primary/60" />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)} className="h-9 px-3 rounded-lg bg-background border border-border/60 text-sm">
            <option value="all">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={risk} onChange={e => setRisk(e.target.value)} className="h-9 px-3 rounded-lg bg-background border border-border/60 text-sm">
            <option value="all">Any risk</option>
            <option value="critical">Critical (80+)</option>
            <option value="high">High (60–79)</option>
            <option value="medium">Medium (40–59)</option>
            <option value="low">Low (&lt;40)</option>
          </select>
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} users</div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-2 py-2.5">User</th>
                <th className="text-left font-medium px-2 py-2.5">Role</th>
                <th className="text-left font-medium px-2 py-2.5">Department</th>
                <th className="text-left font-medium px-2 py-2.5">Location</th>
                <th className="text-left font-medium px-2 py-2.5">Status</th>
                <th className="text-left font-medium px-2 py-2.5">Last Active</th>
                <th className="text-left font-medium px-2 py-2.5">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/40 hover:bg-card/40 transition">
                  <td className="px-2 py-3">
                    <Link to="/users/$id" params={{ id: u.id }} className="flex items-center gap-3 hover:text-primary">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 grid place-items-center text-xs font-semibold">
                        {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{u.name} {u.vendor && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">VENDOR</span>}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{u.role}</td>
                  <td className="px-2 py-3">{u.department}</td>
                  <td className="px-2 py-3 text-muted-foreground">{u.location}</td>
                  <td className="px-2 py-3"><StatusPill status={u.status} /></td>
                  <td className="px-2 py-3 text-muted-foreground">{u.lastActive}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-semibold ${u.riskScore >= 80 ? "text-critical" : u.riskScore >= 60 ? "text-warning" : "text-primary"}`}>{u.riskScore}</div>
                      <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${u.riskScore >= 80 ? "bg-critical" : u.riskScore >= 60 ? "bg-warning" : "bg-primary"}`} style={{ width: `${u.riskScore}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-xs text-muted-foreground py-8">No users match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
