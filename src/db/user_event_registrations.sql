create table if not exists user_event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  receipt_url text, -- file URL for uploaded payment proof
  status text check (status in ('selected', 'payment_pending', 'approved', 'rejected')) default 'selected',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);