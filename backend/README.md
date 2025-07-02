# Fatoorty Backend

A Node.js and Express backend with MongoDB integration.

## Features

- Express server with middleware setup
- MongoDB connection with Mongoose ODM
- Environment variable configuration with dotenv
- JWT authentication
- MVC architecture

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middleware functions
├── models/         # Mongoose models
├── routes/         # Express routes
├── utils/          # Utility functions
├── .env            # Environment variables
├── package.json    # Project dependencies
└── server.js       # Main application file
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fatoorty
   JWT_SECRET=your_jwt_secret_key
   ```

3. Run the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/login**
  - Request: `{ "email": "user@example.com" }`
  - Response: `{ "token": "jwt_token", "user": { "id": "user_id", "name": "username", "email": "user@example.com" } }` 