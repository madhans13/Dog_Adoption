-- Add missing columns to Dog table for full functionality
-- Run this in your PostgreSQL database

-- Add missing columns to Dog table
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS size VARCHAR(20) CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large'));
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS health_status TEXT;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS vaccination_status TEXT;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS spayed_neutered BOOLEAN;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS good_with_kids BOOLEAN;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS good_with_pets BOOLEAN;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS energy_level VARCHAR(20) CHECK (energy_level IN ('Low', 'Medium', 'High'));
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS rescue_date TIMESTAMP;
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS rescue_notes TEXT;

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

-- Add missing column to Dog table for image
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
CREATE INDEX IF NOT EXISTS idx_dog_size ON "Dog"(size);
CREATE INDEX IF NOT EXISTS idx_dog_color ON "Dog"(color);
CREATE INDEX IF NOT EXISTS idx_dog_health ON "Dog"(health_status);
CREATE INDEX IF NOT EXISTS idx_dog_vaccination ON "Dog"(vaccination_status);
CREATE INDEX IF NOT EXISTS idx_dog_spayed_neutered ON "Dog"(spayed_neutered);
CREATE INDEX IF NOT EXISTS idx_dog_good_with_kids ON "Dog"(good_with_kids);
CREATE INDEX IF NOT EXISTS idx_dog_good_with_pets ON "Dog"(good_with_pets);
CREATE INDEX IF NOT EXISTS idx_dog_energy ON "Dog"(energy_level);
CREATE INDEX IF NOT EXISTS idx_dog_rescue_date ON "Dog"(rescue_date);
CREATE INDEX IF NOT EXISTS idx_rescue_reporter ON "RescueRequest"(reporter_id);
CREATE INDEX IF NOT EXISTS idx_rescue_rescued_dog ON "RescueRequest"(rescued_dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_image ON "Dog"(imageUrl);

-- Verify the changes
SELECT 'Dog table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Dog' 
ORDER BY ordinal_position;

SELECT 'RescueRequest table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'RescueRequest' 
ORDER BY ordinal_position;
