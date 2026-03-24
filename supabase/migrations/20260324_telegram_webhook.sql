-- Add telegram_webhook_active flag to customers
alter table customers
  add column if not exists telegram_webhook_active boolean default false;
