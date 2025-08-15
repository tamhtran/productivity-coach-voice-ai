-- Create the messages table
create table messages (
  id bigserial primary key,
  created_at timestamptz default now() not null,
  user_id uuid references auth.users not null,
  role text not null,
  content text not null
);

-- Set up Row Level Security (RLS)
alter table messages
  enable row level security;

-- Create policies for messages
create policy "Users can view their own messages." on messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages." on messages
  for insert with check (auth.uid() = user_id);
