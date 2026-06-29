const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB } = require('./config/db');
const seedAdmin = require('./config/seed');

const app = express();
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(morgan('dev'));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Seed admin and initial data
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
