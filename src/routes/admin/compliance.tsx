import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, Eye, FileDown, Scale, Loader2, CheckCircle2 } from "lucide-react";
import { rangePresets, computeMetrics, type TicketRow } from "@/lib/analytics-utils";
import { CATEGORIES } from "@/lib/ticket-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/compliance")({
  head: () => ({ meta: [{ title: "Compliance & Risk — Helix Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <AppShell area="admin"><Compliance /></AppShell>
    </RequireAuth>
  ),
});

// Simple lexicon-based bias indicators for AI-generated responses
const BIAS_TERMS = [
  "obviously", "clearly", "just", "simply", "everyone knows",
  "young man", "young lady", "guys", "girls", "elderly",
  "crazy", "insane", "stupid", "ridiculous", "you people",
];

type BiasFinding = {
  ticketId: string;
  excerpt: string;
  terms: string[];
  createdAt: string;
  category: string;
};

function Compliance() {
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [findings, setFindings] = useState<BiasFinding[]>([]);
  const [auditLog, setAuditLog] = useState<{ at: string; actor: string; action: string; target: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const range = useMemo(() => rangePresets()["30d"], []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: ts, error: e1 }, { data: msgs }] = await Promise.all([
        supabase.from("tickets")
          .select("id,status,priority,category,user_id,assigned_to,created_at,resolved_at,closed_at,first_response_at")
          .gte("created_at", range.from.toISOString())
          .limit(2000),
        supabase.from("ticket_messages")
          .select("id,ticket_id,body,created_at,user_id,is_ai")
          .gte("created_at", range.from.toISOString())
          .limit(2000),
      ]);
      if (e1) toast.error(e1.message);
      setTickets((ts ?? []) as TicketRow[]);

      // Bias scan
      const ticketById = new Map((ts ?? []).map((t: any) => [t.id, t]));
      const f: BiasFinding[] = [];
      (msgs ?? []).forEach((m: any) => {
        if (!m.body) return;
        const text = String(m.body).toLowerCase();
        const hits = BIAS_TERMS.filter((t) => text.includes(t));
        if (hits.length) {
          const tk = ticketById.get(m.ticket_id) as any;
          f.push({
            ticketId: m.ticket_id,
            excerpt: String(m.body).slice(0, 160) + (m.body.length > 160 ? "…" : ""),
            terms: hits,
            createdAt: m.created_at,
            category: tk?.category ?? "—",
          });
        }
      });
      setFindings(f.slice(0, 25));

      // Audit log = last status changes (synthetic from tickets)
      const log = (ts ?? [])
        .filter((t: any) => t.resolved_at || t.closed_at)
        .slice(0, 15)
        .map((t: any) => ({
          at: t.closed_at || t.resolved_at,
          actor: t.assigned_to ? "Agent" : "System",
          action: t.closed_at ? "closed" : "resolved",
          target: `Ticket ${String(t.id).slice(0, 8)}`,
        }));
      setAuditLog(log);

      setLoading(false);
    })();
  }, []);

  const risk = useMemo(() => {
    const rows = tickets ?? [];
    const m = computeMetrics(rows);
    const escalRate = m.total ? Math.round((m.escalated / m.total) * 100) : 0;
    const backlogRate = m.total ? Math.round((m.backlog / m.total) * 100) : 0;
    const biasRate = rows.length ? Math.round((findings.length / rows.length) * 100) : 0;
    const score = Math.max(0, 100 - escalRate * 1.5 - backlogRate * 0.5 - biasRate * 2);
    const level = score >= 80 ? "Low" : score >= 60 ? "Moderate" : score >= 40 ? "Elevated" : "High";
    return { score: Math.round(score), level, escalRate, backlogRate, biasRate };
  }, [tickets, findings]);

  const exportReport = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      window: "Last 30 days",
      risk_score: risk.score,
      risk_level: risk.level,
      metrics: risk,
      bias_findings: findings,
      audit_log: auditLog,
      transparency_notes: TRANSPARENCY_NOTES,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `risk-report-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Risk evaluation report downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compliance & risk</h1>
          <p className="text-sm text-muted-foreground">Bias detection, audit logging, transparency notes, and risk scoring.</p>
        </div>
        <Button onClick={exportReport} variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />Download risk report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Risk score</p>
            <p className="mt-1 text-3xl font-semibold">{risk.score}<span className="text-base text-muted-foreground">/100</span></p>
            <Badge variant={risk.level === "Low" ? "secondary" : "destructive"} className="mt-2">{risk.level}</Badge>
          </CardContent>
        </Card>
        <RiskStat label="Escalation rate" value={`${risk.escalRate}%`} icon={AlertTriangle} />
        <RiskStat label="Backlog rate" value={`${risk.backlogRate}%`} icon={Scale} />
        <RiskStat label="Bias indicators" value={`${findings.length}`} icon={Eye} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Bias detection</CardTitle>
            <CardDescription>Messages flagged by lexicon scan. Review for tone and inclusivity.</CardDescription>
          </CardHeader>
          <CardContent>
            {findings.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />No bias indicators detected.
              </div>
            ) : (
              <ul className="space-y-3 max-h-[360px] overflow-auto">
                {findings.map((f, i) => (
                  <li key={i} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(f.createdAt).toLocaleString()}</span>
                      <span>{CATEGORIES.find((c) => c.value === f.category)?.label ?? f.category}</span>
                    </div>
                    <p className="mt-1 text-sm">{f.excerpt}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.terms.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Audit log</CardTitle>
            <CardDescription>Recent state changes for traceability.</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent actions.</p>
            ) : (
              <ul className="space-y-2 text-sm max-h-[360px] overflow-auto">
                {auditLog.map((a, i) => (
                  <li key={i} className="flex items-center justify-between border-b last:border-0 py-1.5">
                    <div>
                      <span className="font-medium">{a.actor}</span>
                      <span className="text-muted-foreground"> {a.action} </span>
                      <span className="font-mono text-xs">{a.target}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transparency notes</CardTitle>
          <CardDescription>Disclosures for end users and reviewers about how AI is used in this system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm list-disc pl-5">
            {TRANSPARENCY_NOTES.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const TRANSPARENCY_NOTES = [
  "AI classification suggests a category and confidence score; a human agent retains final assignment authority.",
  "AI-suggested responses are clearly labelled before sending and never auto-sent to customers without review.",
  "Personal data sent to AI providers is limited to the ticket subject, description, and category metadata.",
  "Bias scanning is lexicon-based and indicative only — not a substitute for human review of sensitive cases.",
  "All status changes, AI outputs, and agent actions are logged with timestamp and actor for audit.",
  "Users may request an explanation of any AI-driven decision affecting their ticket.",
];

function RiskStat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
          <div className="rounded-md p-2 bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}
