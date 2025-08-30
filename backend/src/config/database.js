import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database Configuration
 * Handles MongoDB connection with proper error handling and logging
 */
class DatabaseConfig {
  constructor() {
    this.uri = process.env.MONGODB_URI || 'mongodb+srv://devfatoorty:eKEiYVkgVatspAWu@cluster0.v5zpg6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0cls';
    this.options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<mongoose.Connection>}
   */
  async connect() {
    try {
        console.log('🔄 Connecting to MongoDB...');
      const conn = await mongoose.connect(this.uri, this.options);
      
      console.log(`✅ MongoDB Connected`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return conn;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get connection status
   * @returns {string}
   */
  getConnectionStatus() {
    return mongoose.connection.readyState;
  }
}

export default new DatabaseConfig(); 