-- Chạy script này trong Supabase SQL Editor nếu muốn đồng bộ đề thi & điểm số trên nhiều thiết bị

create table if not exists public.exams (
  id text primary key,
  title text not null,
  description text default '',
  duration_minutes integer not null default 40,
  is_published boolean not null default true,
  single_questions jsonb not null default '[]'::jsonb,
  groups jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id text primary key,
  exam_id text not null references public.exams(id) on delete cascade,
  exam_title text not null,
  student_name text not null,
  student_class text default '',
  correct_count integer not null,
  total_questions integer not null default 30,
  score numeric(4,2) not null,
  elapsed_seconds integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_submissions_exam_id on public.submissions(exam_id);
create index if not exists idx_submissions_submitted_at on public.submissions(submitted_at desc);

-- Bật Row Level Security và policy đơn giản cho mô hình lớp học
alter table public.exams enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Allow public read exams" on public.exams;
create policy "Allow public read exams" on public.exams
  for select using (true);

drop policy if exists "Allow public insert/update/delete exams" on public.exams;
create policy "Allow public insert/update/delete exams" on public.exams
  for all using (true) with check (true);

drop policy if exists "Allow public read submissions" on public.submissions;
create policy "Allow public read submissions" on public.submissions
  for select using (true);

drop policy if exists "Allow public insert/delete submissions" on public.submissions;
create policy "Allow public insert/delete submissions" on public.submissions
  for all using (true) with check (true);
