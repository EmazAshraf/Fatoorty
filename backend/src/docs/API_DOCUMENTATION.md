# 🚀 Fatoorty API Documentation

## 📋 Overview

This document provides comprehensive documentation for the Fatoorty backend API, which has been refactored with a clean, modular architecture.

## 🏗️ Architecture

### Directory Structure
```
backend/src/
├── config/           # Configuration files
├── middleware/       # Middleware (auth, error, upload)
├── services/         # Business logic layer
├── controllers/      # Request handlers
├── routes/          # Route definitions
├── utils/           # Utility functions
└── docs/            # Documentation
```

### Key Components

#### 1. Configuration (`config/`)
- **`index.js`**: Centralized application configuration
- **`database.js`**: Database connection and management

#### 2. Middleware (`middleware/`)
- **`auth/`**: Authentication and authorization
- **`error/`**: Error handling and custom error classes
- **`upload/`**: File upload handling

#### 3. Services (`services/`)
- **`authService.js`**: Authentication business logic
- **`restaurantService.js`**: Restaurant management logic
- **`staffService.js`**: Staff management logic

#### 4. Controllers (`controllers/`)
- Request handlers that use services and return responses
- Organized by domain (auth, restaurant, staff, etc.)

#### 5. Routes (`routes/`)
- Route definitions organized by feature
- Use middleware for authentication and validation

## 🔐 Authentication

### User Types
1. **User**: General users (customers)
2. **Restaurant Owner**: Restaurant managers
3. **Superadmin**: System administrators

### Authentication Flow
1. User provides credentials
2. System validates and generates JWT token
3. Token includes user type and session ID
4. Subsequent requests use Bearer token authentication

## 📡 API Endpoints

### Authentication Routes

#### User Authentication
- `POST /api/auth/login` - User login

#### Superadmin Authentication
- `POST /api/superadmin/auth/login` - Superadmin login

#### Restaurant Owner Authentication
- `POST /api/restaurant/auth/login` - Restaurant owner login

### Restaurant Management

#### Restaurant Owner Routes
- `GET /api/restaurant-owner/profile` - Get owner profile
- `PUT /api/restaurant-owner/profile` - Update owner profile

#### Restaurant Routes
- `GET /api/restaurant/profile` - Get restaurant profile
- `PUT /api/restaurant/profile` - Update restaurant profile
- `GET /api/restaurant/status` - Get restaurant status

### Staff Management
- `GET /api/restaurant/staff` - Get all staff
- `POST /api/restaurant/staff` - Add new staff
- `PUT /api/restaurant/staff/:id` - Update staff
- `DELETE /api/restaurant/staff/:id` - Delete staff

### Superadmin Management
- `GET /api/superadmin` - Get all superadmins
- `POST /api/superadmin` - Create superadmin
- `PUT /api/superadmin/profile` - Update superadmin profile

### Superadmin Dashboard
- `GET /api/superadmin/dashboard/stats` - Get dashboard statistics
- `GET /api/superadmin/dashboard/recent-orders` - Get recent orders
- `GET /api/superadmin/dashboard/top-restaurants` - Get top restaurants

### File Management
- `POST /api/files/upload/restaurant-icon` - Upload restaurant icon
- `POST /api/files/upload/gov-id` - Upload government ID
- `POST /api/files/upload/staff-image` - Upload staff image
- `GET /api/files/restaurant-icon/:filename` - Get restaurant icon
- `GET /api/files/gov-id/:filename` - Get government ID
- `GET /api/files/staff/:filename` - Get staff image

## 🔧 Error Handling

### Custom Error Classes
- `AppError`: Base error class
- `ValidationError`: Input validation errors
- `AuthenticationError`: Authentication failures
- `AuthorizationError`: Authorization failures
- `NotFoundError`: Resource not found
- `ConflictError`: Resource conflicts

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## 📁 File Upload

### Supported File Types
- **Images**: JPEG, PNG, JPG
- **Documents**: PDF

### File Size Limits
- Maximum file size: 5MB

### Upload Endpoints
- Restaurant icons: `/api/files/upload/restaurant-icon`
- Government IDs: `/api/files/upload/gov-id`
- Staff images: `/api/files/upload/staff-image`

## 🛡️ Security Features

### JWT Authentication
- Secure token-based authentication
- Session management with session IDs
- Token expiration handling

### Authorization
- Role-based access control
- Route-level authorization middleware
- User type validation

### File Upload Security
- File type validation
- File size limits
- Secure file storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Environment variables configured

### Installation
```bash
cd backend
npm install
```

### Environment Variables
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Running the Server
```bash
npm start
```

## 📊 Testing

### Postman Collection
Use the provided Postman collection (`Fatoorty_API_Collection.json`) for comprehensive API testing.

### Test Categories
1. Authentication testing
2. Restaurant management testing
3. Staff management testing
4. File upload testing
5. Superadmin dashboard testing

## 🔄 Migration Notes

### From Old Structure
- All routes moved to `src/routes/`
- Controllers moved to `src/controllers/`
- Business logic extracted to `src/services/`
- Middleware consolidated in `src/middleware/`
- Configuration centralized in `src/config/`

### Benefits of New Structure
- Better separation of concerns
- Improved maintainability
- Enhanced testability
- Cleaner code organization
- Centralized error handling
- Unified authentication system

## 📞 Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Review API documentation for endpoint details 