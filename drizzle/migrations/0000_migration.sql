CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_role AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TABLE public.electoral_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  student_name text NOT NULL,
  class_name text NOT NULL,
  stream_name text,
  age int,
  position text NOT NULL,
  experience text,
  manifesto text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_application_per_student ON public.electoral_applications(user_id) WHERE user_id IS NOT NULL;
GRANT SELECT ON public.electoral_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.electoral_applications TO authenticated;
GRANT ALL ON public.electoral_applications TO service_role;
ALTER TABLE public.electoral_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads approved" ON public.electoral_applications FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "owner reads own" ON public.electoral_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin reads all" ON public.electoral_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner inserts pending" ON public.electoral_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "owner updates pending" ON public.electoral_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "admin updates" ON public.electoral_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin deletes" ON public.electoral_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.electoral_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid NOT NULL,
  position text NOT NULL,
  application_id uuid NOT NULL REFERENCES public.electoral_applications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (voter_id, position)
);
GRANT SELECT, INSERT ON public.electoral_votes TO authenticated;
GRANT ALL ON public.electoral_votes TO service_role;
ALTER TABLE public.electoral_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own votes" ON public.electoral_votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY "cast own vote" ON public.electoral_votes FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = voter_id AND EXISTS (
    SELECT 1 FROM public.electoral_applications a
    WHERE a.id = application_id AND a.status = 'approved' AND a.position = electoral_votes.position)
);

CREATE OR REPLACE FUNCTION public.get_vote_counts()
RETURNS TABLE (application_id uuid, votes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, count(v.id) FROM public.electoral_applications a
  LEFT JOIN public.electoral_votes v ON v.application_id = a.id
  WHERE a.status = 'approved' GROUP BY a.id
$$;
GRANT EXECUTE ON FUNCTION public.get_vote_counts() TO anon, authenticated;

INSERT INTO public.electoral_applications (student_name, class_name, stream_name, age, position, experience, manifesto, status) VALUES
('Nakato Sarah Grace','P6','Blue',12,'head_prefect','Class monitor P4 and P5','I will lead by example — Action Not Words. I promise a cleaner, kinder and more disciplined KPS where every pupil''s voice is heard.','approved'),
('Ssemakula Brian Joel','P6','Red',12,'head_prefect','Debate club captain','I will be the bridge between pupils and teachers, organise monthly pupil forums and champion reading in every class.','approved'),
('Namubiru Esther','P5','Green',11,'academic_prefect','Top of class for three terms','I will start peer study groups and a weekly quiz so that every pupil improves in Maths and English.','approved'),
('Kato Ivan Mark','P5','Yellow',11,'academic_prefect','Science club member','I will make sure the library is open at break time and help pupils with homework.','approved'),
('Mukasa Daniel','P5','Blue',11,'games_sports_prefect','School football team captain','More sports days, inter-house competitions and fair chances for every pupil to play.','approved'),
('Nansubuga Faith','P4','Red',10,'games_sports_prefect','Netball team member','I will organise netball, athletics and fun games for both boys and girls.','approved'),
('Achieng Mercy','P4','Green',10,'health_sanitation','Cleanliness champion P3','Clean classrooms, clean toilets and handwashing reminders for a healthy KPS.','approved'),
('Opio Samuel','P4','Yellow',10,'ict_prefect','Computer club member','I will help pupils use computers safely and keep the computer lab tidy.','approved');