# Rescued Dogs API Setup Guide

## Overview
I've implemented a complete rescued dogs system that includes:
- Database table for storing rescued dogs
- Backend API endpoints for CRUD operations
- Frontend integration with the rescuer dashboard

## Database Setup

### Option 1: Add to existing database
Run the SQL script `add_rescued_dogs_table.sql` in your PostgreSQL database:

```bash
psql -U your_username -d your_database -f add_rescued_dogs_table.sql
```

### Option 2: Use the complete schema
If you're setting up a new database, use the updated `database_setup.sql` which now includes the RescuedDog table.

## Backend Files Created/Modified

### 1. New Controller: `backend/src/controllers/rescuedDogController.js`
- `getRescuedDogs()` - Get all rescued dogs for a rescuer
- `addRescuedDog()` - Add a new rescued dog
- `updateRescuedDogStatus()` - Update dog status
- `getRescuedDogById()` - Get specific rescued dog
- `deleteRescuedDog()` - Delete a rescued dog

### 2. New Routes: `backend/src/routes/rescuedDogRoutes.js`
- `GET /api/rescued-dogs` - Get all rescued dogs
- `POST /api/rescued-dogs` - Add new rescued dog
- `GET /api/rescued-dogs/:id` - Get specific rescued dog
- `PUT /api/rescued-dogs/:id/status` - Update status
- `DELETE /api/rescued-dogs/:id` - Delete rescued dog

### 3. Modified: `backend/src/app.js`
- Added rescued dogs routes to the main application

## API Endpoints

### Base URL: `http://localhost:5000/api/rescued-dogs`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all rescued dogs for rescuer | ✅ (Rescuer) |
| POST | `/` | Add new rescued dog | ✅ (Rescuer) |
| GET | `/:id` | Get specific rescued dog | ✅ (Rescuer) |
| PUT | `/:id/status` | Update dog status | ✅ (Rescuer) |
| DELETE | `/:id` | Delete rescued dog | ✅ (Rescuer) |

## Request/Response Examples

### Add Rescued Dog (POST)
**Request Body (FormData):**
```
name: "Buddy"
breed: "Golden Retriever"
age: "3"
gender: "Male"
size: "Large"
color: "Golden"
healthStatus: "Healthy"
description: "Friendly dog"
rescueNotes: "Found wandering"
image: [file]
rescueRequestId: "123"
location: "Downtown"
```

**Response:**
```json
{
  "success": true,
  "message": "Rescued dog added successfully",
  "rescuedDog": {
    "id": 1,
    "name": "Buddy",
    "breed": "Golden Retriever",
    "status": "rescued",
    "rescueDate": "2024-01-15T10:30:00Z"
  }
}
```

### Get Rescued Dogs (GET)
**Response:**
```json
{
  "success": true,
  "rescuedDogs": [
    {
      "id": 1,
      "name": "Buddy",
      "breed": "Golden Retriever",
      "status": "rescued",
      "rescuerName": "John Doe"
    }
  ]
}
```

## Frontend Integration

The frontend has been updated to:
- Remove development fallbacks
- Use real API endpoints
- Handle proper error responses
- Display rescued dogs in the dashboard

## Testing the API

### 1. Start your backend server
```bash
cd backend/src
npm start
```

### 2. Test with curl or Postman
```bash
# Get rescued dogs (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/rescued-dogs

# Add rescued dog (requires auth token and image file)
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "name=Buddy" \
     -F "breed=Golden Retriever" \
     -F "image=@dog_photo.jpg" \
     http://localhost:5000/api/rescued-dogs
```

## Database Schema

```sql
CREATE TABLE "RescuedDog" (
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
```

## Status Values

- `rescued` - Dog has been rescued but not ready for adoption
- `available_for_adoption` - Dog is ready to be moved to adoption table
- `adopted` - Dog has been adopted from rescue

## Security Features

- All endpoints require authentication (`authenticateToken`)
- All endpoints require rescuer role (`requireRescuer`)
- Users can only access their own rescued dogs
- Image uploads are handled securely with file validation

## Next Steps

1. **Run the database script** to create the table
2. **Restart your backend server** to load the new routes
3. **Test the API endpoints** to ensure they work
4. **Use the frontend** to add and manage rescued dogs

The system is now fully integrated and ready to use!

