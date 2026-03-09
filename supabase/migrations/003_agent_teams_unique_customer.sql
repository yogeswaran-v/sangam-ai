-- Fix missing unique constraint on agent_teams.customer_id
-- Without this, upsert with onConflict:'customer_id' throws an error.
-- Each customer should have exactly one agent team.

alter table agent_teams
  add constraint agent_teams_customer_id_unique unique (customer_id);
