import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, RequireAuth } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis, Bar, BarChart } from "recharts";
import { TrendingUp, AlertTriangle, Activity, Loader2 } from "lucide-react";
import { bucketByDay, rangePresets, type TicketRow } from "@/lib/analytics-utils";
import { CATEGORIES } from "@/lib/ticket-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/predictions")({
  head: () => ({ meta: [{ title: "Trend predictions — Helix Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <AppShell area="admin"><Predictions /></AppShell>
    </RequireAuth>
  ),
});

function movingAverage(values: number[], window: number) {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
}

function linearForecast(values: number[], horizon: number) {
  const n = values.length;
  if (n < 2) return Array(horizon).fill(values[n - 1] ?? 0);
  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - xMean) * (values[i] - yMean); den += (xs[i] - xMean) ** 2; }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Array.from({ length: horizon }, (_, k) => Math.max(0, Math.round(intercept + slope * (n + k))));
}

function Predictions() {
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const range = useMemo(() => rangePresets()["90d"], []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tickets")
        .select("id,status,priority,category,user_id,assigned_to,created_at,resolved_at,closed_at,first_response_at")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString())
        .limit(5000);
      if (error) toast.error(error.message);
      setTickets((data ?? []) as TicketRow[]);
      setLoading(false);
    })();
  }, []);

  const { combined, surgeAlerts, byCategory, projectedWorkload } = useMemo(() => {
    const rows = tickets ?? [];
    const daily = bucketByDay(rows, range);
    const opens = daily.map((d) => d.opened);
    const ma7 = movingAverage(opens, 7);
    const horizon = 14;
    const forecast = linearForecast(opens.slice(-30), horizon);
    const lastDate = daily.length ? daily[daily.length - 1].date : new Date();

    const combined = [
      ...daily.map((d, i) => ({
        day: d.day,
        actual: d.opened,
        trend: Math.round(ma7[i] * 10) / 10,
        forecast: null as number | null,
      })),
      ...forecast.map((v, k) => {
        const dt = new Date(lastDate.getTime() + (k + 1) * 86_400_000);
        return {
          day: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          actual: null as number | null,
          trend: null as number | null,
          forecast: v,
        };
      }),
    ];

    // Surge alerts: forecast > 1.5x recent average
    const recentAvg = opens.slice(-14).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(14, opens.length));
    const peak = Math.max(...forecast);
    const surgeAlerts: { day: string; predicted: number; vsAvg: number }[] = [];
    forecast.forEach((v, k) => {
      if (v > recentAvg * 1.5 && v >= 3) {
        const dt = new Date(lastDate.getTime() + (k + 1) * 86_400_000);
        surgeAlerts.push({
          day: dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
          predicted: v,
          vsAvg: recentAvg ? Math.round(((v - recentAvg) / recentAvg) * 100) : 0,
        });
      }
    });

    // Per-category projections (sum next 14 days)
    const categoryTotals = new Map<string, number[]>();
    daily.forEach((d, i) => {
      // distribute by ratio observed in that period
    });
    const catCounts: Record<string, number> = {};
    rows.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const totalCount = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
    const projectedTotal = forecast.reduce((a, b) => a + b, 0);
    const byCategory = CATEGORIES.map((c) => ({
      category: c.label,
      projected: Math.round((catCounts[c.value] || 0) / totalCount * projectedTotal),
    })).filter((x) => x.projected > 0).sort((a, b) => b.projected - a.projected);

    const projectedWorkload = {
      next14: projectedTotal,
      peak,
      avgDaily: Math.round(projectedTotal / horizon),
    };

    return { combined, surgeAlerts, byCategory, projectedWorkload };
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trend predictions</h1>
        <p className="text-sm text-muted-foreground">Forecast ticket surges and projected workload using historical data (last 90 days).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Activity} label="Projected tickets (next 14d)" value={projectedWorkload.next14} />
        <StatCard icon={TrendingUp} label="Avg projected / day" value={projectedWorkload.avgDaily} />
        <StatCard icon={AlertTriangle} label="Peak forecast (1 day)" value={projectedWorkload.peak} tone={projectedWorkload.peak > projectedWorkload.avgDaily * 1.5 ? "warn" : undefined} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume forecast</CardTitle>
          <CardDescription>Actual opens, 7-day trend, and 14-day linear forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              actual: { label: "Actual", color: "hsl(var(--chart-1))" },
              trend: { label: "7-day trend", color: "hsl(var(--chart-2))" },
              forecast: { label: "Forecast", color: "hsl(var(--chart-4))" },
            }}
            className="h-[320px] w-full"
          >
            <LineChart data={combined}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="trend" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="forecast" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Surge alerts</CardTitle>
            <CardDescription>Days where projected volume exceeds recent average by 50%+.</CardDescription>
          </CardHeader>
          <CardContent>
            {surgeAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No surges projected in the next 14 days.</p>
            ) : (
              <ul className="space-y-2">
                {surgeAlerts.map((s, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border bg-amber-500/5 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{s.day}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{s.predicted}</span>
                      <span className="ml-2 text-amber-600">+{s.vsAvg}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected workload by category</CardTitle>
            <CardDescription>Next 14 days, distributed by historical category mix.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ projected: { label: "Projected", color: "hsl(var(--chart-3))" } }}
              className="h-[280px] w-full"
            >
              <BarChart data={byCategory} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="projected" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${tone === "warn" ? "text-amber-600" : ""}`}>{value}</p>
          </div>
          <div className={`rounded-md p-2 ${tone === "warn" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
