-- Add telegram_bot_token to customers table for per-user bot configuration
alter table customers add column if not exists telegram_bot_token text;
