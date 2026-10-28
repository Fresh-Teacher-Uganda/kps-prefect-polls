import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ElectionSkeleton } from "@/components/kps/ElectionSkeleton";
import { Check, ChevronRight, Lock } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { VoteSheet } from "@/components/kps/VoteSheet";
import { useCandidates, useMyVotes, useUser, type Candidate } from "@/hooks/use-electoral";
import { POSITIONS } from "@/lib/electoral";

export const Route = createFileRoute("/vote")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Ballot — KPS Elections 2026" },
      { name: "description", content: "Cast your ballot for each prefect position at Kyengera Parents School." },
      { property: "og:title", content: "KPS Prefect Ballot" },
      { property: "og:description", content: "One vote per position. Action Not Words." },
    ],
  }),
  component: VotePage,
});

function VotePage() {
  const { user, ready } = useUser();
  const { data: candidates, isLoading: candidatesLoading, error: candidatesError } = useCandidates();
  const { data: myVotes, isLoading: votesLoading, error: votesError } = useMyVotes(user?.id);
  const [active, setActive] = useState<string | null>(null);
  const [pick, setPick] = useState<Candidate | null>(null);

  const positions = POSITIONS.filter((p) => candidates?.some((c) => c.position === p.value));
  const done = positions.filter((p) => myVotes?.some((v) => v.position === p.value)).length;

  if (ready && !user) {
    return (
      <AppShell>
        <div className="mt-16 rounded-3xl border-2 border-gold/60 bg-card p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-4 font-display text-2xl font-bold">Sign in to vote</h1>
          <p className="mt-2 text-muted-foreground">Each pupil gets one vote per position.</p>
          <Link to="/auth" className="mt-6 block rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground">Sign in</Link>
        </div>
      </AppShell>
    );
  }

  const current = positions.find((p) => p.value === active);
  if (!ready || candidatesLoading || votesLoading) return <AppShell><h1 className="mt-2 font-display text-3xl font-bold">Your ballot</h1><ElectionSkeleton /></AppShell>;
  if (candidatesError || votesError) return <AppShell><p role="alert" className="mt-6 text-destructive">Unable to load your ballot. Please try again.</p></AppShell>;

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-3xl font-bold">Your ballot</h1>
      <p className="mt-1 text-muted-foreground">{done} of {positions.length} positions voted</p>
      {positions.length === 0 && <p className="mt-6 text-muted-foreground">No approved candidates yet.</p>}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
        <div className="h-full bg-gold-gradient transition-all" style={{ width: `${positions.length ? (done / positions.length) * 100 : 0}%` }} />
      </div>

      {!current ? (
        <div className="mt-6 space-y-3">
          {positions.map((p) => {
            const v = myVotes?.find((x) => x.position === p.value);
            const votedFor = candidates?.find((c) => c.id === v?.application_id);
            return (
              <button key={p.value} onClick={() => !v && setActive(p.value)} disabled={!!v} className="flex w-full items-center gap-4 rounded-2xl border border-gold/50 bg-card p-4 text-left disabled:opacity-80">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${v ? "bg-success text-primary-foreground" : "border border-gold text-gold"}`}>
                  {v ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold uppercase">{p.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{v ? `Voted: ${votedFor?.student_name ?? ""}` : p.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <button onClick={() => setActive(null)} className="text-sm text-gold">← All positions</button>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase">{current.label}</h2>
          <p className="text-sm text-muted-foreground">{current.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {candidates?.filter((c) => c.position === current.value).map((c) => (
              <button key={c.id} onClick={() => setPick(c)} className="overflow-hidden rounded-3xl border-2 border-gold/60 bg-card text-left transition hover:border-gold hover:shadow-gold">
                <CandidatePhoto name={c.student_name} url={c.photo_url} className="h-40 w-full" />
                <div className="p-3">
                  <p className="truncate font-display font-bold uppercase">{c.student_name}</p>
                  <p className="text-xs text-muted-foreground">{c.class_name}{c.stream_name ? ` · ${c.stream_name}` : ""}</p>
                  <p className="mt-2 rounded-full bg-gold-gradient py-1.5 text-center text-sm font-semibold text-primary-foreground">Vote</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <VoteSheet candidate={pick} userId={user?.id} onClose={() => setPick(null)} onDone={() => setActive(null)} />
    </AppShell>
  );
}
