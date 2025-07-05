-- Ceyhun Emlak Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for dropdown selections
CREATE TYPE property_type AS ENUM (
  'konut', 'ticari', 'arsa', 'vasita'
);

CREATE TYPE konut_type AS ENUM (
  'daire', 'villa', 'mustakil_ev', 'bina'
);

CREATE TYPE ticari_type AS ENUM (
  'dukkan', 'depo', 'villa', 'fabrika', 'atolye', 'plaza', 'bina', 'ofis', 'cafe', 'bufe'
);

CREATE TYPE arsa_type AS ENUM (
  'tarla', 'bahce', 'konut_imarli', 'ticari_imarli'
);

CREATE TYPE vasita_type AS ENUM (
  'otomobil', 'suv', 'atv', 'utv', 'van', 'motosiklet', 'bisiklet', 'ticari'
);

CREATE TYPE listing_status AS ENUM (
  'satilik', 'kiralik'
);

CREATE TYPE room_count AS ENUM (
  '1+0', '1+1', '1+1.5', '2+1', '3+1', '4+1', '5+1', '5+2', '6+1', '6+2', '7+1', '7+2', '8+1'
);

CREATE TYPE heating_type AS ENUM (
  'dogalgaz', 'soba', 'merkezi', 'yok'
);

CREATE TYPE fuel_type AS ENUM (
  'benzin', 'dizel', 'lpg', 'elektrik', 'hibrit'
);

CREATE TYPE transmission_type AS ENUM (
  'manuel', 'otomatik', 'yarı_otomatik'
);

-- Main listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  property_type property_type NOT NULL,
  listing_status listing_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0
);

-- Konut details table
CREATE TABLE konut_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  konut_type konut_type NOT NULL,
  gross_sqm NUMERIC NOT NULL,
  net_sqm NUMERIC NOT NULL,
  room_count room_count NOT NULL,
  building_age INTEGER NOT NULL,
  floor INTEGER NOT NULL,
  total_floors INTEGER NOT NULL,
  heating heating_type,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_elevator BOOLEAN DEFAULT FALSE,
  is_furnished BOOLEAN DEFAULT FALSE,
  allows_trade BOOLEAN DEFAULT FALSE,
  is_eligible_for_credit BOOLEAN DEFAULT FALSE
);

-- Ticari details table
CREATE TABLE ticari_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  ticari_type ticari_type NOT NULL,
  gross_sqm NUMERIC NOT NULL,
  net_sqm NUMERIC,
  room_count INTEGER NOT NULL,
  building_age INTEGER NOT NULL,
  floor INTEGER,
  total_floors INTEGER,
  heating heating_type,
  allows_trade BOOLEAN DEFAULT FALSE,
  is_eligible_for_credit BOOLEAN DEFAULT FALSE
);

-- Arsa details table
CREATE TABLE arsa_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  arsa_type arsa_type NOT NULL,
  sqm NUMERIC NOT NULL,
  kaks NUMERIC,
  allows_trade BOOLEAN DEFAULT FALSE,
  is_eligible_for_credit BOOLEAN DEFAULT FALSE
);

-- Vasita details table
CREATE TABLE vasita_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  vasita_type vasita_type NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  sub_model VARCHAR(100) NOT NULL,
  kilometer INTEGER NOT NULL,
  fuel_type fuel_type NOT NULL,
  transmission transmission_type,
  color VARCHAR(50),
  has_warranty BOOLEAN DEFAULT FALSE,
  has_damage_record BOOLEAN DEFAULT FALSE,
  allows_trade BOOLEAN DEFAULT FALSE
);

-- Address table (for all property types except vasita)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  province VARCHAR(50) DEFAULT 'Tokat',
  district VARCHAR(50) DEFAULT 'Merkez',
  neighborhood VARCHAR(100) NOT NULL,
  full_address TEXT
);

-- Images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  cloudinary_id VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_listings_property_type ON listings(property_type);
CREATE INDEX idx_listings_status ON listings(listing_status);
CREATE INDEX idx_listings_active ON listings(is_active);
CREATE INDEX idx_konut_room_count ON konut_details(room_count);
CREATE INDEX idx_addresses_district ON addresses(district);
CREATE INDEX idx_addresses_neighborhood ON addresses(neighborhood);

-- Create RLS policies
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE konut_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticari_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE arsa_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE vasita_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only)
CREATE POLICY "Public can view active listings" 
  ON listings FOR SELECT 
  USING (is_active = TRUE);

-- Create policies for authenticated users (admin)
CREATE POLICY "Admins can do all operations" 
  ON listings FOR ALL 
  USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Public can view konut details" 
  ON konut_details FOR SELECT 
  USING (TRUE);

CREATE POLICY "Public can view ticari details" 
  ON ticari_details FOR SELECT 
  USING (TRUE);

CREATE POLICY "Public can view arsa details" 
  ON arsa_details FOR SELECT 
  USING (TRUE);

CREATE POLICY "Public can view vasita details" 
  ON vasita_details FOR SELECT 
  USING (TRUE);

CREATE POLICY "Public can view addresses" 
  ON addresses FOR SELECT 
  USING (TRUE);

CREATE POLICY "Public can view images" 
  ON images FOR SELECT 
  USING (TRUE);

-- Create functions for tracking views and contacts
CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_contact_count(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE listings
  SET contact_count = contact_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_listings_modtime
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column(); 