import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { users as seedUsers, liveEvents as seedEvents, auditLogs as seedLogs, type LiveEvent, type Severity, type PrivUser } from "./aegis-data";

export type Notification = {
  id: string;
  ts: string;
  title: string;
  body: string;
  severity: Severity;
  read: boolean;
  incidentId?: string;
};

export type AuditEntry = {
  id: string;
  ts: string;
  user: string;
  userId: string;
  action: string;
  resource: string;
  ip: string;
  outcome: "success" | "denied";
};

export type Incident = {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  openedAt: string;
  severity: Severity;
  status: "open" | "contained" | "closed";
};

export type Thresholds = { monitor: number; mfa: number; restrict: number; block: number };

type Auth = { email: string; name: string; role: string } | null;

type Ctx = {
  // auth
  auth: Auth;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // live stream
  stream: LiveEvent[];
  paused: boolean;
  setPaused: (p: boolean) => void;

  // notifications
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "ts" | "read">) => void;

  // audit
  audit: AuditEntry[];
  pushAudit: (a: Omit<AuditEntry, "id" | "ts">) => void;

  // access actions
  applied: Record<string, string>; // userId -> applied action
  applyAction: (user: PrivUser, action: string) => void;

  // incidents
  incidents: Incident[];
  addIncident: (i: Incident) => void;

  // risk engine
  riskScore: number;
  riskConfidence: number;
  bumpRisk: (delta: number) => void;

  // thresholds
  thresholds: Thresholds;
  setThresholds: (t: Thresholds) => void;

  // kpis
  kpis: { critical: number; high: number; sessions: number; avgRisk: number; blocked: number; mfa: number };

  // demo
  demoRunning: boolean;
  runDemo: () => void;

  // users
  users: PrivUser[];
};

const AegisContext = createContext<Ctx | null>(null);

const RANDOM_ACTIONS = [
  { action: "SSH Login", target: "cbs-prod-04", severity: "low" as Severity },
  { action: "USB Connected", target: "SanDisk 32GB", severity: "high" as Severity },
  { action: "File Download", target: "\\\\fs01\\reports\\Q3", severity: "medium" as Severity },
  { action: "Privilege Escalation", target: "sudo -i (jump-02)", severity: "critical" as Severity },
  { action: "VPN Login", target: "VPN-Mumbai-02", severity: "medium" as Severity },
  { action: "Database Query", target: "customers.pii", severity: "medium" as Severity },
  { action: "Payroll Access", target: "hr_payroll.employees", severity: "high" as Severity },
  { action: "PowerShell Execution", target: "Invoke-WebRequest", severity: "high" as Severity },
  { action: "Cloud Login", target: "aws-sso · admin", severity: "medium" as Severity },
  { action: "RDP Session", target: "10.24.7.11", severity: "low" as Severity },
];

const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const nowTs = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
const nowISO = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const uid = () => Math.random().toString(36).slice(2, 9);

export function AegisProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth>(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(sessionStorage.getItem("aegis-auth") || "null"); } catch { return null; }
  });
  const [stream, setStream] = useState<LiveEvent[]>(seedEvents);
  const [paused, setPaused] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: uid(), ts: "09:24", title: "Critical Alert · INC-2044", body: "Rahul Deshmukh flagged (score 91). Session under review.", severity: "critical", read: false, incidentId: "INC-2044" },
    { id: uid(), ts: "09:18", title: "Bulk file export detected", body: "500 files staged to unregistered USB.", severity: "high", read: false, incidentId: "INC-2044" },
    { id: uid(), ts: "08:54", title: "Weekly compliance digest ready", body: "SOC 2 & RBI reports generated.", severity: "info", read: true },
  ]);
  const [audit, setAudit] = useState<AuditEntry[]>(seedLogs);
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: "INC-2044", title: "Suspected insider data exfiltration", subject: "Rahul Deshmukh", subjectId: "U-1042", openedAt: "09:24 IST", severity: "critical", status: "open" },
    { id: "INC-2039", title: "Vendor over-access — Zenith Systems", subject: "Zenith Systems", subjectId: "U-1201", openedAt: "07:11 IST", severity: "high", status: "contained" },
    { id: "INC-2031", title: "Failed logins burst", subject: "Vikram Shetty", subjectId: "U-1103", openedAt: "Yesterday", severity: "medium", status: "closed" },
  ]);
  const [riskScore, setRiskScore] = useState(91);
  const [riskConfidence, setRiskConfidence] = useState(98);
  const [thresholds, setThresholdsState] = useState<Thresholds>({ monitor: 40, mfa: 60, restrict: 75, block: 88 });
  const [kpis, setKpis] = useState({ critical: 7, high: 14, sessions: 327, avgRisk: 42, blocked: 6, mfa: 193 });
  const [demoRunning, setDemoRunning] = useState(false);

  const users = useMemo(() => seedUsers.map(u => u.id === "U-1042" ? { ...u, riskScore } : u), [riskScore]);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 700));
    if (email.trim().toLowerCase() === "admin@bankofmaharashtra.com" && password === "Aegis@123") {
      const a = { email, name: "Karan Bhatia", role: "SOC Analyst · L2" };
      setAuth(a);
      sessionStorage.setItem("aegis-auth", JSON.stringify(a));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    sessionStorage.removeItem("aegis-auth");
  }, []);

  const pushNotification = useCallback((n: Omit<Notification, "id" | "ts" | "read">) => {
    setNotifications(prev => [{ ...n, id: uid(), ts: nowTs().slice(0, 5), read: false }, ...prev].slice(0, 50));
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const pushAudit = useCallback((a: Omit<AuditEntry, "id" | "ts">) => {
    setAudit(prev => [{ ...a, id: `LOG-${20000 + Math.floor(Math.random() * 9000)}`, ts: nowISO() }, ...prev]);
  }, []);

  const applyAction = useCallback((user: PrivUser, action: string) => {
    setApplied(prev => ({ ...prev, [user.id]: action }));
    pushAudit({
      user: user.name, userId: user.id,
      action: `Access policy applied · ${action}`,
      resource: user.device, ip: "10.24.19.7",
      outcome: action === "Block Session" ? "denied" : "success",
    });
    pushNotification({
      title: `${action} applied to ${user.name}`,
      body: `Policy enforced by SOC. Session updated across all planes.`,
      severity: action === "Block Session" ? "critical" : action === "Temporary Restriction" ? "high" : "medium",
    });
    setKpis(k => ({
      ...k,
      blocked: k.blocked + (action === "Block Session" ? 1 : 0),
      mfa: k.mfa + (action === "Require MFA" ? 1 : 0),
    }));
    toast.success(`${action} applied`, { description: `${user.name} · policy enforced` });
  }, [pushAudit, pushNotification]);

  const addIncident = (i: Incident) => setIncidents(prev => [i, ...prev]);
  const bumpRisk = (delta: number) => setRiskScore(s => Math.max(0, Math.min(100, s + delta)));

  const setThresholds = (t: Thresholds) => {
    setThresholdsState(t);
    toast.success("Thresholds updated", { description: "Risk Engine re-evaluating all sessions" });
  };

  // Live event stream
  useEffect(() => {
    if (paused || !auth) return;
    const t = setInterval(() => {
      const u = rnd(seedUsers);
      const a = rnd(RANDOM_ACTIONS);
      const ev: LiveEvent = {
        id: `E-${9000 + Math.floor(Math.random() * 999)}`,
        ts: nowTs(),
        user: u.name, userId: u.id, department: u.department,
        action: a.action, target: a.target, severity: a.severity,
        status: a.severity === "critical" ? "blocked" : a.severity === "high" ? "flagged" : "allowed",
      };
      setStream(prev => [ev, ...prev].slice(0, 60));
    }, 2000);
    return () => clearInterval(t);
  }, [paused, auth]);

  // KPI jitter
  useEffect(() => {
    if (!auth) return;
    const t = setInterval(() => {
      setKpis(k => ({
        ...k,
        sessions: Math.max(300, k.sessions + Math.floor(Math.random() * 7 - 3)),
        avgRisk: Math.max(30, Math.min(60, k.avgRisk + Math.floor(Math.random() * 5 - 2))),
      }));
      setRiskConfidence(c => Math.max(90, Math.min(99, c + Math.floor(Math.random() * 3 - 1))));
    }, 3000);
    return () => clearInterval(t);
  }, [auth]);

  const runDemo = useCallback(() => {
    if (demoRunning) return;
    setDemoRunning(true);
    setRiskScore(45);
    const rahul = seedUsers.find(u => u.id === "U-1042")!;
    const steps: Array<[string, () => void]> = [
      ["Employee login", () => {
        setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Employee Login", target: "SSO Okta", severity: "low", status: "allowed" }, ...prev]);
      }],
      ["Unknown device", () => { setRiskScore(s => s + 12); setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Login from unknown device", target: "device fp 0x8a2e", severity: "medium", status: "flagged" }, ...prev]); }],
      ["VPN login", () => { setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "VPN Login", target: "VPN-Mumbai-02", severity: "medium", status: "flagged" }, ...prev]); }],
      ["Payroll access", () => { setRiskScore(s => s + 10); setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Payroll Access", target: "hr_payroll.employees", severity: "high", status: "flagged" }, ...prev]); }],
      ["Database query", () => { setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Database Query", target: "customers.pii · 12k rows", severity: "high", status: "flagged" }, ...prev]); }],
      ["USB connected", () => { setRiskScore(s => s + 8); setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "USB Connected", target: "SanDisk 64GB (unregistered)", severity: "high", status: "flagged" }, ...prev]); }],
      ["Bulk download", () => { setRiskScore(s => s + 12); setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Bulk File Download", target: "500 files · 1.2 GB", severity: "critical", status: "flagged" }, ...prev]); }],
      ["Privilege escalation", () => { setRiskScore(s => s + 8); setStream(prev => [{ id: `E-${uid()}`, ts: nowTs(), user: rahul.name, userId: rahul.id, department: rahul.department, action: "Privilege Escalation", target: "sudo -i (jump-01)", severity: "critical", status: "blocked" }, ...prev]); }],
      ["AI anomaly detected", () => {
        setKpis(k => ({ ...k, critical: k.critical + 1 }));
        toast.error("AegisIQ AI · Critical anomaly detected", { description: `${rahul.name} · deviation 87%` });
      }],
      ["Incident created", () => {
        const inc: Incident = { id: `INC-${2050 + Math.floor(Math.random() * 30)}`, title: "Live insider exfiltration attempt", subject: rahul.name, subjectId: rahul.id, openedAt: nowTs(), severity: "critical", status: "open" };
        addIncident(inc);
        pushNotification({ title: `Incident ${inc.id} opened`, body: `${rahul.name} · playbook auto-generated.`, severity: "critical", incidentId: inc.id });
      }],
      ["Access blocked", () => { applyAction(rahul, "Block Session"); }],
      ["Reports updated", () => {
        toast.success("Executive report regenerated", { description: "New incident merged into weekly PDF" });
        pushNotification({ title: "Weekly executive report updated", body: "New INC merged & ready for board.", severity: "info" });
      }],
    ];
    let i = 0;
    const tick = () => {
      if (i >= steps.length) { setDemoRunning(false); toast.success("Demo complete", { description: "Full insider attack replayed" }); return; }
      const [label, fn] = steps[i++];
      toast(`Demo · ${label}`);
      fn();
      setTimeout(tick, 1600);
    };
    tick();
  }, [demoRunning, applyAction, pushNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const kpisView = { ...kpis, critical: kpis.critical };

  const value: Ctx = {
    auth, login, logout,
    stream, paused, setPaused,
    notifications, unreadCount, markAllRead, markRead, pushNotification,
    audit, pushAudit,
    applied, applyAction,
    incidents, addIncident,
    riskScore, riskConfidence, bumpRisk,
    thresholds, setThresholds,
    kpis: kpisView,
    demoRunning, runDemo,
    users,
  };

  return <AegisContext.Provider value={value}>{children}</AegisContext.Provider>;
}

export function useAegis() {
  const c = useContext(AegisContext);
  if (!c) throw new Error("useAegis must be inside AegisProvider");
  return c;
}

// Animated counter hook
export function useCountUp(value: number, duration = 800) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const startV = from.current;
    const diff = value - startV;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(startV + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return v;
}
