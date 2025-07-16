-- Migration to add 'Prefabrik' to the konut_type enum
ALTER TYPE konut_type ADD VALUE IF NOT EXISTS 'Prefabrik'; 