const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const seedAdmin = require('./config/seed');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL;
const UPLOADS_PATH = path.join(__dirname, 'uploads');

const allowedOrigins = [
  'http://localhost:3000',
  FRONTEND_URL,
];

const log = (...messages) => console.log('[backend]', ...messages);

process.on('uncaughtException', (error) => {
  console.error('[backend][FATAL] Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[backend][FATAL] Unhandled Rejection:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
  log('Created uploads directory at', UPLOADS_PATH);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      /https:\/\/.*\.vercel\.app$/.test(origin) ||
      /https:\/\/.*\.vercel\.dev$/.test(origin)
    ) {
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));

// Serve uploads folder
app.use('/uploads', express.static(UPLOADS_PATH));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/culture', require('./routes/cultureRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('Dembéni API is running...');
});

const startServer = async () => {
  try {
    log('Starting backend server...');

    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      throw new Error('Missing MONGODB_URI or MONGO_URI environment variable. Configure the MongoDB Atlas URI via Render Environment Variables.');
    }

    await connectDB();
    log('MongoDB connection established successfully.');

    await seedAdmin();
    log('Seed module executed successfully.');

    const server = app.listen(PORT, () => {
      log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });

    server.on('error', (error) => {
      console.error('[backend][FATAL] Port binding error:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('[backend][ERROR] Failed to start server:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

startServer();
