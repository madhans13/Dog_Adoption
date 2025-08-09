-- Dog Adoption Multi-User Database Schema

-- Users table (handles all user types)
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    role VARCHAR(20) CHECK (role IN ('user', 'rescuer', 'admin')) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Update existing Dog table
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS rescuer_id INTEGER REFERENCES "User"(id);
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('available', 'adopted', 'pending', 'rescued')) DEFAULT 'available';
ALTER TABLE "Dog" ADD COLUMN IF NOT EXISTS is_rescue_case BOOLEAN DEFAULT FALSE;

-- Adoption Requests table
CREATE TABLE "AdoptionRequest" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(id),
    dog_id INTEGER NOT NULL REFERENCES "Dog"(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
    message TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES "User"(id)
);

-- Rescue Requests table (users can report dogs that need rescue)
CREATE TABLE "RescueRequest" (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES "User"(id),
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    dog_description TEXT NOT NULL,
    urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(20) CHECK (status IN ('reported', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'reported',
    assigned_rescuer_id INTEGER REFERENCES "User"(id),
    contact_info TEXT,
    image_urls TEXT[], -- Array of image URLs
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_dog_status ON "Dog"(status);
CREATE INDEX idx_dog_location ON "Dog"(location);
CREATE INDEX idx_adoption_user ON "AdoptionRequest"(user_id);
CREATE INDEX idx_adoption_dog ON "AdoptionRequest"(dog_id);
CREATE INDEX idx_rescue_location ON "RescueRequest"(latitude, longitude);
CREATE INDEX idx_rescue_status ON "RescueRequest"(status);

-- Insert default admin user
INSERT INTO "User" (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role
) VALUES (
    'admin@dogadoption.com',
    '$2b$10$defaulthash', -- You'll need to hash this properly
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;
