import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ElectionSkeleton } from "@/components/kps/ElectionSkeleton";
import { Clock, CheckCircle2, XCircle, LogOut, ShieldCheck } from "lucide-react";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useUser } from "@/hooks/use-electoral";
import { positionLabel } from "@/lib/electoral";
import { Gate } from "./apply";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "My Application — KPS Elections 2026" },
      { name: "description", content: "Track the status of your prefect candidate application." },
      { property: "og:title", content: "KPS Application Status" },
      { property: "og:description", content: "Track your prefect application." },
    ],
  }),
  component: StatusPage,
});

const STATUS = {
  pending: { icon: Clock, label: "Under review", cls: "text-gold", text: "The Electoral Commission is reviewing your application." },
  approved: { icon: CheckCircle2, label: "Approved", cls: "text-success", text: "Congratulations! You are on the ballot." },
  rejected: { icon: XCircle, label: "Not approved", cls: "text-destructive", text: "Your application was not approved this time." },
} as const;

function StatusPage() {
  const { user, ready } = useUser();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: app, isLoading, error } = useQuery({
    queryKey: ["my-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("electoral_applications").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (ready && !user) return <AppShell><Gate text="Sign in to see your application." /></AppShell>;
  if (!ready || isLoading) return <AppShell><ElectionSkeleton detail /></AppShell>;
  if (error) return <AppShell><p role="alert" className="mt-6 text-destructive">Unable to load your application. Please try again.</p></AppShell>;
  const s = app ? STATUS[app.status as keyof typeof STATUS] ?? STATUS.pending : null;

  return (
    <AppShell>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">My account</h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-sm text-muted-foreground"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
      <p className="text-sm text-muted-foreground">{user?.email}</p>

      {isAdmin && (
        <Link to="/admin" className="mt-5 flex items-center gap-3 rounded-2xl border border-gold bg-accent p-4">
          <ShieldCheck className="h-6 w-6 text-gold" /><span className="font-semibold">Electoral Commission — review applications</span>
        </Link>
      )}

      {!app || !s ? (
        <div className="mt-6 rounded-3xl border-2 border-gold/50 bg-card p-8 text-center">
          <p className="font-display text-xl">You haven't applied yet.</p>
          <Link to="/apply" className="mt-5 block rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground">Apply for a position</Link>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border-2 border-gold/60 bg-card p-6 text-center">
          <CandidatePhoto name={app.student_name} url={app.photo_url} className="mx-auto h-24 w-24 rounded-full ring-2 ring-gold" />
          <p className="mt-3 font-display text-xl font-bold uppercase">{app.student_name}</p>
          <p className="text-sm text-muted-foreground">{positionLabel(app.position)} · {app.class_name}</p>
          <div className={`mt-5 flex items-center justify-center gap-2 font-display text-lg font-semibold ${s.cls}`}><s.icon className="h-6 w-6" /> {s.label}</div>
          <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          <p className="mt-3 text-xs text-muted-foreground">Submitted {new Date(app.created_at).toLocaleDateString()}</p>
          {app.status === "pending" && <Link to="/apply" className="mt-5 block rounded-full border border-gold/60 py-3">Edit application</Link>}
          {app.status === "approved" && <Link to="/candidate/$id" params={{ id: app.id }} className="mt-5 block rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground">View my candidate page</Link>}
        </div>
      )}
    </AppShell>
  );
}
