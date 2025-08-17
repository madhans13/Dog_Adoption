# Rescued Dogs Setup Guide

## Overview
This guide will help you set up the separate RescuedDog table and get the rescue completion functionality working in the rescuer dashboard.

## Step 1: Create the RescuedDog Table
Run the SQL script `create_rescued_dogs_table.sql` in your PostgreSQL database:

```sql
-- Run this in pgAdmin or your database client
\i create_rescued_dogs_table.sql
```

## Step 2: Update Database Schema
If you haven't already, run the `add_dog_columns.sql` script to add missing columns to the Dog table:

```sql
-- Run this in pgAdmin or your database client
\i add_dog_columns.sql
```

## Step 3: Start the Backend Server
Make sure your backend server is running:

```bash
cd backend
npm run backend
# or
node src/server.js
```

## Step 4: Test the Functionality
1. Open the rescuer dashboard
2. Go to "Active Requests" section
3. Click "Mark Complete" on a rescue request
4. Fill out the rescue completion form
5. Submit the form

## Expected Behavior
- The rescued dog should be added to the `RescuedDog` table
- The rescue request status should be updated to 'completed'
- The rescued dog should appear in the "My Rescued Dogs" section
- You should be able to move the dog to adoption when ready

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check your `.env` file has the correct `DATABASE_URL`
   - Ensure PostgreSQL is running
   - Verify the database exists

2. **Table Not Found Error**
   - Run the `create_rescued_dogs_table.sql` script
   - Check that the table was created successfully

3. **Column Not Found Error**
   - Run the `add_dog_columns.sql` script
   - Verify all required columns exist

4. **File Upload Error**
   - Check that the `uploads` directory exists in the backend
   - Ensure proper file permissions

### Debug Steps:

1. Check the browser console for frontend errors
2. Check the backend console for server errors
3. Verify the API endpoints are responding correctly
4. Check the database for the created records

## API Endpoints

### POST /api/rescued-dogs
- Creates a new rescued dog
- Requires authentication
- Accepts multipart form data with image

### GET /api/rescued-dogs
- Retrieves all rescued dogs
- No authentication required (public endpoint)

### PUT /api/rescued-dogs/:id/status
- Updates the status of a rescued dog
- Requires authentication
- Valid statuses: 'rescued', 'available_for_adoption', 'adopted'

## Database Schema

### RescuedDog Table
- `id`: Primary key
- `name`: Dog's name
- `breed`: Dog's breed
- `age`: Dog's age
- `gender`: Dog's gender
- `size`: Dog's size (Small, Medium, Large, Extra Large)
- `color`: Dog's color
- `location`: Where the dog was rescued
- `description`: Dog's description
- `image_url`: Path to the dog's photo
- `health_status`: Current health status
- `rescue_notes`: Notes about the rescue
- `rescue_date`: When the rescue was completed
- `rescuer_id`: ID of the rescuer
- `rescue_request_id`: ID of the original rescue request
- `status`: Current status (rescued, available_for_adoption, adopted)
- `created_at`: When the record was created
- `updated_at`: When the record was last updated

## Next Steps
After setting up the rescued dogs functionality, you can:
1. Add more fields to the rescue completion form
2. Implement rescue dog search and filtering
3. Add rescue dog editing capabilities
4. Create rescue dog reports and analytics


