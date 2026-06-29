const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('Missing MONGO_URI/MONGODB_URI in backend/.env');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || undefined,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
