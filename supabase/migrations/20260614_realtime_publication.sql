-- Enable real-time for chat_messages so postgres_changes subscriptions work
alter publication supabase_realtime add table chat_messages;
