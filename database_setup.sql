-- Dog Adoption Database Schema
-- This script creates separate tables for users, rescuers, and admins
-- Run this in your PostgreSQL database (pgAdmin or command line)

-- First, create the database if it doesn't exist
-- CREATE DATABASE dog_adoption;

-- Connect to the dog_adoption database before running the rest

-- 1. USERS TABLE (for people who want to adopt dogs)
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'rescuer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. RESCUERS TABLE (for people who rescue dogs - extends User)
CREATE TABLE IF NOT EXISTS "Rescuer" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
    organization_name VARCHAR(100),
    license_number VARCHAR(50),
    experience_years INTEGER,
    specialization TEXT, -- types of animals they specialize in
    location VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADMINS TABLE (for system administrators - extends User)
CREATE TABLE IF NOT EXISTS "Admin" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
    admin_level INTEGER DEFAULT 1, -- 1=basic admin, 2=super admin
    permissions TEXT[], -- array of permissions
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOGS TABLE (updated to work with new user structure)
CREATE TABLE IF NOT EXISTS "Dog" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    size VARCHAR(20) CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    color VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    description TEXT,
    "imageUrl" VARCHAR(255),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'rescued', 'pending')),
    is_rescue_case BOOLEAN DEFAULT false,
    health_status TEXT,
    vaccination_status TEXT,
    spayed_neutered BOOLEAN,
    good_with_kids BOOLEAN,
    good_with_pets BOOLEAN,
    energy_level VARCHAR(20) CHECK (energy_level IN ('Low', 'Medium', 'High')),
    rescuer_id INTEGER REFERENCES "User"(id),
    rescue_date TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ADOPTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS "AdoptionRequest" (
    id SERIAL PRIMARY KEY,
    dog_id INTEGER REFERENCES "Dog"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    application_data JSONB, -- store application form data
    reviewed_by INTEGER REFERENCES "User"(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RESCUE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS "RescueRequest" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    animal_type VARCHAR(50) DEFAULT 'dog',
    estimated_count INTEGER DEFAULT 1,
    contact_phone VARCHAR(20),
    image_urls TEXT[], -- array of image URLs
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_rescuer_id INTEGER REFERENCES "User"(id),
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. RESCUED DOGS TABLE (for dogs that have been rescued)
CREATE TABLE IF NOT EXISTS "RescuedDog" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    size VARCHAR(20) CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    color VARCHAR(100),
    health_status TEXT,
    description TEXT,
    rescue_notes TEXT,
    image_url VARCHAR(500),
    rescue_date TIMESTAMP NOT NULL,
    rescuer_id INTEGER REFERENCES "User"(id) NOT NULL,
    status VARCHAR(30) DEFAULT 'rescued' CHECK (status IN ('rescued', 'adopted', 'available_for_adoption')),
    rescue_request_id INTEGER REFERENCES "RescueRequest"(id),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. USER SESSIONS TABLE (for JWT token management)
CREATE TABLE IF NOT EXISTS "UserSession" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_dog_status ON "Dog"(status);
CREATE INDEX IF NOT EXISTS idx_dog_rescuer ON "Dog"(rescuer_id);
CREATE INDEX IF NOT EXISTS idx_adoption_status ON "AdoptionRequest"(status);
CREATE INDEX IF NOT EXISTS idx_rescue_status ON "RescueRequest"(status);
CREATE INDEX IF NOT EXISTS idx_rescue_location ON "RescueRequest"(location);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_status ON "RescuedDog"(status);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_rescuer ON "RescuedDog"(rescuer_id);
CREATE INDEX IF NOT EXISTS idx_rescued_dog_rescue_request ON "RescuedDog"(rescue_request_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescuer_updated_at BEFORE UPDATE ON "Rescuer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON "Admin" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dog_updated_at BEFORE UPDATE ON "Dog" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adoption_updated_at BEFORE UPDATE ON "AdoptionRequest" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescue_updated_at BEFORE UPDATE ON "RescueRequest" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescued_dog_updated_at BEFORE UPDATE ON "RescuedDog" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO "User" (first_name, last_name, email, password_hash, role) VALUES 
('Admin', 'User', 'admin@dogadoption.com', '$2b$10$example.hash.for.admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create corresponding admin record
INSERT INTO "Admin" (user_id, admin_level, permissions) 
SELECT id, 2, ARRAY['manage_users', 'manage_dogs', 'manage_rescues', 'view_analytics'] 
FROM "User" 
WHERE email = 'admin@dogadoption.com' AND NOT EXISTS (
    SELECT 1 FROM "Admin" WHERE user_id = (SELECT id FROM "User" WHERE email = 'admin@dogadoption.com')
);

-- Success message
SELECT 'Database schema created successfully! Tables: User, Rescuer, Admin, Dog, AdoptionRequest, RescueRequest, RescuedDog, UserSession' as status;
