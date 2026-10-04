-- Add JSONB translations to medicines table
alter table public.medicines add column if not exists translations jsonb default '{}'::jsonb;

-- Ensure that the translations JSONB structure maps locale codes (e.g., 'ta', 'hi') 
-- to objects containing localized 'name', 'generic_name', 'description', etc.
-- Example: 
-- {
--   "ta": { "name": "பாராசிட்டமால்", "generic_name": "அசிட்டமினோஃபென்" },
--   "hi": { "name": "पैरासिटामोल", "generic_name": "एसिटामिनोफेन" }
-- }
