-- Migration to add apartments_per_floor column to konut_details table
ALTER TABLE konut_details ADD COLUMN IF NOT EXISTS apartments_per_floor INTEGER;

-- Update existing bina records to have a default value
UPDATE konut_details
SET apartments_per_floor = 2
FROM listings
WHERE konut_details.listing_id = listings.id
AND konut_details.konut_type = 'bina'
AND konut_details.apartments_per_floor IS NULL; 