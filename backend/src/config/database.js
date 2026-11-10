import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the configured MONGODB_URI.
 * Throws an error if connection fails, preventing unhandled server state.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicore_db';

  // Attach connection lifecycle events
  mongoose.connection.on('connected', () => {
    console.log(`[MediCore DB] MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MediCore DB] MongoDB runtime connection error:`, err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`[MediCore DB] MongoDB disconnected.`);
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    return conn;
  } catch (error) {
    console.error(`[MediCore DB] MongoDB initial connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Disconnect from MongoDB gracefully on server shutdown.
 */
export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MediCore DB] MongoDB connection closed.');
  }
}

/**
 * Diagnostic health check utility for MongoDB.
 */
export async function checkDatabaseConnection() {
  try {
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      return {
        connected: false,
        message: `MongoDB not ready (State: ${readyState})`,
        readyState,
      };
    }

    // Ping the admin database to verify active responsiveness
    await mongoose.connection.db.admin().ping();

    return {
      connected: true,
      message: 'MongoDB connected and responsive',
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      readyState,
    };
  } catch (error) {
    return {
      connected: false,
      message: 'MongoDB ping failed',
      error: error.message,
      readyState: mongoose.connection.readyState,
    };
  }
}

export default mongoose;

