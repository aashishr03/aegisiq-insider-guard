import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SectionCard, SeverityBadge } from "@/components/layout/primitives";
import { Play, Pause, SkipBack, SkipForward, FileWarning, Usb, Download, ShieldAlert, Database, LogIn, Terminal, Wifi, X } from "lucide-react";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "Incident Investigation · AegisIQ" },
      { name: "description", content: "Digital forensics workspace with attack path visualisation and playback." },
    ],
  }),
  component: Incidents,
});

const timeline = [
  { t: "09:01", icon: LogIn, title: "Login from unknown device", detail: "VPN-Mumbai-02 · IP 10.24.19.7", severity: "high" as const },
  { t: "09:05", icon: Database, title: "HR Database access", detail: "hr_master.employees · SELECT * · 42 rows", severity: "medium" as const },
  { t: "09:10", icon: Database, title: "Payroll access", detail: "hr_payroll.employees · first access in 24 months", severity: "medium" as const },
  { t: "09:15", icon: Usb, title: "USB device connected", detail: "SanDisk 64GB · unregistered · MBP-RD-11", severity: "high" as const },
  { t: "09:18", icon: Download, title: "Bulk file download (500)", detail: "\\\\fs01\\payments\\Q3 · 1.2 GB", severity: "high" as const },
  { t: "09:21", icon: Terminal, title: "Privilege escalation attempt", detail: "sudo -i on jump-01 · BLOCKED by policy PE-042", severity: "critical" as const },
  { t: "09:24", icon: ShieldAlert, title: "AI Alert Triggered", detail: "Risk score 91 · confidence 98% · playbook opened", severity: "critical" as const },
];

function Incidents() {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(6);
  const [evidence, setEvidence] = useState<Evi | null>(null);
  const [mitre, setMitre] = useState<typeof MITRE[number] | null>(null);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % timeline.length), 1400);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Incident</div>
          <h1 className="text-2xl font-semibold tracking-tight">INC-2044 · Suspected insider data exfiltration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Subject: <span className="text-foreground">Rahul Deshmukh</span> · Opened 09:24 IST · Owner: SOC L2 Karan Bhatia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-critical/15 text-critical border border-critical/30 uppercase tracking-wider">Critical</span>
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-warning/15 text-warning border border-warning/30">Under investigation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          title="Incident Playback"
          subtitle="Replay the attack timeline step-by-step"
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-1">
              <button onClick={() => setStep(Math.max(0, step - 1))} className="size-8 grid place-items-center rounded-md hover:bg-card"><SkipBack className="size-4" /></button>
              <button onClick={() => setPlaying((p) => !p)} className="size-9 grid place-items-center rounded-md bg-primary text-primary-foreground">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</button>
              <button onClick={() => setStep(Math.min(timeline.length - 1, step + 1))} className="size-8 grid place-items-center rounded-md hover:bg-card"><SkipForward className="size-4" /></button>
            </div>
          }
        >
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            <div
              className="absolute left-3 top-2 w-px bg-primary shadow-[0_0_10px_var(--primary)] transition-all duration-500"
              style={{ height: `${((step + 1) / timeline.length) * 100}%` }}
            />
            {timeline.map((e, i) => {
              const active = i === step;
              const past = i < step;
              const Icon = e.icon;
              return (
                <div key={i} className={`relative pb-5 transition-opacity ${past || active ? "opacity-100" : "opacity-50"}`}>
                  <span
                    className={`absolute -left-[26px] top-0 size-6 rounded-full grid place-items-center border ${active ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_var(--primary)]" : past ? "bg-background border-primary/60 text-primary" : "bg-background border-border text-muted-foreground"}`}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">{e.t}</span>
                    <SeverityBadge level={e.severity} />
                  </div>
                  <div className={`mt-1 text-sm font-medium ${active ? "text-primary" : ""}`}>{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.detail}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Evidence" subtitle="Auto-collected artifacts">
            <div className="space-y-3">
              {EVIDENCE.map((e) => (
                <button key={e.t} onClick={() => setEvidence(e)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-background/40 border border-border/60 hover:border-primary/40 transition text-left">
                  <div className="size-9 rounded-md bg-primary/10 text-primary grid place-items-center"><e.i className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{e.t}</div>
                    <div className="text-[11px] text-muted-foreground">{e.s}</div>
                  </div>
                  <span className="text-[11px] text-primary">Open</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="MITRE ATT&CK Mapping">
            <div className="flex flex-wrap gap-1.5">
              {MITRE.map((t) => (
                <button key={t.id} onClick={() => setMitre(t)}
                  className="text-[11px] px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition">
                  {t.id} {t.label}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Attack Path" subtitle="Correlated across identity → asset → data">
        <AttackPath />
      </SectionCard>

      {evidence && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center px-4 animate-fade-in" onClick={() => setEvidence(null)}>
          <div className="w-full max-w-xl panel p-0 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Forensic evidence</div>
                <div className="text-sm font-semibold font-mono">{evidence.t}</div>
              </div>
              <button onClick={() => setEvidence(null)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">{evidence.s}</div>
              <pre className="text-[11px] font-mono bg-background/60 border border-border/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{evidence.preview}</pre>
              <div className="text-[11px] text-muted-foreground">SHA-256 {evidence.hash} · chain-of-custody preserved</div>
            </div>
          </div>
        </div>
      )}

      {mitre && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center px-4 animate-fade-in" onClick={() => setMitre(null)}>
          <div className="w-full max-w-md panel p-0 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">MITRE ATT&CK · {mitre.tactic}</div>
                <div className="text-sm font-semibold">{mitre.id} · {mitre.label}</div>
              </div>
              <button onClick={() => setMitre(null)}><X className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="p-4 text-sm space-y-2">
              <div>{mitre.desc}</div>
              <div className="text-[11px] text-muted-foreground">Detected by AegisIQ correlation rule <span className="font-mono">R-{mitre.id}</span>.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Evi = { i: typeof FileWarning; t: string; s: string; preview: string; hash: string };
const EVIDENCE: Evi[] = [
  { i: FileWarning, t: "session_log.jsonl", s: "8.4 MB · 12,842 events", preview: `{"ts":"09:15:22","user":"U-1042","action":"usb_connect","device":"SanDisk 64GB"}\n{"ts":"09:18:47","user":"U-1042","action":"bulk_export","count":500}\n{"ts":"09:21:03","user":"U-1042","action":"sudo -i","result":"blocked"}`, hash: "9f3a…c721" },
  { i: Usb, t: "usb_metadata.plist", s: "SanDisk 64GB · fingerprint 0x77e2", preview: `<dict>\n  <key>Vendor</key><string>SanDisk</string>\n  <key>Serial</key><string>4C531001580709117433</string>\n  <key>FirstSeen</key><string>2026-07-16T09:15:22Z</string>\n</dict>`, hash: "12b0…8ffa" },
  { i: Download, t: "file_manifest.csv", s: "500 files · 1.2 GB · Q3 payments", preview: `path,size,sha256\n\\\\fs01\\payments\\Q3\\recon-001.xlsx,2.4MB,7c9a…\n\\\\fs01\\payments\\Q3\\recon-002.xlsx,2.1MB,ee31…\n… 498 more rows`, hash: "aa22…5d19" },
  { i: Wifi, t: "network_capture.pcap", s: "18.2 MB · 09:00–09:30 IST", preview: `09:01:12  10.24.19.7 → vpn-mumbai-02   TLS ClientHello\n09:15:22  10.24.19.7 → fs01              SMB2 CREATE payments\\Q3\n09:21:03  10.24.19.7 → jump-01           SSH SUDO REQUEST (blocked)`, hash: "d0c7…9911" },
];

const MITRE = [
  { id: "T1078", label: "Valid Accounts", tactic: "Initial Access", desc: "Adversaries obtain and abuse credentials of existing accounts to gain initial access, persist, escalate privileges, or evade defenses." },
  { id: "T1052", label: "Exfil over Physical Media", tactic: "Exfiltration", desc: "Adversaries attempt to exfiltrate data via a physical medium, such as a removable drive attached to a jump host." },
  { id: "T1548", label: "Abuse Elevation Control Mechanism", tactic: "Privilege Escalation", desc: "Adversaries may circumvent mechanisms designed to control elevated privileges (e.g. sudo, UAC)." },
  { id: "T1005", label: "Data from Local System", tactic: "Collection", desc: "Adversaries may search local system sources such as file systems and configuration files to find sensitive data." },
  { id: "T1071", label: "Application Layer Protocol", tactic: "Command & Control", desc: "Adversaries may communicate using OSI application layer protocols to avoid detection by blending in with normal traffic." },
];

function AttackPath() {
  const nodes = [
    { x: 60, y: 90, label: "Rahul D.", sub: "Identity", color: "var(--primary)" },
    { x: 260, y: 40, label: "VPN-Mumbai-02", sub: "Network", color: "var(--accent)" },
    { x: 260, y: 140, label: "MBP-RD-11", sub: "Endpoint", color: "var(--accent)" },
    { x: 480, y: 40, label: "jump-01", sub: "Jump host", color: "var(--warning)" },
    { x: 480, y: 140, label: "SanDisk USB", sub: "Removable", color: "var(--warning)" },
    { x: 700, y: 40, label: "hr_payroll DB", sub: "Data", color: "var(--critical)" },
    { x: 700, y: 140, label: "\\\\fs01\\payments", sub: "File share", color: "var(--critical)" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [2, 6], [4, 6],
  ];
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 800 200" className="w-full min-w-[720px] h-56">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.68 0.02 250 / 0.7)" />
          </marker>
        </defs>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x + 40}
            y1={nodes[a].y}
            x2={nodes[b].x - 40}
            y2={nodes[b].y}
            stroke="oklch(0.68 0.02 250 / 0.5)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            markerEnd="url(#arrow)"
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="26" fill="oklch(0.19 0.03 258)" stroke={n.color} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 6px ${n.color})` }} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">{n.label.length > 10 ? n.label.slice(0, 9) + "…" : n.label}</text>
            <text x={n.x} y={n.y + 46} textAnchor="middle" fontSize="9" fill="oklch(0.68 0.02 250)">{n.sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
