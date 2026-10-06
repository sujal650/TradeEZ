const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockez';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`✅ [Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ [Database] Could not connect to MongoDB at "${uri}": ${err.message}`);
    console.warn(`ℹ️ [Database] Running with high-performance In-Memory Data Store fallback.`);
    console.warn(`ℹ️ [Database] To connect to real MongoDB, start your local mongod or set MONGODB_URI in backend/.env to MongoDB Atlas.`);
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
