# Real Estate Portal API Endpoints for Postman

**Base URL:** `http://localhost:8000`

---

## 1. Get All Property Inquiries

**Method:** `GET`  
**URL:** `http://localhost:8000/api/inquiries`  
**Headers:** None required

**Example Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+1234567890",
      "needs": "Looking for apartment",
      "property_type": "Residential",
      "budget_range": "$500K-$1M",
      "preferred_location": "Downtown",
      "timeline": "1-3 months",
      "additional_details": "Must have parking",
      "submitted_at": "2025-10-29T12舊:00:00Z"
    }
  ]
}
```

---

## 2. Get Specific Inquiry by ID

**Method:** `GET`  
**URL:** `http://localhost:8000/api/inquiries/:id`  
**Example:** `http://localhost:8000/api/inquiries/1`  
**Headers:** None required

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

---

## 3. Create New Property Inquiry

**Method:** `POST`  
**URL:** `http://localhost:8000/api/inquiries`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "contact": "+1234567890",
  "needs": "Looking for a commercial space for retail business",
  "property_type": "Commercial",
  "budget_range": "$100K-$500K",
  "preferred_location": "Business District",
  "timeline": "1-3 months",
  "additional_details": "High foot traffic area required"
}
```

**Required Fields:**
- `name` (string, required)
- `email` (string, required, valid email format)
- `contact` (string, required)
- `needs` (string, required)

**Optional Fields:**
- `property_type` (string)
- `budget_range` (string)
- `preferred_location` (string)
- `timeline` (string)
- `additional_details` (string)

**Example Response:**
```json
{
  "success": true,
  "message": "Property inquiry created successfully",
  "data": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane@example.com",
    ...
    "submitted_at": "2025-10-29T13:00:00Z"
  }
}
```

---

## 4. Delete Inquiry by ID

**Method:** `DELETE`  
**URL:** `http://localhost:8000/api/inquiries/:id`  
**Example:** `http://localhost:8000/api/inquiries/1`  
**Headers:** None required

**Example Response:**
```json
{
  "success": true,
  "message": "Inquiry deleted successfully",
  "data": {
    "id": 1,
    ...
  }
}
```

---

## 5. API Documentation

**Method:** `GET`  
**URL:** `http://localhost:8000/api`  
**Headers:** None required

**Example Response:**
```json
{
  "message": "Real Estate Portal API Server",
  "version": "1.0.0",
  "endpoints": {
    "GET /api/inquiries": "Get all property inquiries",
    "GET /api/inquiries/:id": "Get a specific inquiry by ID",
    "POST cattail/api/inquiries": "Create a new property inquiry",
    "DELETE /api/inquiries/:id": "Delete an inquiry by ID"
  }
}
```

---

## Postman Collection Setup

### Creating a Postman Collection:

1. **Create New Collection:** "Real Estate Portal API"

2. **Add Environment Variables:**
   - `base_url`: `http://localhost:8000`
   - `inquiry_id`: `1` (for testing)

3. **Use Variables in URLs:**
   - `{{base_url}}/api/inquiries`
   - `{{base_url}}/api/inquiries/{{inquiry_id}}`

### Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: name, email, contact, and Authare required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Inquiry not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Database error message"
}
```

