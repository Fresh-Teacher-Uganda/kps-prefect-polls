import { createFileRoute } from "@tanstack/react-router";
import { Crown, Radio } from "lucide-react";
import { ElectionSkeleton } from "@/components/kps/ElectionSkeleton";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { useCandidates } from "@/hooks/use-electoral";
import { POSITIONS } from "@/lib/electoral";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Live Results — KPS Elections 2026" },
      { name: "description", content: "Live vote tallies for every Kyengera Parents School prefect position." },
      { property: "og:title", content: "KPS Live Election Results" },
      { property: "og:description", content: "Follow the prefect race live." },
    ],
  }),
  component: Results,
});

function Results() {
  const { data, isLoading, error } = useCandidates(5000);
  const total = data?.reduce((s, c) => s + c.votes, 0) ?? 0;
  const positions = POSITIONS.filter((p) => data?.some((c) => c.position === p.value));

  return (
    <AppShell>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Live results</h1>
        <span className="flex items-center gap-1.5 rounded-full border border-destructive/60 px-3 py-1 text-xs font-semibold uppercase text-destructive">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live
        </span>
      </div>
      {!isLoading && !error && <p className="mt-1 text-muted-foreground"><span className="font-semibold text-gold">{total.toLocaleString()}</span> votes cast so far</p>}
      {isLoading && <ElectionSkeleton />}
      {error && <p role="alert" className="mt-6 text-destructive">Unable to load results. Please try again.</p>}
      {!isLoading && !error && positions.length === 0 && <p className="mt-6 text-muted-foreground">No approved candidates yet.</p>}

      <div className="mt-6 space-y-5">
        {positions.map((p) => {
          const list = (data ?? []).filter((c) => c.position === p.value);
          const sum = list.reduce((s, c) => s + c.votes, 0);
          return (
            <section key={p.value} className="rounded-3xl border border-gold/50 bg-card p-4">
              <h2 className="font-display text-lg font-bold uppercase">{p.label}</h2>
              <p className="text-xs text-muted-foreground">{sum} votes</p>
              <div className="mt-4 space-y-4">
                {list.map((c, i) => {
                  const pct = sum ? Math.round((c.votes / sum) * 100) : 0;
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="relative">
                        <CandidatePhoto name={c.student_name} url={c.photo_url} className={`h-12 w-12 rounded-full text-base ${i === 0 && sum ? "ring-2 ring-gold" : ""}`} />
                        {i === 0 && sum > 0 && <Crown className="absolute -top-2 -right-1 h-5 w-5 fill-gold text-gold" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate font-semibold">{c.student_name}</span>
                          <span className="font-display font-bold text-gold">{c.votes} · {pct}%</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-gold-gradient transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
