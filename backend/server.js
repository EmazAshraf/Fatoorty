import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './src/config/index.js';
import databaseConfig from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/error/errorHandler.js';

// Import routes from new structure
import authRoutes from './src/routes/authRoutes.js';
import superadminAuthRoutes from './src/routes/superadminAuthRoutes.js';
import restaurantAuthRoutes from './src/routes/restaurantAuthRoutes.js';
import restaurantStatusRoutes from './src/routes/restaurantStatusRoutes.js';
import superadminRoutes from './src/routes/superadminRoutes.js';
import restaurantRoutes from './src/routes/restaurantRoutes.js';
import restaurantOwnerRoutes from './src/routes/restaurantOwnerRoutes.js';
import superadminDashboardRoutes from './src/routes/superadminDashboardRoutes.js';
import verificationRoutes from './src/routes/verificationRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';

// Load environment variables
dotenv.config();
console.log('process.env.MONGODB_URI', process.env.MONGODB_URI);
console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);

// Connect to database
databaseConfig.connect();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant/auth', restaurantAuthRoutes);
app.use('/api/restaurant-owner', restaurantOwnerRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/restaurant', restaurantStatusRoutes);
app.use('/api/restaurant/staff', staffRoutes);
app.use('/api/superadmin/auth', superadminAuthRoutes);
app.use('/api/superadmin/dashboard', superadminDashboardRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/verification', verificationRoutes);
app.use('/api/files', fileRoutes);

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
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app; 