// Realistic banking dummy data for AegisIQ
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export const departments = [
  "Core Banking",
  "Treasury",
  "Retail Banking",
  "Corporate Banking",
  "IT Infrastructure",
  "Risk & Compliance",
  "HR",
  "Fraud Ops",
  "Vendor Access",
];

export type PrivUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  riskScore: number;
  status: "active" | "idle" | "offline";
  location: string;
  device: string;
  lastActive: string;
  vendor?: boolean;
};

export const users: PrivUser[] = [
  { id: "U-1042", name: "Rahul Deshmukh", email: "rahul.d@bankofmh.in", role: "Core Banking Admin", department: "Core Banking", riskScore: 91, status: "active", location: "Pune, IN", device: "MBP-RD-11", lastActive: "2 min ago" },
  { id: "U-1088", name: "Ananya Iyer", email: "ananya.i@bankofmh.in", role: "Treasury Ops Lead", department: "Treasury", riskScore: 78, status: "active", location: "Mumbai, IN", device: "WIN-AI-04", lastActive: "just now" },
  { id: "U-1103", name: "Vikram Shetty", email: "v.shetty@bankofmh.in", role: "DBA — Payments", department: "IT Infrastructure", riskScore: 82, status: "active", location: "Bengaluru, IN", device: "LNX-VS-22", lastActive: "5 min ago" },
  { id: "U-1156", name: "Priya Malhotra", email: "priya.m@bankofmh.in", role: "Compliance Officer", department: "Risk & Compliance", riskScore: 34, status: "idle", location: "Delhi, IN", device: "MBP-PM-07", lastActive: "22 min ago" },
  { id: "U-1201", name: "Zenith Systems (Vendor)", email: "svc@zenith-sys.com", role: "3rd-Party Support", department: "Vendor Access", riskScore: 88, status: "active", location: "Gurgaon, IN", device: "VDI-ZEN-3", lastActive: "1 min ago", vendor: true },
  { id: "U-1244", name: "Karan Bhatia", email: "karan.b@bankofmh.in", role: "SOC Analyst L2", department: "Fraud Ops", riskScore: 22, status: "active", location: "Mumbai, IN", device: "MBP-KB-19", lastActive: "just now" },
  { id: "U-1301", name: "Meera Nair", email: "meera.n@bankofmh.in", role: "HR Systems Admin", department: "HR", riskScore: 61, status: "offline", location: "Kochi, IN", device: "WIN-MN-15", lastActive: "3 h ago" },
  { id: "U-1355", name: "Suresh Pillai", email: "suresh.p@bankofmh.in", role: "Corp Banking RM", department: "Corporate Banking", riskScore: 45, status: "active", location: "Chennai, IN", device: "MBP-SP-33", lastActive: "14 min ago" },
  { id: "U-1410", name: "Divya Rao", email: "divya.r@bankofmh.in", role: "Retail Ops Manager", department: "Retail Banking", riskScore: 29, status: "active", location: "Hyderabad, IN", device: "WIN-DR-08", lastActive: "6 min ago" },
  { id: "U-1477", name: "Farhan Qureshi", email: "farhan.q@bankofmh.in", role: "Network Engineer", department: "IT Infrastructure", riskScore: 55, status: "idle", location: "Pune, IN", device: "LNX-FQ-42", lastActive: "40 min ago" },
];

export type LiveEvent = {
  id: string;
  ts: string;
  user: string;
  userId: string;
  department: string;
  action: string;
  target: string;
  severity: Severity;
  status: "allowed" | "flagged" | "blocked" | "review";
};

export const liveEvents: LiveEvent[] = [
  { id: "E-8842", ts: "09:24:11", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "AI Alert Triggered", target: "Finacle CBS", severity: "critical", status: "flagged" },
  { id: "E-8841", ts: "09:21:03", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "Privilege escalation attempt", target: "sudo -i (jump-01)", severity: "critical", status: "blocked" },
  { id: "E-8840", ts: "09:18:47", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "Bulk file export (500)", target: "\\\\fs01\\payments\\Q3", severity: "high", status: "flagged" },
  { id: "E-8839", ts: "09:15:22", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "USB device connected", target: "SanDisk 64GB (unregistered)", severity: "high", status: "flagged" },
  { id: "E-8838", ts: "09:12:10", user: "Zenith Systems", userId: "U-1201", department: "Vendor Access", action: "Downloaded 120 documents", target: "SharePoint / Loans-KYC", severity: "high", status: "review" },
  { id: "E-8837", ts: "09:10:44", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "Payroll DB accessed", target: "hr_payroll.employees", severity: "medium", status: "allowed" },
  { id: "E-8836", ts: "09:07:18", user: "Vikram Shetty", userId: "U-1103", department: "IT Infrastructure", action: "Failed login (3x)", target: "prod-oracle-01", severity: "medium", status: "flagged" },
  { id: "E-8835", ts: "09:05:02", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "HR Database Access", target: "hr_master.employees", severity: "medium", status: "allowed" },
  { id: "E-8834", ts: "09:03:55", user: "Ananya Iyer", userId: "U-1088", department: "Treasury", action: "Wire transfer approval > ₹5cr", target: "SWIFT gateway", severity: "high", status: "allowed" },
  { id: "E-8833", ts: "09:01:12", user: "Rahul Deshmukh", userId: "U-1042", department: "Core Banking", action: "Login from unknown device", target: "VPN-Mumbai-02", severity: "high", status: "flagged" },
  { id: "E-8832", ts: "08:58:40", user: "Meera Nair", userId: "U-1301", department: "HR", action: "Login after working hours", target: "PeopleSoft", severity: "low", status: "review" },
  { id: "E-8831", ts: "08:54:29", user: "Karan Bhatia", userId: "U-1244", department: "Fraud Ops", action: "Case opened INC-2044", target: "SOAR", severity: "info", status: "allowed" },
];

// 24h risk trend
export const riskTrend = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  risk: Math.round(30 + 25 * Math.sin(h / 3) + (h > 18 ? 20 : 0) + Math.random() * 10),
  anomalies: Math.max(0, Math.round(3 + 2 * Math.sin(h / 4) + Math.random() * 3)),
}));

// 7-day incidents
export const weeklyIncidents = [
  { day: "Mon", critical: 2, high: 5, medium: 12 },
  { day: "Tue", critical: 1, high: 7, medium: 9 },
  { day: "Wed", critical: 3, high: 4, medium: 14 },
  { day: "Thu", critical: 4, high: 8, medium: 11 },
  { day: "Fri", critical: 2, high: 6, medium: 15 },
  { day: "Sat", critical: 1, high: 3, medium: 6 },
  { day: "Sun", critical: 5, high: 9, medium: 8 },
];

export const departmentRisk = departments.map((d, i) => ({
  department: d,
  score: [42, 58, 33, 47, 71, 28, 52, 66, 84][i] ?? 40,
}));

export const incidentCategories = [
  { name: "Insider Data Exfil", value: 34 },
  { name: "Privilege Abuse", value: 27 },
  { name: "Anomalous Access", value: 19 },
  { name: "Vendor Risk", value: 12 },
  { name: "Credential Misuse", value: 8 },
];

// Heatmap 7x24
export const heatmap = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const base = (h >= 9 && h <= 18 ? 2 : 6) + (d === 6 ? 4 : 0);
    return Math.min(10, Math.round(base + Math.random() * 4));
  }),
);

export const auditLogs = Array.from({ length: 40 }, (_, i) => {
  const u = users[i % users.length];
  const actions = [
    "SSH session opened",
    "RDP session opened",
    "Role assignment changed",
    "Vault secret retrieved",
    "MFA challenge issued",
    "Config file modified",
    "Firewall rule updated",
    "Password rotated",
    "S3 bucket policy changed",
    "Database query executed",
  ];
  return {
    id: `LOG-${20000 + i}`,
    ts: `2025-07-${String(10 + (i % 5)).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    user: u.name,
    userId: u.id,
    action: actions[i % actions.length],
    resource: ["cbs-prod-01", "vault.aegis.local", "peoplesoft-hr", "swift-gw-02", "s3://loans-kyc"][i % 5],
    ip: `10.${(i * 3) % 250}.${(i * 7) % 250}.${(i * 11) % 250}`,
    outcome: (["success", "success", "success", "denied", "success"] as const)[i % 5],
  };
});
