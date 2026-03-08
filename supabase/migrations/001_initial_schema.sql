-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers (one per paying user)
create table customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  name text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'scale')),
  currency text not null default 'usd' check (currency in ('usd', 'inr')),
  telegram_chat_id text,
  whatsapp_number text,
  notification_channel text default 'telegram' check (notification_channel in ('telegram', 'whatsapp', 'email')),
  docker_container_id text,
  docker_status text default 'stopped' check (docker_status in ('running', 'stopped', 'provisioning')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent teams
create table agent_teams (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null,
  team_type text not null default 'startup_product',
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'paused')),
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- Mission Control HQ
create table mission_control (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade not null unique,
  vision text,
  mission text,
  product_requirements text,
  monetary_goals text,
  other_goals text,
  timeline text,
  updated_at timestamptz default now(),
  updated_by text default 'system' check (updated_by in ('system', 'ceo'))
);

-- Enable RLS
alter table customers enable row level security;
alter table agent_teams enable row level security;
alter table mission_control enable row level security;

-- RLS policies: customers
create policy "Users can view own customer record"
  on customers for select using (auth.uid() = user_id);

create policy "Users can update own customer record"
  on customers for update using (auth.uid() = user_id);

-- RLS policies: agent_teams
create policy "Users can view own agent teams"
  on agent_teams for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

-- RLS policies: mission_control
create policy "Users can view own mission control"
  on mission_control for select
  using (customer_id in (select id from customers where user_id = auth.uid()));

create policy "Users can update own mission control"
  on mission_control for update
  using (customer_id in (select id from customers where user_id = auth.uid()));
