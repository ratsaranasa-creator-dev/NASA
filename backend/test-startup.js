/**
 * Test script to verify backend startup and route registration
 * Run with: node test-startup.js
 */

console.log('[TEST] Starting backend startup diagnostic...\n');

// Test 1: Verify all required modules can be loaded
console.log('[TEST] 1. Testing module imports...');
try {
  require('dotenv').config();
  console.log('  ✓ dotenv');
  
  const express = require('express');
  console.log('  ✓ express');
  
  const mongoose = require('mongoose');
  console.log('  ✓ mongoose');
  
  const cloudinary = require('./config/cloudinary');
  console.log('  ✓ cloudinary config');
  
  const demarcheRoutes = require('./routes/demarcheRoutes');
  console.log('  ✓ demarcheRoutes');
  
  const demarcheController = require('./controllers/demarcheController');
  console.log('  ✓ demarcheController');
  
  const DemarcheModel = require('./models/Demarche');
  console.log('  ✓ Demarche model');
  
  console.log('\n[TEST] ✓ All modules loaded successfully!\n');
} catch (error) {
  console.error('\n[TEST] ✗ Module loading failed:', error.message);
  process.exit(1);
}

// Test 2: Verify environment variables
console.log('[TEST] 2. Checking environment variables...');
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const optionalEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

let envOk = true;
requiredEnvVars.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✓ ${key} is set`);
  } else {
    console.log(`  ✗ ${key} is MISSING`);
    envOk = false;
  }
});

optionalEnvVars.forEach(key => {
  if (process.env[key]) {
    console.log(`  ✓ ${key} is set`);
  } else {
    console.log(`  ⚠ ${key} is MISSING (optional for local, required on Render)`);
  }
});

if (!envOk) {
  console.log('\n[TEST] ✗ Critical environment variables missing\n');
  process.exit(1);
}

console.log('\n[TEST] ✓ Environment variables OK\n');

// Test 3: Verify controller exports
console.log('[TEST] 3. Checking controller exports...');
const demarcheController = require('./controllers/demarcheController');
const requiredFunctions = ['getDemarches', 'getDemarcheById', 'createDemarche', 'updateDemarche', 'deleteDemarche', 'uploadDocument'];

let controllerOk = true;
requiredFunctions.forEach(func => {
  if (typeof demarcheController[func] === 'function') {
    console.log(`  ✓ ${func} exported`);
  } else {
    console.log(`  ✗ ${func} NOT exported`);
    controllerOk = false;
  }
});

if (!controllerOk) {
  console.log('\n[TEST] ✗ Some controller functions are missing\n');
  process.exit(1);
}

console.log('\n[TEST] ✓ All controller functions exported\n');

// Test 4: Quick syntax check by creating app instance
console.log('[TEST] 4. Testing Express app setup...');
try {
  const express = require('express');
  const app = express();
  
  // Simulate index.js setup
  const demarcheRoutes = require('./routes/demarcheRoutes');
  app.use('/api/demarches', demarcheRoutes);
  
  console.log('  ✓ Express app created');
  console.log('  ✓ Routes registered\n');
} catch (error) {
  console.error('\n[TEST] ✗ App setup failed:', error.message, '\n');
  process.exit(1);
}

console.log('[TEST] ✓ All diagnostic tests passed!\n');
console.log('[TEST] Ready to start: npm start');
console.log('[TEST] or: node index.js\n');
