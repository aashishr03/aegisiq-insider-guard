import { type ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "critical" | "warning" | "success" | "indigo";
  trend?: { value: string; up?: boolean };
}) {
  const accentMap = {
    primary: "text-primary",
    critical: "text-critical",
    warning: "text-warning",
    success: "text-success",
    indigo: "text-accent",
  } as const;
  return (
    <div className="panel p-4 relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
          <div className={`mt-2 text-2xl font-semibold tracking-tight ${accentMap[accent]}`}>{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className={`size-9 rounded-lg grid place-items-center bg-background/50 border border-border/60 ${accentMap[accent]}`}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-2 text-xs ${trend.up ? "text-critical" : "text-success"}`}>
          {trend.up ? "▲" : "▼"} {trend.value}
        </div>
      )}
      <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition" />
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function SeverityBadge({ level }: { level: "critical" | "high" | "medium" | "low" | "info" }) {
  const map = {
    critical: "bg-critical/15 text-critical border-critical/30",
    high: "bg-warning/15 text-warning border-warning/30",
    medium: "bg-accent/15 text-accent border-accent/30",
    low: "bg-primary/10 text-primary border-primary/30",
    info: "bg-muted text-muted-foreground border-border/60",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md border ${map[level]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    allowed: "text-success bg-success/10 border-success/25",
    flagged: "text-warning bg-warning/10 border-warning/25",
    blocked: "text-critical bg-critical/10 border-critical/25",
    review: "text-accent bg-accent/10 border-accent/25",
    active: "text-success bg-success/10 border-success/25",
    idle: "text-warning bg-warning/10 border-warning/25",
    offline: "text-muted-foreground bg-muted border-border/60",
    success: "text-success bg-success/10 border-success/25",
    denied: "text-critical bg-critical/10 border-critical/25",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md border capitalize ${map[status] ?? "text-muted-foreground bg-muted border-border/60"}`}>
      {status}
    </span>
  );
}

export function RiskGauge({ score, size = 200 }: { score: number; size?: number }) {
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = circumference * pct;
  const color = score >= 80 ? "var(--critical)" : score >= 60 ? "var(--warning)" : score >= 40 ? "var(--accent)" : "var(--success)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="oklch(0.30 0.03 260 / 0.5)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-bold tracking-tight" style={{ color }}>
            {score}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Risk Score</div>
        </div>
      </div>
    </div>
  );
}
