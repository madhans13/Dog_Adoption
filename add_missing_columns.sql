-- Add missing columns to existing RescueRequest table
-- Run this if you have an existing database

-- Add missing columns to RescueRequest table
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS rescue_completion_notes TEXT;
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS rescue_photo_url VARCHAR(255);
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS rescued_dog_id INTEGER REFERENCES "Dog"(id);
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS reporter_id INTEGER REFERENCES "User"(id);
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS dog_description TEXT;
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE "RescueRequest" ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add missing column to Dog table
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS imageUrl VARCHAR(255);

-- Update existing records to have proper data
UPDATE "RescueRequest" 
SET reporter_id = user_id 
WHERE reporter_id IS NULL AND user_id IS NOT NULL;

UPDATE "RescueRequest" 
SET dog_description = description 
WHERE dog_description IS NULL AND description IS NOT NULL;

UPDATE "RescueRequest" 
SET contact_info = contact_phone 
WHERE contact_info IS NULL AND contact_phone IS NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_rescue_reporter ON "RescueRequest"(reporter_id);
CREATE INDEX IF NOT EXISTS idx_rescue_rescued_dog ON "RescueRequest"(rescued_dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_image ON "Dog"(imageUrl);
