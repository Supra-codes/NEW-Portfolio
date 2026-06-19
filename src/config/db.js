const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialise empty JSON databases if they don't exist
const initializeLocalDb = () => {
  const collections = ['profile', 'projects', 'skills', 'messages'];
  collections.forEach(col => {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(col === 'profile' ? {} : [], null, 2));
    }
  });
  console.log('📁 Local JSON fallback files initialized at:', DATA_DIR);
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';
  
  try {
    console.log('🔄 Attempting connection to MongoDB...');
    // Set a 3-second timeout for server selection so it doesn't hang if MongoDB isn't running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('🟢 Connected to MongoDB database successfully.');
  } catch (error) {
    console.warn('🔴 MongoDB connection failed. Entering fallback database mode.');
    console.warn(`Reason: ${error.message}`);
    isConnected = false;
    initializeLocalDb();
  }
};

const getDbState = () => {
  return {
    isConnected,
    isFallback: !isConnected,
    dataDir: DATA_DIR
  };
};

module.exports = {
  connectDB,
  getDbState
};
