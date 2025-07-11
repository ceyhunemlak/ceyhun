-- Add tapu_durumu enum type
CREATE TYPE tapu_durumu AS ENUM (
  'hisseli_tapu',
  'kat_mulkiyeti',
  'kat_irtifaki',
  'mustakil_tapulu'
);

-- Add tapu_durumu column to arsa_details table as nullable
ALTER TABLE arsa_details ADD COLUMN tapu_durumu tapu_durumu NULL; 