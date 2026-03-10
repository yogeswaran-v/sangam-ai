-- Part-time agent deployments
-- CEO agent inserts here when deploying a specialist
create table if not exists part_time_deployments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade not null,
  agent_id text not null,
  task_description text,
  status text default 'active' check (status in ('active', 'completed')),
  deployed_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists part_time_deployments_customer_idx
  on part_time_deployments(customer_id, status);

-- Enable RLS
alter table part_time_deployments enable row level security;

create policy "Customers can view their own deployments"
  on part_time_deployments for select
  using (
    customer_id in (
      select id from customers where user_id = auth.uid()
    )
  );
