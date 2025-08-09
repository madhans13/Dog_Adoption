-- Create admin user if one doesn't exist
-- Password will be 'admin123' (hashed)

INSERT INTO "User" (
  first_name, 
  last_name, 
  email, 
  password_hash, 
  role, 
  created_at
) 
SELECT 
  'Admin',
  'User',
  'admin@dogadoption.com',
  '$2b$10$rOFbF7zM6Z8.QoE8yKJ1DO7ZkKYG5H5h1pKjvDfJN8L9mK6YwK2nW', -- admin123
  'admin',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE role = 'admin'
);

-- Also update any existing user to admin if needed
-- UPDATE "User" SET role = 'admin' WHERE email = 'your_existing_email@example.com';
