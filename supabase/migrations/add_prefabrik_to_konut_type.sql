-- Migration to add 'prefabrik' to the konut_type enum
ALTER TYPE konut_type ADD VALUE IF NOT EXISTS 'prefabrik'; 