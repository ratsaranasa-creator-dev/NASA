const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI or MONGO_URI environment variable. Configure MongoDB Atlas URI in Render Environment Variables.');
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
    throw err;
  }
};

module.exports = { connectDB };
