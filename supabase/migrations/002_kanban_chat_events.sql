-- Kanban boards
create table kanban_boards (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null unique
);

create table kanban_cards (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid references kanban_boards(id) on delete cascade not null,
  title text not null,
  description text,
  column_name text not null default 'backlog'
    check (column_name in ('backlog', 'in_progress', 'review', 'pending_approval', 'done')),
  assigned_agent text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  requires_approval boolean default false,
  approved_by_ceo boolean,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat channels
create table chat_channels (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  name text not null,
  department text not null
);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references chat_channels(id) on delete cascade not null,
  sender_name text not null,
  sender_type text not null check (sender_type in ('agent', 'ceo')),
  content text not null,
  created_at timestamptz default now()
);

-- Agent events (drives Pixel World + audit log)
create table agent_events (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  agent_name text not null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- Token usage tracking
create table token_usage (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  agent_name text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10,6) not null default 0,
  recorded_at timestamptz default now()
);

-- Approval requests
create table approval_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  card_id uuid references kanban_cards(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notification_sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table kanban_boards enable row level security;
alter table kanban_cards enable row level security;
alter table chat_channels enable row level security;
alter table chat_messages enable row level security;
alter table agent_events enable row level security;
alter table token_usage enable row level security;
alter table approval_requests enable row level security;

-- RLS policies: kanban_boards
create policy "Customer can view own kanban"
  on kanban_boards for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- RLS policies: kanban_cards
create policy "Customer can view own cards"
  on kanban_cards for select
  using (board_id in (
    select kb.id from kanban_boards kb
    join customers c on c.id = kb.customer_id
    where c.user_id = auth.uid()
  ));

create policy "Customer can update own cards"
  on kanban_cards for update
  using (board_id in (
    select kb.id from kanban_boards kb
    join customers c on c.id = kb.customer_id
    where c.user_id = auth.uid()
  ));

-- RLS policies: chat_channels
create policy "Customer can view own chat channels"
  on chat_channels for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- RLS policies: chat_messages
create policy "Customer can view own messages"
  on chat_messages for select
  using (channel_id in (
    select cc.id from chat_channels cc
    join customers c on c.id = cc.customer_id
    where c.user_id = auth.uid()
  ));

create policy "Customer can insert own messages"
  on chat_messages for insert
  with check (channel_id in (
    select cc.id from chat_channels cc
    join customers c on c.id = cc.customer_id
    where c.user_id = auth.uid()
  ));

-- RLS policies: agent_events
create policy "Customer can view own events"
  on agent_events for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- RLS policies: token_usage
create policy "Customer can view own usage"
  on token_usage for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- RLS policies: approval_requests
create policy "Customer can view own approvals"
  on approval_requests for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- Performance indexes
create index idx_kanban_cards_board_id on kanban_cards(board_id);
create index idx_kanban_cards_column on kanban_cards(column_name);
create index idx_chat_messages_channel_id on chat_messages(channel_id);
create index idx_chat_messages_created_at on chat_messages(created_at);
create index idx_agent_events_customer_id on agent_events(customer_id);
create index idx_agent_events_created_at on agent_events(created_at);
create index idx_token_usage_customer_id on token_usage(customer_id);
create index idx_token_usage_recorded_at on token_usage(recorded_at);
