-- Create the profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamptz,
  username text unique,
  full_name text,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically updates the updated_at column when a profile is updated.
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_updated
  before update on profiles
  for each row execute procedure public.handle_updated_at();
