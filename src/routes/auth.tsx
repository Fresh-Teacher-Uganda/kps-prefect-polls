import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Crest } from "@/components/kps/AppShell";
import { useUser } from "@/hooks/use-electoral";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — KPS Elections 2026" },
      { name: "description", content: "Sign in to vote or apply in the Kyengera Parents School prefect elections." },
      { property: "og:title", content: "Sign in — KPS Elections" },
      { property: "og:description", content: "Sign in to vote or apply." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user } = useUser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/vote" }); }, [user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) toast.success("Check your email to confirm your account.");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="text-center">
        <Crest className="mx-auto h-24 w-24" />
        <h1 className="mt-4 font-display text-3xl font-bold">Kyengera Parents School</h1>
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Action Not Words</p>
      </div>
      <form onSubmit={submit} className="mt-8 space-y-3 rounded-3xl border-2 border-gold/50 bg-card p-6">
        <h2 className="font-display text-xl font-semibold">{mode === "in" ? "Sign in to vote" : "Create your account"}</h2>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 outline-none focus:border-gold" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 outline-none focus:border-gold" />
        <button disabled={busy} className="w-full rounded-full bg-gold-gradient py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {mode === "in" ? "Sign in" : "Sign up"}
        </button>
        <button type="button" onClick={google} className="w-full rounded-full border border-foreground/30 py-3 font-medium">Continue with Google</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
