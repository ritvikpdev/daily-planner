-- Profiles (one per user)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone text not null default 'UTC',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "own profile" on profiles for all using (auth.uid() = id);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 500),
  color text not null default 'purple'
    check (color in ('purple','teal','amber','blue','coral','green')),
  icon text not null default 'target',
  status text not null default 'active'
    check (status in ('active','paused','completed','archived')),
  target_date date,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  completed_at timestamptz,
  completion_note text check (char_length(completion_note) <= 500)
);
alter table goals enable row level security;
create policy "own goals" on goals for all using (auth.uid() = user_id);

-- Recurring task templates
create table recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  goal_id uuid not null references goals on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  default_mode text not null default 'freeform'
    check (default_mode in ('freeform','structured')),
  default_start text check (default_start ~ '^[0-2][0-9]:[0-5][0-9]$'),
  default_end text check (default_end ~ '^[0-2][0-9]:[0-5][0-9]$'),
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table recurring_tasks enable row level security;
create policy "own recurring" on recurring_tasks for all using (auth.uid() = user_id);

-- Tasks (concrete checkable instances)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  goal_id uuid not null references goals on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  mode text not null default 'freeform' check (mode in ('freeform','structured')),
  planned_date date not null,
  start_time text check (start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  end_time text check (end_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  done boolean not null default false,
  done_at timestamptz,
  is_recurring boolean not null default false,
  recurring_id uuid references recurring_tasks on delete set null,
  archived boolean not null default false,
  created_at timestamptz default now(),
  check (mode = 'freeform' or (start_time is not null and end_time is not null)),
  check (end_time is null or start_time is null or end_time > start_time)
);
alter table tasks enable row level security;
create policy "own tasks" on tasks for all using (auth.uid() = user_id);
create index on tasks (user_id, planned_date);
create index on tasks (user_id, goal_id, planned_date);

-- Nightly review logs
create table logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  log_date date not null,
  wins text check (char_length(wins) <= 2000),
  blockers text check (char_length(blockers) <= 2000),
  tomorrow_focus text check (char_length(tomorrow_focus) <= 2000),
  goal_ratings jsonb,
  submitted_at timestamptz default now(),
  unique (user_id, log_date)
);
alter table logs enable row level security;
create policy "own logs" on logs for all using (auth.uid() = user_id);