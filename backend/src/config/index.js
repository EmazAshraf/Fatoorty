import dotenv from 'dotenv';

dotenv.config();

/**
 * Application Configuration
 * Centralized configuration management
 */
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://devfatoorty:eKEiYVkgVatspAWu@cluster0.v5zpg6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0cls',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedDocumentTypes: ['application/pdf'],
    uploadPath: './uploads',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Email Configuration (for future use)
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Payment Configuration (for future use)
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

export default config; 