import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './src/config/index.js';
import databaseConfig from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/error/errorHandler.js';
import { cookieParserMiddleware } from './src/middleware/cookie/index.js';
import { securityLogger } from './src/middleware/securityLogger.js';

// Import routes from new structure
import restaurantRoutes from './src/routes/restaurantRoutes.js';
import superadminRoutes from './src/routes/superadminRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Load environment variables
dotenv.config();


// Connect to database
databaseConfig.connect();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3001',

    'http://localhost:3000',
    'http://127.0.0.1:3000',
'https://fatoorty-production.vercel.app',
    process.env.CORS_ORIGIN, // Add your production frontend URL here
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParserMiddleware);

// Security logging middleware (should be early in the middleware chain)
app.use(securityLogger);

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/restaurant/staff', staffRoutes);
app.use('/api/restaurant/menu', menuRoutes);
app.use('/api/restaurant/tables', tableRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Fatoory API running...');
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
