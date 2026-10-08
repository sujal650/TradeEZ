const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Enable public DNS for Atlas SRV resolution
if (process.env.MONGODB_URI?.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (err) {
    console.warn('DNS server setting warning:', err.message);
  }
}

const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { defaultStocks, defaultUsers } = require('./seedData');

const setupMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('====================================================');
  console.log('🚀 Starting MongoDB Initial Setup & Seeding');
  console.log(`📡 Target URI: ${uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED'}`);
  console.log('====================================================');

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas cluster...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    const db = conn.connection.db;
    const dbName = conn.connection.name;
    console.log(`✅ Connected successfully to: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${dbName}`);

    // 1. Ensure Collections
    console.log('\n📦 Step 1: Initializing Collections...');
    const collections = ['users', 'stocks', 'transactions', 'portfolios'];
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const colName of collections) {
      if (!existingCollections.includes(colName)) {
        await db.createCollection(colName);
        console.log(`   + Created collection: ${colName}`);
      } else {
        console.log(`   ✓ Collection already exists: ${colName}`);
      }
    }

    // 2. Ensure Indexes
    console.log('\n🔍 Step 2: Creating Database Indexes...');
    await User.init();
    await Stock.init();
    await Transaction.init();
    await Portfolio.init();
    console.log('   ✓ Users: index on email (unique)');
    console.log('   ✓ Stocks: index on symbol (unique)');
    console.log('   ✓ Transactions: indexes on user, timestamp, status');
    console.log('   ✓ Portfolios: index on user (unique)');

    // 3. Seed Stocks
    console.log('\n📈 Step 3: Seeding Stock Listings...');
    const existingStockCount = await Stock.countDocuments();
    if (existingStockCount === 0) {
      const insertedStocks = await Stock.insertMany(defaultStocks);
      console.log(`   ✅ Seeded ${insertedStocks.length} equities into 'stocks' collection.`);
    } else {
      console.log(`   ℹ️ 'stocks' collection already has ${existingStockCount} records.`);
      // Update any missing stocks
      let added = 0;
      for (const s of defaultStocks) {
        const found = await Stock.findOne({ symbol: s.symbol });
        if (!found) {
          await Stock.create(s);
          added++;
        }
      }
      if (added > 0) {
        console.log(`   ✅ Added ${added} new stock listings.`);
      }
    }

    // 4. Seed Users and Portfolios
    console.log('\n👤 Step 4: Seeding Default Accounts & Portfolios...');
    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ email: u.email.toLowerCase() });
      if (!existingUser) {
        const newUser = await User.create(u);
        await Portfolio.create({
          user: newUser._id,
          holdings: []
        });
        console.log(`   ✅ Created ${u.role}: ${u.name} (${u.email}) [Balance: $${u.virtualBalance.toLocaleString()}]`);
      } else {
        console.log(`   ✓ User already exists: ${u.email} (${existingUser.role})`);
        // Verify portfolio exists
        const portfolio = await Portfolio.findOne({ user: existingUser._id });
        if (!portfolio) {
          await Portfolio.create({
            user: existingUser._id,
            holdings: []
          });
          console.log(`      + Initialized missing portfolio for ${existingUser.email}`);
        }
      }
    }

    // 5. Final Statistics
    console.log('\n📊 Step 5: Final MongoDB Cluster State:');
    const finalUsers = await User.countDocuments();
    const finalStocks = await Stock.countDocuments();
    const finalTrades = await Transaction.countDocuments();
    const finalPortfolios = await Portfolio.countDocuments();

    console.log('----------------------------------------------------');
    console.log(`   Users:        ${finalUsers}`);
    console.log(`   Stocks:       ${finalStocks}`);
    console.log(`   Portfolios:   ${finalPortfolios}`);
    console.log(`   Transactions: ${finalTrades}`);
    console.log('----------------------------------------------------');
    console.log('🎉 MongoDB Initial Setup Complete! All data is persisted in Atlas.');
    console.log('====================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Setup Failed:', error);
    process.exit(1);
  }
};

setupMongoDB();
