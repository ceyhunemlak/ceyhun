-- Migration to add 'klima' to the heating_type enum
ALTER TYPE heating_type ADD VALUE IF NOT EXISTS 'klima'; 