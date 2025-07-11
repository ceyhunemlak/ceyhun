-- Migration to add 'otobus_hatti' and 'taksi_hatti' to the ticari_type enum
ALTER TYPE ticari_type ADD VALUE IF NOT EXISTS 'otobus_hatti';
ALTER TYPE ticari_type ADD VALUE IF NOT EXISTS 'taksi_hatti'; 