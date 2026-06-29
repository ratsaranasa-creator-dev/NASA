const mongoose = require('mongoose');

// Default Atlas connection (used only if no env var is set)
const DEFAULT_ATLAS_URI = 'mongodb://ac-u8ouxbz-shard-00-01.ppsupn2.mongodb.net,ac-u8ouxbz-shard-00-00.ppsupn2.mongodb.net,ac-u8ouxbz-shard-00-02.ppsupn2.mongodb.net/?tls=true&authMechanism=MONGODB-X509&authSource=%24external&maxIdleTimeMS=45000&minPoolSize=0&replicaSet=atlas-puq8s0-shard-0&compressors=zlib';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_ATLAS_URI;

  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn('[backend] No MONGODB_URI or MONGO_URI env var found. Falling back to provided DEFAULT_ATLAS_URI.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || undefined,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log(`[backend] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[backend] Unable to connect to MongoDB Atlas:', err.message);
    console.error('[backend] Tried URI:', mongoUri.substring(0, 80) + '...');
    throw err;
  }
};

module.exports = { connectDB };
