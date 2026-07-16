import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAegis } from "@/lib/aegis-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · AegisIQ" },
      { name: "description", content: "SOC Analyst sign-in for the AegisIQ platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { auth, login } = useAegis();
  const [email, setEmail] = useState("admin@bankofmaharashtra.com");
  const [password, setPassword] = useState("Aegis@123");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => { if (auth) nav({ to: "/" }); }, [auth, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (ok) { toast.success("Welcome back, Karan"); nav({ to: "/" }); }
    else toast.error("Invalid credentials", { description: "Use the demo credentials shown below." });
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden border-r border-border/60">
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
        <div className="relative flex items-center gap-2.5">
          <div className="size-10 rounded-lg grid place-items-center bg-primary/10 glow-cyan">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-lg">Aegis<span className="text-primary text-glow">IQ</span></div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Privileged Access AI</div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            AI-Powered Privileged Access & Insider Threat Intelligence
          </h2>
          <p className="text-sm text-muted-foreground">
            Purpose-built for enterprise banks. Baseline every privileged identity, detect insider risk in real-time,
            and enforce risk-based access — with full explainability for RBI, ISO 27001 and SOC 2.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[["1,842", "Identities"], ["12,842/s", "Events"], ["98%", "AI Confidence"]].map(([v, l]) => (
              <div key={l} className="panel p-3">
                <div className="text-lg font-semibold text-primary">{v}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-[11px] text-muted-foreground">
          © 2026 AegisIQ · Tenant: Bank of Maharashtra
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm panel p-8 space-y-5">
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="size-9 rounded-lg grid place-items-center bg-primary/10 glow-cyan">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div className="font-semibold tracking-tight">Aegis<span className="text-primary text-glow">IQ</span></div>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sign in to the SOC console</h1>
            <p className="text-xs text-muted-foreground mt-1">Enterprise SSO · MFA enforced</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Corporate email</label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={email} onChange={e => setEmail(e.target.value)} required
                className="pl-9 pr-3 h-10 w-full rounded-lg bg-background border border-border/60 text-sm outline-none focus:border-primary/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                className="pl-9 pr-9 h-10 w-full rounded-lg bg-background border border-border/60 text-sm outline-none focus:border-primary/60" />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button disabled={busy} className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="size-4 animate-spin" />} {busy ? "Authenticating…" : "Sign in securely"}
          </button>

          <div className="p-3 rounded-lg bg-background/40 border border-dashed border-border text-[11px] text-muted-foreground">
            <div className="uppercase tracking-wider text-[10px] mb-1">Demo credentials</div>
            <div className="font-mono">admin@bankofmaharashtra.com</div>
            <div className="font-mono">Aegis@123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
