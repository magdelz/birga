-- RESTART SCHEMA FROM SCRATCH
-- This ensures all previous errors are cleared

-- 1. Drop existing objects to prevent conflicts (Use CASCADE to handle dependencies like policies)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;

drop table if exists public.orders cascade;
drop table if exists public.wallets cascade;
drop table if exists public.profiles cascade;

-- 2. Create Tables
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  first_name text,
  last_name text,
  secret_key text,
  role text default 'user', -- 'user' or 'admin'
  is_2fa_enabled boolean default false,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  currency text not null,
  balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, currency)
);

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  symbol text not null,
  side text not null,
  type text not null,
  price numeric not null,
  amount numeric not null,
  total numeric not null,
  status text default 'FILLED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.orders enable row level security;

-- 4. Helper Functions

-- Function to check admin status WITHOUT triggering RLS recursion
-- SECURITY DEFINER allows this function to bypass RLS policies
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, first_name, last_name, secret_key, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'secret_key',
    'user'
  );
  
  -- Give user 0 USDT balance (changed from demo amount)
  insert into public.wallets (user_id, currency, balance)
  values (new.id, 'USDT', 0);
  
  return new;
end;
$$ language plpgsql security definer;

-- 5. Policies

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow users to insert their own profile (Critical for self-healing if profile is deleted but auth remains)
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Use the security definer function to avoid recursion
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

-- Wallets
create policy "Users can view own wallets" on public.wallets
  for select using (auth.uid() = user_id);

-- Orders
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- 6. Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();