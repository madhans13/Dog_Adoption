-- Check all users in the database
SELECT id, first_name, last_name, email, role, created_at 
FROM "User" 
ORDER BY created_at DESC;

-- To upgrade any user to admin, use:
-- UPDATE "User" SET role = 'admin' WHERE email = 'your_email@example.com';
