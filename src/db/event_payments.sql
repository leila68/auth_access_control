-- Table to store user payments for events
CREATE TABLE event_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- Unique ID for payment record
    user_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE, -- Link to user
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,         -- Link to event
    receipt_url TEXT NOT NULL,                            -- URL to uploaded payment receipt
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),  -- Approval status
    notes TEXT,                                          -- Optional notes from admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger to automatically update 'updated_at' on record change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_payments_updated_at
BEFORE UPDATE ON event_payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
