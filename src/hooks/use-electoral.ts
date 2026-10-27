import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Candidate = {
  id: string;
  user_id: string | null;
  student_name: string;
  class_name: string;
  stream_name: string | null;
  age: number | null;
  position: string;
  experience: string | null;
  manifesto: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  votes: number;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

export function useCandidates(refetchInterval: number | false = false) {
  return useQuery({
    queryKey: ["candidates"],
    refetchInterval,
    queryFn: async (): Promise<Candidate[]> => {
      const [{ data: apps, error }, { data: counts }] = await Promise.all([
        supabase.from("electoral_applications").select("*").eq("status", "approved"),
        supabase.rpc("get_vote_counts"),
      ]);
      if (error) throw error;
      const map = new Map((counts ?? []).map((c) => [c.application_id, Number(c.votes)]));
      return (apps ?? [])
        .map((a) => ({ ...a, votes: map.get(a.id) ?? 0 }))
        .sort((a, b) => b.votes - a.votes);
    },
  });
}

export function useMyVotes(userId?: string) {
  return useQuery({
    queryKey: ["my-votes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("electoral_votes").select("position, application_id");
      if (error) throw error;
      return data;
    },
  });
}

export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      return !!data;
    },
  });
}
