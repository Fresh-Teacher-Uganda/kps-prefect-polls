import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, CandidatePhoto } from "@/components/kps/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useUser } from "@/hooks/use-electoral";
import { positionLabel } from "@/lib/electoral";
import { Gate } from "./apply";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Electoral Commission — KPS Elections 2026" },
      { name: "description", content: "Review and approve prefect candidate applications." },
      { property: "og:title", content: "KPS Electoral Commission" },
      { property: "og:description", content: "Review candidate applications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, ready } = useUser();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");
  const { data } = useQuery({
    queryKey: ["admin-apps"],
    enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("electoral_applications").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  if (ready && !user) return <AppShell><Gate text="Sign in as the Electoral Commission." /></AppShell>;
  if (!roleLoading && user && !isAdmin) return <AppShell><p className="mt-16 text-center text-muted-foreground">Only the Electoral Commission can open this page.</p></AppShell>;

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("electoral_applications").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Application ${status}`);
    qc.invalidateQueries();
  }

  const list = (data ?? []).filter((a) => a.status === tab);

  return (
    <AppShell>
      <h1 className="mt-2 font-display text-3xl font-bold">Electoral Commission</h1>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["pending", "approved", "rejected"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full border py-2 text-sm capitalize ${tab === t ? "border-gold bg-gold-gradient text-primary-foreground" : "border-gold/40"}`}>
            {t} ({(data ?? []).filter((a) => a.status === t).length})
          </button>
        ))}
      </div>
      <div className="mt-5 space-y-4">
        {list.length === 0 && <p className="py-10 text-center text-muted-foreground">Nothing here.</p>}
        {list.map((a) => (
          <div key={a.id} className="rounded-3xl border border-gold/50 bg-card p-4">
            <div className="flex gap-3">
              <CandidatePhoto name={a.student_name} url={a.photo_url} className="h-16 w-16 shrink-0 rounded-2xl text-xl" />
              <div className="min-w-0">
                <p className="font-display font-bold uppercase">{a.student_name}</p>
                <p className="text-sm text-gold">{positionLabel(a.position)}</p>
                <p className="text-xs text-muted-foreground">{a.class_name} {a.stream_name}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{a.manifesto}</p>
            <div className="mt-3 flex gap-2">
              {a.status !== "approved" && <button onClick={() => setStatus(a.id, "approved")} className="flex-1 rounded-full bg-gold-gradient py-2 text-sm font-semibold text-primary-foreground">Approve</button>}
              {a.status !== "rejected" && <button onClick={() => setStatus(a.id, "rejected")} className="flex-1 rounded-full border border-destructive/60 py-2 text-sm text-destructive">Reject</button>}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
