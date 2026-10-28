import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_PIN, isPupilEmail, pupilEmails, pupilPassword } from "./electoral";

/** Creates the pupil's default account on first sign-in (only for listed pupil emails). */
export const ensurePupilAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => ({ email: String(d.email ?? "").trim().toLowerCase() }))
  .handler(async ({ data }) => {
    if (!isPupilEmail(data.email)) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const pupil = pupilEmails().find((p) => p.email === data.email)!;
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: pupilPassword(DEFAULT_PIN),
      email_confirm: true,
      user_metadata: { full_name: pupil.name },
    });
    if (error && !/already|registered|exists/i.test(error.message)) throw new Error(error.message);
    return { ok: true };
  });
