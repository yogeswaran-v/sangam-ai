-- Handoff tracking: which agent created a card, and what it's blocked by
alter table kanban_cards add column if not exists source_agent text;
alter table kanban_cards add column if not exists blocked_by uuid references kanban_cards(id) on delete set null;

-- Auto-bump updated_at on every card update so scheduler trigger (c) can detect changes
create or replace function update_kanban_card_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_kanban_cards_updated_at
  before update on kanban_cards
  for each row
  execute function update_kanban_card_timestamp();
