import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ElectionSkeleton } from "@/components/kps/ElectionSkeleton";
import { MapPin, Search } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { useCandidates } from "@/hooks/use-electoral";
import { POSITIONS, positionLabel } from "@/lib/electoral";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vote for your Prefects — KPS Elections 2026" },
      { name: "description", content: "Meet the Kyengera Parents School prefect candidates and vote for your favourite. Action Not Words." },
      { property: "og:title", content: "KPS Prefect Elections 2026" },
      { property: "og:description", content: "Meet the candidates and vote for your Kyengera Parents School prefects." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, isLoading, error } = useCandidates();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const usedPositions = POSITIONS.filter((p) => data?.some((c) => c.position === p.value));
  const list = (data ?? []).filter(
    (c) => (filter === "all" || c.position === filter) && c.student_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight">Vote for your favourite prefect</h1>
      <div className="mt-5 flex items-center gap-2 rounded-full border border-gold/40 bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidates" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2">
        {[{ value: "all", label: "All" }, ...usedPositions].map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${filter === p.value ? "border-gold bg-gold-gradient text-primary-foreground" : "border-gold/40 text-muted-foreground"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {isLoading && <ElectionSkeleton />}
        {error && <p role="alert" className="py-10 text-center text-destructive">Unable to load candidates. Please try again.</p>}
        {!isLoading && !error && list.length === 0 && <p className="py-10 text-center text-muted-foreground">No candidates found.</p>}
        {list.map((c) => (
          <Link
            key={c.id}
            to="/candidate/$id"
            params={{ id: c.id }}
            className="flex gap-4 rounded-3xl border-2 border-gold/60 bg-card p-3 transition hover:border-gold hover:shadow-gold"
          >
            <CandidatePhoto name={c.student_name} url={c.photo_url} className="h-40 w-32 shrink-0 rounded-2xl" />
            <div className="flex min-w-0 flex-1 flex-col items-end py-1 text-right">
              <h2 className="w-full truncate font-display text-lg font-bold uppercase">{c.student_name}</h2>
              <p className="mt-2 flex items-center gap-1 text-sm uppercase text-muted-foreground">
                <MapPin className="h-4 w-4" /> {c.class_name}{c.stream_name ? ` · ${c.stream_name}` : ""}
              </p>
              <p className="mt-1 text-sm uppercase text-muted-foreground">{positionLabel(c.position)}</p>
              <p className="mt-auto font-display text-2xl font-bold text-gold">{c.votes.toLocaleString()} votes</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
