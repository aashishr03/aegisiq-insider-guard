import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, ShieldQuestion } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const suggestions = [
  "Why is Rahul high risk?",
  "Explain Incident INC-2044",
  "Recommend response",
  "Generate executive summary",
];

const scriptedReplies: Record<string, string> = {
  "why is rahul high risk":
    "Rahul Deshmukh (U-1042, Core Banking Admin) scored **91/100**. The AI Security Twin™ detected 6 signals:\n\n• Unknown device (+22)\n• Outside working hours (+14)\n• USB attached (+18)\n• Bulk download 500 files (+26)\n• Privilege escalation attempt (+18)\n• Behaviour deviation 87% (+8)\n\nConfidence 98%. Recommended: block session + step-up MFA.",
  "explain incident inc-2044":
    "**INC-2044 · Suspected insider data exfiltration**\n\nSubject: Rahul Deshmukh · Opened 09:24 IST\nTimeline: 09:01 login from VPN-Mumbai-02 → 09:15 USB attached → 09:18 500 files staged → 09:21 sudo -i blocked → 09:24 AI alert.\nMTTD 3m 12s · MTTR 6m 40s. Impact: contained pre-exfil. Not RBI-reportable.",
  "recommend response":
    "Playbook: **Contain → Verify → Remediate**\n\n1. Terminate active session on jump-01\n2. Revoke JIT elevation, rotate service creds\n3. Quarantine host MBP-RD-11 for forensics\n4. Notify SOC lead + Compliance\n5. Schedule interview with employee & line manager",
  "generate executive summary":
    "**Weekly Executive Summary**\n\n• 118 incidents (18 critical) · MTTD ↓ 42% WoW to 3m 12s\n• Top risk dept: Vendor Access (84) — recommend JIT-only\n• 6 sessions auto-blocked, 193 MFA challenges issued\n• Notable: INC-2044 contained pre-exfil, no data loss\n• AI confidence average: 96.4% across all alerts",
};

function reply(q: string): string {
  const key = q.trim().toLowerCase().replace(/[?.!]/g, "");
  for (const k of Object.keys(scriptedReplies)) {
    if (key.includes(k)) return scriptedReplies[k];
  }
  return "I've correlated your query across 12,842 events/s. Based on current telemetry, no critical action is needed — but 3 users are trending toward high-risk. Want me to open a watchlist?";
}

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi Karan. I'm your AegisIQ Copilot. I've analyzed today's telemetry across 1,842 privileged users. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, open]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: reply(q) }]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-2xl grid place-items-center bg-gradient-to-br from-primary to-accent glow-cyan hover:scale-105 transition-transform"
      >
        {open ? <X className="size-5 text-primary-foreground" /> : <Bot className="size-6 text-primary-foreground" />}
        {!open && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-success pulse-dot-inner" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] h-[560px] panel flex flex-col overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-border/60 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 grid place-items-center glow-cyan">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">AegisIQ Copilot</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success pulse-dot-inner" />
                Online · GPT-Aegis v4
              </div>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border/60 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {suggestions.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 hover:border-primary/60 hover:text-primary text-muted-foreground transition"
              >
                <ShieldQuestion className="size-3 inline -mt-0.5 mr-1" />
                {s}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-border/60 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask the AI Security Analyst…"
              className="flex-1 h-10 rounded-lg bg-background border border-border/60 px-3 text-sm outline-none focus:border-primary/60"
            />
            <button
              onClick={() => send()}
              className="size-10 rounded-lg bg-primary text-primary-foreground grid place-items-center hover:opacity-90"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
