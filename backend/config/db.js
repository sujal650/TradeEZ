const mongoose = require('mongoose');
const dns = require('dns');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockez';

  // If using MongoDB Atlas SRV URI, ensure reliable DNS resolution
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (dnsErr) {
      console.warn('[Database] Could not set custom DNS servers:', dnsErr.message);
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
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
