# Restaurant Verification System

## Overview

The Restaurant Verification System is a comprehensive backend solution designed to handle restaurant verification requests in the Fatoorty platform. It follows professional engineering practices with proper separation of concerns, validation, error handling, and performance optimization.

## Architecture

### 1. Service Layer (`src/services/verificationService.js`)
- **Purpose**: Contains all business logic for verification operations
- **Responsibilities**:
  - Database queries and data transformation
  - Business rule enforcement
  - Error handling and validation
  - Pagination and filtering logic

### 2. Controller Layer (`src/controllers/verificationController.js`)
- **Purpose**: Handles HTTP requests and responses
- **Responsibilities**:
  - Request parameter extraction and validation
  - Response formatting using standardized response handlers
  - Error handling with asyncHandler wrapper
  - Service layer orchestration

### 3. Route Layer (`src/routes/verificationRoutes.js`)
- **Purpose**: Defines API endpoints and middleware chain
- **Responsibilities**:
  - Route definition and HTTP method mapping
  - Middleware application (authentication, validation)
  - Controller method routing

### 4. Validation Layer (`src/middleware/validation/verificationValidation.js`)
- **Purpose**: Input validation and sanitization
- **Responsibilities**:
  - Request parameter validation
  - Data type and format checking
  - Business rule validation
  - Error response formatting

## API Endpoints

### Base URL: `/api/superadmin/verification`

### 1. Get Restaurant Verifications
```
GET /api/superadmin/verification
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by verification status (`all`, `pending`, `verified`, `rejected`)
- `search` (string): Search in restaurant name and address
- `sortBy` (string): Sort field (`createdAt`, `updatedAt`, `name`, `verificationStatus`)
- `sortOrder` (string): Sort order (`asc`, `desc`)
- `startDate` (string): Start date filter (YYYY-MM-DD)
- `endDate` (string): End date filter (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Restaurant verifications retrieved successfully",
  "data": [
    {
      "id": "restaurant_id",
      "name": "Restaurant Name",
      "email": "owner@email.com",
      "address": "Restaurant Address",
      "type": "fastfood",
      "verificationStatus": "pending",
      "status": "active",
      "logo": "logo_url",
      "governmentIdUrl": "gov_id_url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": "owner_id",
        "name": "Owner Name",
        "email": "owner@email.com",
        "phone": "1234567890"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Update Restaurant Verification Status
```
PATCH /api/superadmin/verification/:restaurantId
```

**Request Body:**
```json
{
  "status": "verified"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant verification status updated to verified",
  "data": {
    "id": "restaurant_id",
    "name": "Restaurant Name",
    "verificationStatus": "verified",
    "status": "active",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "owner": {
      "id": "owner_id",
      "name": "Owner Name",
      "email": "owner@email.com",
      "phone": "1234567890"
    }
  }
}
```

### 3. Bulk Update Verification Status
```
PATCH /api/superadmin/verification/bulk
```

**Request Body:**
```json
{
  "restaurantIds": ["id1", "id2", "id3"],
  "status": "verified"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk update completed: 3 restaurants updated",
  "data": {
    "success": true,
    "updatedCount": 3,
    "totalCount": 3
  }
}
```

### 4. Get Verification Statistics
```
GET /api/superadmin/verification/stats
```

**Response:**
```json
{
  "success": true,
  "message": "Verification statistics retrieved successfully",
  "data": {
    "totalRestaurants": 150,
    "pendingVerifications": 25,
    "verifiedRestaurants": 100,
    "rejectedVerifications": 25
  }
}
```

### 5. Get Restaurant Verification Details
```
GET /api/superadmin/verification/:restaurantId/details
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant verification details retrieved successfully",
  "data": {
    "id": "restaurant_id",
    "name": "Restaurant Name",
    "email": "owner@email.com",
    "address": "Restaurant Address",
    "type": "fastfood",
    "verificationStatus": "pending",
    "status": "active",
    "logo": "logo_url",
    "governmentIdUrl": "gov_id_url",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "owner": {
      "id": "owner_id",
      "name": "Owner Name",
      "email": "owner@email.com",
      "phone": "1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Authentication & Authorization

All verification endpoints require:
1. **Authentication**: Valid JWT token in Authorization header
2. **Authorization**: Superadmin role verification

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Error Handling

The system uses standardized error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Invalid verification status. Must be one of: pending, verified, rejected"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication failed"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

## Performance Features

### 1. Pagination
- Efficient database queries with skip/limit
- Metadata calculation for frontend pagination
- Configurable page size (max 100 items)

### 2. Filtering & Search
- MongoDB text search on restaurant name and address
- Date range filtering with proper indexing
- Status-based filtering

### 3. Sorting
- Multiple sort fields supported
- Configurable sort order
- Database-level sorting for performance

### 4. Data Transformation
- Lean queries for reduced memory usage
- Selective field population
- Frontend-optimized data structure

## Security Features

### 1. Input Validation
- Comprehensive parameter validation
- SQL injection prevention
- XSS protection through proper escaping

### 2. Authentication
- JWT token verification
- Token expiration handling
- Secure token storage

### 3. Authorization
- Role-based access control
- Superadmin-only endpoints
- Request validation

### 4. Error Handling
- No sensitive information in error messages
- Proper error logging
- Graceful error recovery

## Database Schema

### Restaurant Model
```javascript
{
  ownerId: ObjectId (ref: RestaurantOwner),
  name: String (required),
  logo: String,
  type: String (enum: ['fastfood', 'fine-dining', 'cafe', 'buffet', 'home-kitchen']),
  rating: Number (default: 0),
  status: String (enum: ['active', 'suspended'], default: 'active'),
  address: String (required),
  verificationGovIdUrl: String,
  verificationStatus: String (enum: ['pending', 'verified', 'rejected'], default: 'pending'),
  isDeleted: Boolean (default: false),
  timestamps: true
}
```

## Usage Examples

### Frontend Integration

```javascript
// Get paginated verifications
const verifications = await apiService.getRestaurantVerifications({
  page: 1,
  limit: 10,
  status: 'pending',
  search: 'restaurant',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Update verification status
await apiService.updateVerificationStatus('restaurant_id', 'verified');

// Bulk update
await apiService.bulkUpdateVerificationStatus(['id1', 'id2'], 'rejected');
```

### Error Handling

```javascript
try {
  const result = await apiService.updateVerificationStatus('invalid_id', 'verified');
} catch (error) {
  console.error('Verification update failed:', error.message);
  // Handle error appropriately
}
```

## Testing

The system includes comprehensive validation and error handling for:
- Invalid restaurant IDs
- Invalid verification statuses
- Missing required fields
- Authentication failures
- Authorization failures
- Database connection issues

## Future Enhancements

1. **Audit Logging**: Track all verification status changes
2. **Email Notifications**: Notify restaurant owners of status changes
3. **Advanced Filtering**: More sophisticated search and filter options
4. **Batch Processing**: Handle large-scale verification updates
5. **Analytics**: Detailed verification metrics and reporting 