import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ElectionSkeleton } from "@/components/kps/ElectionSkeleton";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-electoral";
import { APPLY_CLASS, APPLY_STREAM, PUPILS, fileToSmallDataUrl, positionLabel, positionsForClass } from "@/lib/electoral";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply as Candidate — KPS Elections 2026" },
      { name: "description", content: "Apply to run for a prefect position at Kyengera Parents School." },
      { property: "og:title", content: "Run for Prefect at KPS" },
      { property: "og:description", content: "Submit your candidate application and manifesto." },
    ],
  }),
  component: ApplyPage,
});

const steps = ["Details", "Position", "Manifesto", "Review"];

function ApplyPage() {
  const { user, ready } = useUser();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const { data: application, isLoading, error } = useQuery({
    queryKey: ["my-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("electoral_applications").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [f, setF] = useState({ student_name: "", class_name: APPLY_CLASS, stream_name: APPLY_STREAM, age: "", position: "", experience: "", manifesto: "", photo_url: "" });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!user || application === undefined) return;
    if (application) {
      setExistingId(application.id);
      setLocked(application.status !== "pending");
      setF({ student_name: application.student_name, class_name: APPLY_CLASS, stream_name: APPLY_STREAM, age: application.age ? String(application.age) : "", position: application.position, experience: application.experience ?? "", manifesto: application.manifesto, photo_url: application.photo_url ?? "" });
    }
    setLoadedUserId(user.id);
  }, [user, application]);

  if (ready && !user) {
    return <AppShell><Gate text="Sign in to apply as a candidate." /></AppShell>;
  }
  if (error) return <AppShell><p role="alert" className="mt-6 text-destructive">Unable to load your application. Please try again.</p></AppShell>;
  if (!ready || isLoading || loadedUserId !== user?.id) return <AppShell><ElectionSkeleton detail /></AppShell>;
  if (locked) {
    return <AppShell><Gate text="Your application has already been reviewed." to="/status" cta="View my application" /></AppShell>;
  }

  const positions = positionsForClass(f.class_name);
  const canNext = [
    f.student_name.trim() && f.class_name,
    f.position,
    f.manifesto.trim().length >= 20,
    true,
  ][step];

  async function submit() {
    if (!user) return;
    setBusy(true);
    const row = { user_id: user.id, student_name: f.student_name.trim(), class_name: f.class_name, stream_name: f.stream_name || null, age: f.age ? Number(f.age) : null, position: f.position, experience: f.experience || null, manifesto: f.manifesto.trim(), photo_url: f.photo_url || null, status: "pending" };
    const { error } = existingId
      ? await supabase.from("electoral_applications").update({ ...row, updated_at: new Date().toISOString() }).eq("id", existingId)
      : await supabase.from("electoral_applications").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Application for ${positionLabel(f.position)} submitted to the Electoral Commission.`);
    qc.invalidateQueries();
    nav({ to: "/status" });
  }

  const input = "w-full rounded-xl border border-input bg-background/50 px-4 py-3 outline-none focus:border-gold";

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-3xl font-bold">{existingId ? "Edit application" : "Run for prefect"}</h1>
      <div className="mt-4 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gold-gradient" : "bg-card"}`} />
            <p className={`mt-1 text-[11px] uppercase ${i === step ? "text-gold" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border-2 border-gold/50 bg-card p-5">
        {step === 0 && (
          <>
            <label className="mx-auto flex w-fit cursor-pointer flex-col items-center gap-2">
              <div className="relative">
                <CandidatePhoto name={f.student_name || "?"} url={f.photo_url || null} className="h-28 w-28 rounded-full ring-2 ring-gold" />
                <span className="absolute bottom-0 right-0 rounded-full bg-gold-gradient p-2 text-primary-foreground"><Camera className="h-4 w-4" /></span>
              </div>
              <span className="text-xs text-muted-foreground">Add your photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("photo_url", await fileToSmallDataUrl(file)); }} />
            </label>
            <select aria-label="Your name" className={input} value={f.student_name} onChange={(e) => set("student_name", e.target.value)}>
              <option value="">Choose your name</option>
              {PUPILS.map((n) => <option key={n}>{n}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-3">
              <input aria-label="Class" disabled value={APPLY_CLASS} className={`${input} cursor-not-allowed opacity-60`} />
              <input aria-label="Stream" disabled value={APPLY_STREAM} className={`${input} cursor-not-allowed opacity-60`} />
              <input className={input} type="number" min={5} max={16} placeholder="Age" value={f.age} onChange={(e) => set("age", e.target.value)} />
            </div>
          </>
        )}
        {step === 1 && (
          positions.length === 0 ? (
            <p className="text-muted-foreground">There are no prefect positions open for {f.class_name}. Only pupils in P2–P6 can apply.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Positions open for {f.class_name}: {positions.length}</p>
              {positions.map((p) => (
                <button key={p.value} onClick={() => set("position", p.value)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${f.position === p.value ? "border-gold bg-accent" : "border-gold/30"}`}>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${f.position === p.value ? "border-gold bg-gold text-primary-foreground" : "border-gold/50"}`}>{f.position === p.value && <Check className="h-3 w-3" />}</div>
                  <div><p className="font-semibold">{p.label}</p><p className="text-sm text-muted-foreground">{p.description}</p></div>
                </button>
              ))}
            </div>
          )
        )}
        {step === 2 && (
          <>
            <textarea className={`${input} min-h-20`} placeholder="Leadership experience (optional)" value={f.experience} onChange={(e) => set("experience", e.target.value)} />
            <textarea className={`${input} min-h-40`} placeholder="Your manifesto — why should pupils vote for you? (at least 20 characters)" value={f.manifesto} onChange={(e) => set("manifesto", e.target.value)} />
          </>
        )}
        {step === 3 && (
          <div className="space-y-2 text-sm">
            <Row k="Name" v={f.student_name} /><Row k="Class" v={`${f.class_name} ${f.stream_name}`} /><Row k="Position" v={positionLabel(f.position)} />
            <p className="pt-2 text-muted-foreground">Manifesto</p><p className="whitespace-pre-line">{f.manifesto}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-full border border-gold/50 py-3">Back</button>}
        {step < 3 ? (
          <button disabled={!canNext} onClick={() => setStep(step + 1)} className="flex-1 rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground disabled:opacity-40">Next</button>
        ) : (
          <button disabled={busy} onClick={submit} className="flex-1 rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground disabled:opacity-40">{existingId ? "Update application" : "Submit application"}</button>
        )}
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-gold/20 py-2"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>;
}

export function Gate({ text, to = "/auth", cta = "Sign in" }: { text: string; to?: "/auth" | "/status"; cta?: string }) {
  return (
    <div className="mt-16 rounded-3xl border-2 border-gold/60 bg-card p-8 text-center">
      <p className="font-display text-xl">{text}</p>
      <Link to={to} className="mt-6 block rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground">{cta}</Link>
    </div>
  );
}
