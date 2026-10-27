import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Users, Vote, BarChart3, FileText, UserCircle2 } from "lucide-react";
import crest from "@/assets/kps-crest.jpg.asset.json";
import { useUser } from "@/hooks/use-electoral";

export function Crest({ className = "h-10 w-10" }: { className?: string }) {
  return <img src={crest.url} alt="Kyengera Parents School crest" className={`${className} rounded-full bg-foreground object-contain p-0.5 ring-2 ring-gold`} />;
}

const nav = [
  { to: "/", label: "Candidates", icon: Users },
  { to: "/vote", label: "Vote", icon: Vote },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/apply", label: "Apply", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  return (
    <div className="mx-auto min-h-screen max-w-xl pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/80 px-5 py-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-3">
          <Crest />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-gold">KPS Elections 2026</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Action Not Words</p>
          </div>
        </Link>
        <Link
          to={user ? "/status" : "/auth"}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-foreground"
          aria-label={user ? "My application" : "Sign in"}
        >
          <UserCircle2 className="h-6 w-6" />
        </Link>
      </header>
      <main className="px-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-4 pb-4">
        <div className="grid grid-cols-4 rounded-2xl border border-gold/40 bg-card/95 p-1.5 shadow-gold backdrop-blur">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium text-muted-foreground data-[status=active]:bg-gold-gradient data-[status=active]:text-primary-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function CandidatePhoto({ name, url, className = "" }: { name: string; url: string | null; className?: string }) {
  if (url) return <img src={url} alt={name} className={`object-cover ${className}`} />;
  const init = name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("");
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-accent to-secondary font-display text-3xl font-bold text-gold ${className}`}>
      {init}
    </div>
  );
}
