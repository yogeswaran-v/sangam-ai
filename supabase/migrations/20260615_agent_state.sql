-- Agent memory: one row per (customer, agent), persisted between runs
create table agent_state (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade not null,
  agent_name text not null,
  last_action_at timestamptz,
  last_seen_message_at timestamptz,
  last_seen_approval_at timestamptz,
  last_seen_card_at timestamptz,
  current_focus text,
  waiting_on_approval_id uuid references approval_requests(id) on delete set null,
  last_event_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(customer_id, agent_name)
);

create index idx_agent_state_customer_id on agent_state(customer_id);

alter table agent_state enable row level security;

create policy "Customer can view own agent state"
  on agent_state for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- Service role (worker) has full access
create policy "Service role all on agent state"
  on agent_state for all
  using (true)
  with check (true);
