-- Create customers table for real estate portal
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact TEXT NOT NULL,
    needs TEXT NOT NULL,
    property_type TEXT,
    budget_range TEXT,
    preferred_location TEXT,
    timeline TEXT,
    additional_details TEXT,
    industry TEXT,
    zipcode TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create an index on submitted_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_customers_submitted_at ON customers(submitted_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for the form)
CREATE POLICY "Allow public inserts" ON customers
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policy to allow anyone to read (for the API)
CREATE POLICY "Allow public reads" ON customers
    FOR SELECT
    TO public
    USING (true);

-- Optional: Add comments for documentation
COMMENT ON TABLE customers IS 'Stores real estate inquiry submissions from the portal';
COMMENT ON COLUMN customers.id IS 'Unique identifier for each customer inquiry';
COMMENT ON COLUMN customers.name IS 'Customer full name';
COMMENT ON COLUMN customers.email IS 'Customer email address';
COMMENT ON COLUMN customers.contact IS 'Customer phone number';
COMMENT ON COLUMN customers.needs IS 'Detailed real estate requirements';
COMMENT ON COLUMN customers.property_type IS 'Type of property (Residential, Commercial, Industrial, Land)';
COMMENT ON COLUMN customers.budget_range IS 'Price range preference';
COMMENT ON COLUMN customers.preferred_location IS 'Desired location or area';
COMMENT ON COLUMN customers.timeline IS 'When property is needed';
COMMENT ON COLUMN customers.additional_details IS 'Extra requirements or notes';
COMMENT ON COLUMN customers.industry IS 'Customer industry (Home Health and Hospice, Finance, Insurance, Handyman Services)';
COMMENT ON COLUMN customers.zipcode IS 'Customer zip code';
COMMENT ON COLUMN customers.submitted_at IS 'Timestamp when inquiry was submitted';

