-- -------------------------------
-- User Roles Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    role text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin can select all roles
CREATE POLICY "Admins can select all roles" 
ON public.user_roles
FOR SELECT
USING (auth.role() = 'admin');

-- User can select only their own role
CREATE POLICY "Users can select own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = id);

-- -------------------------------
-- Events Table
-- -------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name text NOT NULL,
    location text NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy example: allow all authenticated users to read events
CREATE POLICY "Authenticated can read events"
ON public.events
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Optional: allow only admin to insert/update/delete events
CREATE POLICY "Admin can modify events"
ON public.events
FOR ALL
USING (auth.role() = 'admin');

-- add new column for price to events table
ALTER TABLE events ADD COLUMN price numeric(10, 2) DEFAULT 0.00;
