create table feedback (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  message text,
  created_at timestamptz default now()
);

alter table feedback enable row level security;

create policy "Users can insert own feedback"
  on feedback for insert with check (auth.uid() = user_id);

create policy "Service role can view all feedback"
  on feedback for select using (true);

create index idx_feedback_user_id on feedback(user_id);
create index idx_feedback_created_at on feedback(created_at);
