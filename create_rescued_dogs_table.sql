-- Create separate RescuedDog table for rescued dogs
-- Run this in your PostgreSQL database

-- Create RescuedDog table
CREATE TABLE IF NOT EXISTS "RescuedDog" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Unknown')),
    size VARCHAR(20) CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    color VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    health_status TEXT,
    rescue_notes TEXT,
    rescue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rescuer_id INTEGER REFERENCES "User"(id),
    rescue_request_id INTEGER REFERENCES "RescueRequest"(id),
    status VARCHAR(20) DEFAULT 'rescued' CHECK (status IN ('rescued', 'available_for_adoption', 'adopted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rescued_dog_rescuer ON "RescuedDog"(rescuer_id);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_status ON "RescuedDog"(status);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_rescue_request ON "RescuedDog"(rescue_request_id);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_created ON "RescuedDog"(created_at);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_rescued_dog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rescued_dog_updated_at 
    BEFORE UPDATE ON "RescuedDog" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_rescued_dog_updated_at();

-- Verify the table creation
SELECT 'RescuedDog table created successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'RescuedDog' 
ORDER BY ordinal_position;
